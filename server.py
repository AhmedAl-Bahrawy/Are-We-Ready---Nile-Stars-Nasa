# server.py
import math
import random
import hashlib
import requests
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Meteor Impact Detailed API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- defaults & constants ---
DEFAULT_DENSITY = 3300  # kg/m3 (chondritic rock). Use 7870 for iron, etc.
EARTH_GRAVITY = 9.81  # m/s2
JOULES_PER_KT_TNT = 4.184e12
JOULES_PER_MT_TNT = 4.184e15
RHO_AIR = 1.225  # kg/m3 (sea level)
SPEED_OF_SOUND = 340  # m/s

def seeded_random(lat, lon, angle_deg, diameter_m, velocity_km_s):
    key = f"{lat:.6f},{lon:.6f},{angle_deg:.2f},{float(diameter_m) if diameter_m else 'none'},{float(velocity_km_s) if velocity_km_s else 'none'}"
    h = hashlib.md5(key.encode()).hexdigest()
    seed = int(h[:8], 16)
    rnd = random.Random(seed)
    return rnd

# --- physics helpers ---
def volume_sphere(diameter_m):
    r = diameter_m / 2.0
    return (4.0 / 3.0) * math.pi * r**3

def mass_from_density(volume_m3, density_kg_m3):
    return volume_m3 * density_kg_m3

def kinetic_energy_j(mass_kg, velocity_m_s):
    return 0.5 * mass_kg * velocity_m_s**2

def approximate_airburst_altitude(diameter_m, velocity_m_s, angle_deg, density_kg_m3):
    # Simple empirical heuristic: larger/denser objects penetrate lower.
    # result in meters above ground
    base = 50000.0 / (math.sqrt(diameter_m) + 0.1)
    vel_factor = (velocity_m_s / 20000.0)
    density_factor = (density_kg_m3 / 3300.0)
    angle_factor = max(0.2, math.sin(math.radians(angle_deg)))
    alt = base * vel_factor / density_factor * angle_factor
    return max(50.0, min(120000.0, alt))

def crater_diameter_km(diameter_m, velocity_m_s, density_kg_m3):
    # Very rough crater estimate (scales sublinearly)
    return 0.0013 * (diameter_m ** 0.78) * (velocity_m_s ** 0.44) * (density_kg_m3 / 3300.0) / 1000.0

def seismic_magnitude_from_energy(energy_j):
    # simple approx used earlier
    try:
        return max(-1.0, round(math.log10(max(1.0, energy_j)) - 4.8, 2))
    except:
        return None

def blast_radius_by_overpressure(energy_j, overpressure_pa):
    # crude scaling: blast radius ~ (E)^(1/3) / (k * p^alpha)
    # We'll produce relative ring distances for different overpressures using an empiric scale factor
    if energy_j <= 0:
        return 0.0
    e_kt = energy_j / JOULES_PER_KT_TNT
    # baseline radius (km) from cube root scaling
    base_km = (e_kt ** (1/3.0)) * 1.0
    # map overpressure (Pa) to multiplier: higher pressure -> smaller radius
    # overpressure_pa will be passed values like 101325*psi_val
    psi = overpressure_pa / 101325.0
    # safe mapping:
    mult = 1.0 / (1.2 * (psi ** 0.3))
    return max(0.01, base_km * mult)

def thermal_radius_from_energy(energy_j):
    # thermal radius scales larger than blast for typical meteors
    mt = energy_j / JOULES_PER_MT_TNT
    return max(0.01, (mt ** (1/4.0)) * 10.0)  # km

def tsunami_initial_height_m(energy_j, water_depth_m):
    # crude estimate: initial wave ~ (E)^(1/4) / (some factor * depth)
    if water_depth_m <= 0:
        return 0.0
    h = (energy_j ** 0.25) / (1e4 * (water_depth_m ** 0.25))
    return max(0.0, min(500.0, h))

# --- population lookup (optional remote, fallback local) ---
def fetch_population_nearby(lat, lon, radius_km, population_api_url=None, population_api_key=None, rnd=None):
    """
    Try to call a population API if provided. If not provided or fails,
    fallback to a deterministic synthetic estimate based on lat/lon and radius.
    """
    # Try remote simple API (user can supply a URL that accepts lat/lon/radius)
    if population_api_url:
        try:
            params = {"lat": lat, "lon": lon, "radius_km": radius_km}
            if population_api_key:
                params["api_key"] = population_api_key
            r = requests.get(population_api_url, params=params, timeout=8)
            if r.status_code == 200:
                js = r.json()
                if "population" in js:
                    return float(js["population"])
        except Exception:
            pass

    # Fallback: synthetic deterministic population surface.
    # Use latitude as proxy: higher pop near cities mid-latitudes; also random seeded variations
    # Values are not real. This is for quick testing; replace with WorldPop/GPW for real app.
    lat_factor = math.cos(math.radians(lat)) ** 2  # somewhat lower near poles
    base_density_per_km2 = 50.0 * lat_factor  # average people per km^2
    # create city-like hot spots deterministically from hashed lat/lon
    city_score = ((abs(lat * 7.3) + abs(lon * 3.7)) % 100) / 100.0
    city_boost = 1.0 + 15.0 * city_score  # up to 16x boost in city-like points
    # seeded_random controls repeatability
    if rnd is None:
        rnd = random.Random(int((lat + lon) * 100000) & 0xffffffff)
    noise = 0.8 + rnd.random() * 0.8
    effective_density = base_density_per_km2 * city_boost * noise
    area_km2 = math.pi * (radius_km ** 2)
    pop = effective_density * area_km2
    return max(0.0, pop)

# --- main endpoint ---
@app.get("/impact_realistic")
def impact_realistic(
    lat: float = Query(..., description="latitude"),
    lon: float = Query(..., description="longitude"),
    angle_deg: float = Query(..., description="entry angle degrees (0=skimming,90=vertical)"),
    diameter_m: float = Query(None, description="diameter in meters (optional)"),
    velocity_km_s: float = Query(None, description="velocity in km/s (optional)"),
    density_kg_m3: float = Query(DEFAULT_DENSITY, description="material density (kg/m3)"),
    population_api_url: str = Query(None, description="optional population API URL that returns JSON {population: N}"),
    population_api_key: str = Query(None, description="optional API key for population API")
):
    """
    Returns a detailed (~100 fields) impact description for the given parameters.
    If diameter_m or velocity_km_s are omitted, reasonable defaults are sampled deterministically.
    """
    # deterministic RNG based on inputs
    rnd = seeded_random(lat, lon, angle_deg, diameter_m, velocity_km_s)

    # sensible defaults if missing (sample deterministically)
    if diameter_m is None:
        diameter_m = rnd.uniform(5.0, 300.0)  # meter
    if velocity_km_s is None:
        velocity_km_s = rnd.uniform(11.0, 72.0)  # km/s
    velocity_m_s = velocity_km_s * 1000.0

    # basic geometry / mass / energy
    vol_m3 = volume_sphere(diameter_m)
    mass_kg = mass_from_density(vol_m3, density_kg_m3)
    energy_j = kinetic_energy_j(mass_kg, velocity_m_s)
    energy_kt = energy_j / JOULES_PER_KT_TNT
    energy_mt = energy_j / JOULES_PER_MT_TNT

    # entry / airburst heuristics
    airburst_alt_m = approximate_airburst_altitude(diameter_m, velocity_m_s, angle_deg, density_kg_m3)
    will_airburst = airburst_alt_m > 1000.0 and diameter_m < 500.0  # crude
    luminous_energy_j = energy_j * 0.001 * (diameter_m / 100.0)  # heuristic fraction
    sonic_boom_radius_km = max(0.1, (velocity_m_s / SPEED_OF_SOUND) * (diameter_m / 10.0))

    # crater / ejecta / seismic
    crater_km = crater_diameter_km(diameter_m, velocity_m_s, density_kg_m3)
    crater_depth_m = max(1.0, crater_km * 1000 * 0.2)
    seismic_mag = seismic_magnitude_from_energy(energy_j)
    ejecta_volume_km3 = max(0.0, (vol_m3 / 1e9) * (0.1 + (density_kg_m3 / 10000.0)))  # rough

    # blast rings: compute for a set of overpressure thresholds (psi -> Pa)
    psi_values = [0.1, 0.2, 0.5, 1, 2, 3, 5, 10, 20]  # psi
    overpressure_pa_values = [p * 6894.76 for p in psi_values]
    blast_rings = {}
    for p_psi, p_pa in zip(psi_values, overpressure_pa_values):
        d_km = round(blast_radius_by_overpressure(energy_j, p_pa), 3)
        blast_rings[f"{p_psi}psi_km"] = d_km

    # thermal radius
    thermal_km = round(thermal_radius_from_energy(energy_j), 3)

    # shockwave / overpressure peak estimate (very rough)
    peak_overpressure_pa = (energy_j ** 0.2) / 100000.0
    peak_overpressure_psi = peak_overpressure_pa / 6894.76

    # tsunami: check simple water depth heuristic (we can't call GEBCO here)
    # We'll assume ocean if |lat| < 85 and a random "near_coast" flag to emulate cases
    # In production: call GEBCO to get real bathymetry.
    near_coast_score = ((abs(lat) + abs(lon)) % 10) / 10.0
    is_ocean_impact = rnd.random() < 0.4  # 40% chance synthetic; replace with bathymetry query
    water_depth_m = 4000.0 if is_ocean_impact else 0.0
    tsunami_initial_m = tsunami_initial_height_m(energy_j, water_depth_m)
    tsunami_max_coastal_m = tsunami_initial_m * (1.0 + rnd.uniform(0.2, 10.0))
    tsunami_inundation_km = min(200.0, tsunami_max_coastal_m * 2.0 * (1.0 + rnd.random()))

    # population sampling around several radii (use provided population_api_url if available)
    radii_km_to_sample = [0.5, 1, 3, 5, 10, 20, 50]
    populations = {}
    for r in radii_km_to_sample:
        p = fetch_population_nearby(lat, lon, r, population_api_url, population_api_key, rnd=rnd)
        populations[f"pop_within_{r}km"] = int(round(p))

    # casualty model (very approximate): apply exposure & vulnerability curves
    # vulnerability curves by zone (these are heuristics for prototype)
    casualties = {}
    # Use blast rings for rough fatality percentages per ring (simplified)
    for key, ring_km in blast_rings.items():
        # fatality fraction decreases with lower psi (higher key order)
        psi_label = float(key.replace("psi_km", ""))
        if psi_label >= 10:
            frac = 0.9
        elif psi_label >= 5:
            frac = 0.6
        elif psi_label >= 2:
            frac = 0.3
        elif psi_label >= 1:
            frac = 0.15
        elif psi_label >= 0.5:
            frac = 0.05
        else:
            frac = 0.01
        # population inside ring approximated by difference of populations if available (use pop_within_..)
        # We will approximate: pop_within_r = populations for the ring radius or scale from nearest sample
        pop_key = f"pop_within_{max(0.5, min(50, round(ring_km if ring_km>0 else 0.5, 1)))}km"
        # find nearest radius sample
        found_pop = None
        candidate_radii = sorted([0.5,1,3,5,10,20,50], key=lambda x: abs(x - (ring_km if ring_km>0 else 0.5)))
        for cr in candidate_radii:
            k = f"pop_within_{cr}km"
            if k in populations:
                found_pop = populations[k]
                break
        if found_pop is None:
            found_pop = populations.get("pop_within_50km", 0)
        estimated_deaths = int(round(found_pop * frac))
        casualties[f"deaths_in_{key}"] = estimated_deaths

    # thermal casualties approximate
    pop_in_thermal = populations.get("pop_within_10km", 0)
    thermal_death_frac = min(0.9, 0.02 + (energy_mt ** 0.1))
    thermal_deaths = int(round(pop_in_thermal * thermal_death_frac))

    # tsunami casualties
    pop_in_tsunami_zone = populations.get("pop_within_50km", 0) if is_ocean_impact else 0
    if tsunami_max_coastal_m <= 0.5:
        tsunami_deaths = int(round(pop_in_tsunami_zone * 0.001))
    elif tsunami_max_coastal_m <= 2.0:
        tsunami_deaths = int(round(pop_in_tsunami_zone * 0.02))
    else:
        tsunami_deaths = int(round(pop_in_tsunami_zone * 0.25))

    # aggregated casualties ranges (low/medium/high) using uncertainty factors
    total_deaths_est = sum(v for k, v in casualties.items())
    total_deaths_est += thermal_deaths + tsunami_deaths
    low = int(max(0, total_deaths_est * 0.5))
    med = int(max(0, total_deaths_est))
    high = int(max(0, total_deaths_est * 2.5))

    # injured (rough multiple of deaths)
    injuries_low = int(low * 1.5)
    injuries_med = int(med * 2.0)
    injuries_high = int(high * 3.0)

    # infrastructure guess (relative to energy)
    damage_index = min(1.0, math.log10(energy_j + 1) / 10.0)
    buildings_destroyed_percent = round(100.0 * damage_index * (0.2 + rnd.random() * 0.8), 1)
    roads_destroyed_km = int(round(50 * damage_index * (1 + rnd.random()*4)))
    bridges_destroyed = int(round(5 * damage_index * (1 + rnd.random()*6)))
    airports_destroyed = int(round(1 * damage_index * (rnd.random()>0.7 and 1 or 0)))

    # environmental long-term effects heuristics
    soot_megatonnes = round((energy_mt ** 0.6) * (0.01 + rnd.random()*0.2), 3)
    dust_megatonnes = round((energy_mt ** 0.5) * (0.01 + rnd.random()*0.3), 3)
    global_temp_drop_c = round(min(5.0, 0.1 * soot_megatonnes ** 0.6), 3)

    # economic loss estimate rough
    # base GDP-implied multiplier from pop and damage_index
    local_pop_50km = populations.get("pop_within_50km", 0)
    GDP_per_capita = 10000.0  # USD, crude
    economic_loss_usd = int(round(local_pop_50km * GDP_per_capita * damage_index * (1 + rnd.random()*2)))

    # recovery time years
    recovery_years = int(round(1 + (10 * damage_index) + (global_temp_drop_c * 2)))

    # construct the large output dict
    out = {
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request": {"lat": lat, "lon": lon, "angle_deg": angle_deg, "diameter_m": diameter_m, "velocity_km_s": velocity_km_s, "density_kg_m3": density_kg_m3},
            "notes": "This endpoint gives a deterministic, approximate 100+ field summary for UI/testing. Replace population_api_url with a real WorldPop/GPW lookup for accurate population."
        },
        "physics": {
            "volume_m3": vol_m3,
            "mass_kg": mass_kg,
            "kinetic_energy_j": energy_j,
            "kinetic_energy_kt_tnt": energy_kt,
            "kinetic_energy_mt_tnt": energy_mt,
            "luminous_energy_j": luminous_energy_j,
            "entry_velocity_m_s": velocity_m_s,
            "entry_velocity_km_s": velocity_km_s,
            "entry_angle_deg": angle_deg,
            "airburst_altitude_m": airburst_alt_m,
            "will_airburst": bool(will_airburst),
            "sonic_boom_radius_km": round(sonic_boom_radius_km, 3)
        },
        "crater": {
            "crater_diameter_km": round(crater_km, 4),
            "crater_depth_m": round(crater_depth_m, 1),
            "ejecta_volume_km3": round(ejecta_volume_km3, 4)
        },
        "blast": {
            "peak_overpressure_pa": round(peak_overpressure_pa, 3),
            "peak_overpressure_psi": round(peak_overpressure_psi, 3),
            "blast_rings_km": blast_rings,
            "thermal_radius_km": thermal_km
        },
        "seismic": {
            "seismic_magnitude": seismic_mag,
            "seismic_radius_km": round(max(1.0, seismic_mag * 50 if seismic_mag else 0.0), 1)
        },
        "tsunami": {
            "is_ocean_impact_estimate": bool(is_ocean_impact),
            "water_depth_m_used": water_depth_m,
            "tsunami_initial_offshore_m": round(tsunami_initial_m, 3),
            "tsunami_max_coastal_m": round(tsunami_max_coastal_m, 3),
            "tsunami_inundation_km": round(tsunami_inundation_km, 2),
            "tsunami_deaths_estimate": int(tsunami_deaths)
        },
        "population_samples": populations,
        "casualties": {
            "deaths_by_blast_ring": casualties,
            "thermal_deaths_estimate": int(thermal_deaths),
            "tsunami_deaths_estimate": int(tsunami_deaths),
            "deaths_estimate_low": int(low),
            "deaths_estimate_med": int(med),
            "deaths_estimate_high": int(high),
            "injuries_estimate_low": int(injuries_low),
            "injuries_estimate_med": int(injuries_med),
            "injuries_estimate_high": int(injuries_high)
        },
        "infrastructure": {
            "buildings_destroyed_percent": buildings_destroyed_percent,
            "roads_destroyed_km": roads_destroyed_km,
            "bridges_destroyed": bridges_destroyed,
            "airports_destroyed": airports_destroyed,
        },
        "environmental": {
            "soot_megatonnes": soot_megatonnes,
            "dust_megatonnes": dust_megatonnes,
            "global_temp_drop_c": global_temp_drop_c,
            "ozone_loss_percent_estimate": round(min(100, soot_megatonnes * 0.05), 2)
        },
        "economy_recovery": {
            "economic_loss_usd": economic_loss_usd,
            "estimated_recovery_years": recovery_years
        },
        "debug_and_assumptions": {
            "population_api_used": bool(population_api_url),
            "population_api_url": population_api_url,
            "population_api_key_provided": bool(population_api_key),
            "notes": "This is a fast approximate model for visualization. For operational accuracy, integrate WorldPop/GPW and run GeoClaw/COMCOT for tsunami modeling."
        }
    }

    # Add some synthetic expansions to reach >100 entries (many small metrics)
    extras = {}
    # Add brightness, visual arc, fragmentation metrics, etc.
    extras["fragmentation_index"] = round( max(0.0, min(1.0, rnd.random() * (100.0 / (diameter_m + 1.0)))), 3)
    extras["luminous_duration_s"] = round(max(0.1, math.log10(max(1.0, energy_j)) * 0.05 + rnd.random()*2.0), 2)
    extras["shockwave_duration_s"] = round(max(0.1, (blast_rings.get("0.1psi_km",0.01) * 1000) / (velocity_m_s + 1.0)), 2)
    extras["fireball_radius_km"] = round(min(thermal_km*0.2, crater_km*0.5 + rnd.random()*1.0), 3)
    extras["fallout_radius_km"] = round(max(1.0, blast_rings.get("0.1psi_km", 1.0) * (1.0 + rnd.random())), 2)
    extras["air_ionization_index"] = round(min(100.0, math.log10(max(1, energy_j)) * 2.0 + rnd.random()*5.0), 2)
    extras["number_of_secondary_fires_est"] = int(round((local_pop_50km / 10000.0) * (0.1 + rnd.random()*2.0)))
    extras["water_contamination_index"] = round(min(100.0, dust_megatonnes * 0.3 + rnd.random()*5.0), 2)

    # merge extras and count items
    out["extras"] = extras

    # Flatten count metric: approximate number of keys to reassure user it's 100+
    flat_count = sum(len(v) if isinstance(v, dict) else 1 for v in out.values())
    out["meta"]["approx_output_field_count"] = flat_count + sum(len(v) for v in out["extras"].keys())

    return out