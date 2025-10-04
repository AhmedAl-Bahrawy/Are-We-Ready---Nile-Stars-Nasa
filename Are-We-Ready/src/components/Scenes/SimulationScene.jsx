import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  Stats,
  Environment,
  useGLTF,
  Stars,
} from "@react-three/drei";
import { MapContainer, TileLayer, useMapEvents, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as THREE from "three";

// Backend API configuration
const API_BASE = "https://backend-for-nasa-production.up.railway.app";

async function getImpact(lat, lon, angle, diameter, velocity) {
  try {
    const response = await fetch(
      `${API_BASE}/impact_realistic?lat=${lat}&lon=${lon}&angle_deg=${angle}&diameter_m=${diameter}&velocity_km_s=${velocity}`
    );
    if (!response.ok) throw new Error("API request failed");
    return await response.json();
  } catch (err) {
    console.error("Error fetching impact data:", err);
    throw err;
  }
}

// Meteor 3D Model (rotating preview)
function MeteorModel() {
  const { scene } = useGLTF("Models/meteor.glb");
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.01;
  });
  return <primitive ref={ref} object={scene} scale={0.001} />;
}

// Enhanced Info Panel with all backend data
function InfoPanel({
  impactData,
  loadingImpact,
  markerLat,
  markerLon,
  meteorDiameter,
  velocity,
  angle,
  onSelectMeteor,
}) {
  const [selectedMeteor, setSelectedMeteor] = useState("");

  const handleSelectChange = async (e) => {
    const name = e.target.value;
    setSelectedMeteor(name);
    if (name) {
      await onSelectMeteor(name); // fetch impact data by name
    }
  };
  return (
    <div
      style={{
        flex: 1.2,
        background: "linear-gradient(180deg, #0a0e1a 0%, #1a1e2e 100%)",
        padding: "20px",
        overflowY: "auto",
        fontSize: "13px",
        lineHeight: "1.6em",
        color: "#e0e0e0",
      }}
    >
      {/* Loading */}
      {!impactData && loadingImpact && (
        <div style={{ textAlign: "center", color: "#4a9eff" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "6px solid #4a9eff",
              borderTop: "6px solid transparent",
              borderRadius: "50%",
              margin: "15px auto",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>Loading impact data...</p>
          <style>
            {`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}
          </style>
        </div>
      )}

      {/* Show data */}
      {impactData && (
        <>
          <h2
            style={{ margin: "0 0 20px 0", color: "#ff6b35", fontSize: "22px" }}
          >
            💥 Impact Analysis
          </h2>
          <div
            style={{
              flex: 1.2,
              background: "linear-gradient(180deg, #0a0e1a 0%, #1a1e2e 100%)",
              padding: "20px",
              overflowY: "auto",
              fontSize: "13px",
              lineHeight: "1.6em",
              color: "#e0e0e0",
            }}
          >
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#4a9eff",
                  fontSize: "15px",
                }}
              >
                📍 Location
              </h3>
              <p style={{ margin: "5px 0" }}>
                <strong>Coordinates:</strong> {markerLat.toFixed(4)}°,{" "}
                {markerLon.toFixed(4)}°
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Diameter:</strong> {meteorDiameter} m
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Velocity:</strong> {velocity} km/s
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Angle:</strong> {angle}°
              </p>
            </div>

            {/* Physics */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{ margin: "0 0 8px 0", color: "#4af", fontSize: "15px" }}
              >
                ⚛️ Physics
              </h3>
              <p style={{ margin: "5px 0" }}>
                Mass: {impactData.physics?.mass_kg?.toExponential(2)} kg
              </p>
              <p style={{ margin: "5px 0" }}>
                Velocity: {impactData.physics?.entry_velocity_km_s} km/s
              </p>
              <p style={{ margin: "5px 0" }}>
                Energy: {impactData.physics?.kinetic_energy_mt_tnt?.toFixed(2)}{" "}
                MT TNT
              </p>
              <p style={{ margin: "5px 0" }}>
                Airburst Altitude:{" "}
                {impactData.physics?.airburst_altitude_m?.toFixed(0)} m
              </p>
              <p style={{ margin: "5px 0" }}>
                Sonic Boom Radius: {impactData.physics?.sonic_boom_radius_km} km
              </p>
            </div>

            {/* Crater */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#2a1a1a",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#ffaa4d",
                  fontSize: "15px",
                }}
              >
                🕳️ Crater
              </h3>
              <p style={{ margin: "5px 0" }}>
                Diameter: {impactData.crater?.crater_diameter_km} km
              </p>
              <p style={{ margin: "5px 0" }}>
                Depth: {impactData.crater?.crater_depth_m} m
              </p>
              <p style={{ margin: "5px 0" }}>
                Ejecta Volume: {impactData.crater?.ejecta_volume_km3} km³
              </p>
            </div>

            {/* Blast */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#ff4d4d",
                  fontSize: "15px",
                }}
              >
                💣 Blast Effects
              </h3>
              <p style={{ margin: "5px 0" }}>
                Thermal Radius: {impactData.blast?.thermal_radius_km} km
              </p>
              <p style={{ margin: "5px 0" }}>
                1 psi Damage: {impactData.blast?.blast_rings_km?.["1psi_km"]} km
              </p>
              <p style={{ margin: "5px 0" }}>
                5 psi Severe: {impactData.blast?.blast_rings_km?.["5psi_km"]} km
              </p>
              <p style={{ margin: "5px 0" }}>
                10 psi Fatal: {impactData.blast?.blast_rings_km?.["10psi_km"]}{" "}
                km
              </p>
              <p style={{ margin: "5px 0" }}>
                20 psi Total: {impactData.blast?.blast_rings_km?.["20psi_km"]}{" "}
                km
              </p>
            </div>

            {/* Seismic & Tsunami */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#66ff99",
                  fontSize: "15px",
                }}
              >
                🌊 Seismic & Tsunami
              </h3>
              <p style={{ margin: "5px 0" }}>
                Seismic Magnitude: {impactData.seismic?.seismic_magnitude}
              </p>
              <p style={{ margin: "5px 0" }}>
                Seismic Radius: {impactData.seismic?.seismic_radius_km} km
              </p>
              <p style={{ margin: "5px 0" }}>
                Tsunami Height: {impactData.tsunami?.tsunami_max_coastal_m} m
              </p>
              <p style={{ margin: "5px 0" }}>
                Tsunami Deaths:{" "}
                {impactData.tsunami?.tsunami_deaths_estimate?.toLocaleString()}
              </p>
            </div>

            {/* Casualties */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#2a1a1a",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#ff6666",
                  fontSize: "15px",
                }}
              >
                ☠️ Casualties
              </h3>
              <p style={{ margin: "5px 0" }}>
                Deaths (low):{" "}
                {impactData.casualties?.deaths_estimate_low?.toLocaleString()}
              </p>
              <p style={{ margin: "5px 0" }}>
                Deaths (med):{" "}
                {impactData.casualties?.deaths_estimate_med?.toLocaleString()}
              </p>
              <p style={{ margin: "5px 0" }}>
                Deaths (high):{" "}
                {impactData.casualties?.deaths_estimate_high?.toLocaleString()}
              </p>
              <p style={{ margin: "5px 0" }}>
                Injuries (med):{" "}
                {impactData.casualties?.injuries_estimate_med?.toLocaleString()}
              </p>
            </div>

            {/* Infrastructure */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#ffaa00",
                  fontSize: "15px",
                }}
              >
                🏗️ Infrastructure
              </h3>
              <p style={{ margin: "5px 0" }}>
                Buildings Destroyed:{" "}
                {impactData.infrastructure?.buildings_destroyed_percent}%
              </p>
              <p style={{ margin: "5px 0" }}>
                Roads Lost: {impactData.infrastructure?.roads_destroyed_km} km
              </p>
              <p style={{ margin: "5px 0" }}>
                Bridges Lost: {impactData.infrastructure?.bridges_destroyed}
              </p>
              <p style={{ margin: "5px 0" }}>
                Airports Lost: {impactData.infrastructure?.airports_destroyed}
              </p>
            </div>

            {/* Environment */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#88ccff",
                  fontSize: "15px",
                }}
              >
                🌡️ Environmental
              </h3>
              <p style={{ margin: "5px 0" }}>
                Soot: {impactData.environmental?.soot_megatonnes} Mt
              </p>
              <p style={{ margin: "5px 0" }}>
                Dust: {impactData.environmental?.dust_megatonnes} Mt
              </p>
              <p style={{ margin: "5px 0" }}>
                Global Temp Drop: {impactData.environmental?.global_temp_drop_c}{" "}
                °C
              </p>
              <p style={{ margin: "5px 0" }}>
                Ozone Loss:{" "}
                {impactData.environmental?.ozone_loss_percent_estimate}%
              </p>
            </div>

            {/* Economy */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#ffcc00",
                  fontSize: "15px",
                }}
              >
                💰 Economy
              </h3>
              <p style={{ margin: "5px 0" }}>
                Loss: $
                {impactData.economy_recovery?.economic_loss_usd?.toLocaleString()}
              </p>
              <p style={{ margin: "5px 0" }}>
                Recovery Time:{" "}
                {impactData.economy_recovery?.estimated_recovery_years} years
              </p>
            </div>

            {/* Extras */}
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: "#1a2332",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{ margin: "0 0 8px 0", color: "#bbb", fontSize: "15px" }}
              >
                🔬 Additional Data
              </h3>
              <p style={{ margin: "5px 0" }}>
                Fireball Radius: {impactData.extras?.fireball_radius_km} km
              </p>
              <p style={{ margin: "5px 0" }}>
                Fallout Radius: {impactData.extras?.fallout_radius_km} km
              </p>
              <p style={{ margin: "5px 0" }}>
                Secondary Fires:{" "}
                {impactData.extras?.number_of_secondary_fires_est}
              </p>
            </div>
          </div>
          {/* Meteor Selection Dropdown */}
          <div
            style={{
              marginBottom: "25px",
              padding: "20px",
              background:
                "linear-gradient(135deg, rgba(26, 35, 50, 0.9) 0%, rgba(20, 25, 37, 0.9) 100%)",
              borderRadius: "12px",
              border: "1px solid rgba(74, 158, 255, 0.2)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <label
              htmlFor="meteor"
              style={{
                display: "block",
                color: "#4a9eff",
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "12px",
                textShadow: "0 0 10px rgba(74, 158, 255, 0.3)",
              }}
            >
              🌠 Select Known Meteor
            </label>
            <select
              id="meteor"
              value={selectedMeteor}
              onChange={handleSelectChange}
              style={{
                width: "100%",
                padding: "10px 15px",
                fontSize: "14px",
                color: "#fff",
                backgroundColor: "rgba(10, 15, 25, 0.8)",
                border: "1px solid rgba(74, 158, 255, 0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                backgroundImage:
                  "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234a9eff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px top 50%",
                backgroundSize: "12px auto",
                paddingRight: "30px",
              }}
            >
              <option value="">-- Select a Meteor --</option>
              <option value="433 Eros">433 Eros - Near-Earth Asteroid</option>
              <option value="99942 Apophis">
                99942 Apophis - Potentially Hazardous
              </option>
              <option value="101955 Bennu">
                101955 Bennu - NEO with Impact Risk
              </option>
            </select>
            {selectedMeteor && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: "rgba(74, 158, 255, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(74, 158, 255, 0.2)",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    color: "#4a9eff",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>☄️</span>
                  Selected: <strong>{selectedMeteor}</strong>
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "12px",
                    color: "#aab",
                    lineHeight: "1.4",
                  }}
                >
                  {selectedMeteor === "433 Eros" &&
                    "One of the largest near-Earth asteroids, about 16.8 km in diameter."}
                  {selectedMeteor === "99942 Apophis" &&
                    "Famous for initial predictions of possible Earth impact in 2029, now known to pass safely."}
                  {selectedMeteor === "101955 Bennu" &&
                    "A carbon-rich asteroid discovered in 1999, with a small chance of Earth impact in the late 22nd century."}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
// Animated explosion circles on map
function ExplosionCircles({ center, impactData }) {
  const [animation, setAnimation] = useState(0);

  useEffect(() => {
    setAnimation(0);
    const interval = setInterval(() => {
      setAnimation((a) => Math.min(a + 0.02, 1));
    }, 30);
    return () => clearInterval(interval);
  }, [center, impactData]);

  if (!impactData?.blast) return null;

  const circles = [
    {
      radius: impactData.blast.blast_rings_km?.["20psi_km"],
      color: "#ff0000",
      label: "20 psi",
    },
    {
      radius: impactData.blast.blast_rings_km?.["10psi_km"],
      color: "#ff4400",
      label: "10 psi",
    },
    {
      radius: impactData.blast.blast_rings_km?.["5psi_km"],
      color: "#ff8800",
      label: "5 psi",
    },
    {
      radius: impactData.blast.blast_rings_km?.["1psi_km"],
      color: "#ffaa00",
      label: "1 psi",
    },
    {
      radius: impactData.blast.thermal_radius_km,
      color: "#ff6600",
      label: "Thermal",
    },
  ].filter((c) => c.radius && c.radius > 0);

  return (
    <>
      {circles.map((circle, i) => (
        <Circle
          key={i}
          center={center}
          radius={circle.radius * 1000 * animation} // good
          pathOptions={{
            color: circle.color,
            fillColor: circle.color,
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      ))}
    </>
  );
}

// Convert lat/lon to 3D position
function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Impact marker on 3D Earth
function EarthMarker({ lat, lon, size, startDistance = 5, speed = 0.02 }) {
  const meshRef = useRef();

  // Target position (just above Earth's surface)
  const targetPos = latLonToVector3(lat, lon, 1.01);

  // Start position (far away along the same direction)
  const direction = targetPos.clone().normalize(); // unit vector from center
  const startPos = direction.clone().multiplyScalar(startDistance);
  const [currentPos, setCurrentPos] = useState(startPos);

  useEffect(() => {
    // Recalculate target and start when lat/lon changes
    const newTarget = latLonToVector3(lat, lon, 1.01);
    const newDir = newTarget.clone().normalize();
    setCurrentPos(newDir.clone().multiplyScalar(startDistance));
    targetPos.copy(newTarget);
  }, [lat, lon]);

  // Animate meteor toward Earth
  useFrame(() => {
    if (!meshRef.current) return;

    // Interpolate position
    const x = lerp(currentPos.x, targetPos.x, speed);
    const y = lerp(currentPos.y, targetPos.y, speed);
    const z = lerp(currentPos.z, targetPos.z, speed);

    setCurrentPos(new THREE.Vector3(x, y, z));
    meshRef.current.position.set(x, y, z);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color="#ff3300"
        emissive="#ff3300"
        emissiveIntensity={3}
      />
    </mesh>
  );
}

// Earth 3D Model
function EarthModel({ earthRef }) {
  const { scene } = useGLTF(
    "https://cdn.jsdelivr.net/gh/AhmedAl-Bahrawy/Are-We-Ready---Nile-Stars-Nasa-Models@main/earth.glb"
  );

  useEffect(() => {
    if (earthRef.current) {
      const box = new THREE.Box3().setFromObject(earthRef.current);
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      earthRef.current.userData.boundingSphere = { radius: sphere.radius };
    }
  }, [earthRef]);

  return <primitive ref={earthRef} object={scene} scale={1} />;
}

// 3D Scene
function SimulationScene({ markerLat, markerLon, markerSize, loadingImpact }) {
  const earthRef = useRef();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Stars radius={300} depth={60} count={15000} factor={5} fade speed={1} />

      <Suspense fallback={null}>
        <EarthModel earthRef={earthRef} />

        {markerLat != null && markerLon != null && (
          <>
            <EarthMarker lat={markerLat} lon={markerLon} size={markerSize} />

            {loadingImpact && (
              <mesh position={latLonToVector3(markerLat, markerLon, 1.01)}>
                <sphereGeometry args={[markerSize, 16, 16]} />
                <meshStandardMaterial color="#999" transparent opacity={0.5} />
              </mesh>
            )}
          </>
        )}
      </Suspense>

      <OrbitControls
        enableZoom={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={10}
      />
    </>
  );
}

// Preload Earth model
useGLTF.preload(
  "https://cdn.jsdelivr.net/gh/AhmedAl-Bahrawy/Are-We-Ready---Nile-Stars-Nasa-Models@main/earth.glb"
);

// Loading progress bar
function LoadingBar({ progress }) {
  if (progress >= 100) return null;

  return (
    <div style={{ padding: "10px", background: "#0a0e1a" }}>
      <div
        style={{
          background: "#2a2e3e",
          height: "6px",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #4a9eff, #ff6b35)",
            width: `${progress}%`,
            transition: "width 0.3s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "12px",
          color: "#4a9eff",
          marginTop: "5px",
          display: "block",
        }}
      >
        Loading... {progress.toFixed(0)}%
      </span>
    </div>
  );
}

// Main App Component
export default function SS({ showStats = true, showGizmo = true }) {
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [markerLat, setMarkerLat] = useState(40.7128);
  const [markerLon, setMarkerLon] = useState(-74.006);

  // Meteor parameters
  const [meteorDiameter, setMeteorDiameter] = useState(100);
  const [velocity, setVelocity] = useState(20);
  const [angle, setAngle] = useState(45);

  // API state
  const [impactData, setImpactData] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  const mapRef = useRef();
  const mapBounds = [
    [85, -180],
    [-85, 180],
  ];
  const fetchImpactByName = async (name) => {
    setImpactData(null);
    setLoadingImpact(true);
    try {
      const response = await fetch(
        `${API_BASE}/impact_by_name?name=${encodeURIComponent(name)}`
      );
      if (!response.ok) throw new Error("Failed to fetch impact by name");
      const data = await response.json();

      if (data.error) return;

      setMarkerLat(data.impact_data?.lat || markerLat);
      setMarkerLon(data.impact_data?.lon || markerLon);
      setMeteorDiameter(data.impact_data?.diameter_m || meteorDiameter);
      setVelocity(data.impact_data?.velocity_km_s || velocity);
      setAngle(data.impact_data?.angle_deg || angle);
      setImpactData(data.impact_data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImpact(false);
    }
  };

  // Loading simulation
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      setProgress(Math.min(100, p));
      if (p >= 100) clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Map/canvas ready
  useEffect(() => {
    const timer = setTimeout(() => setCanvasLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const isLoaded = canvasLoaded && progress >= 100;

  // Fetch impact data from backend
  useEffect(() => {
    async function fetchImpact() {
      // Clear previous data to trigger loading state
      setImpactData(null);
      setLoadingImpact(true);

      try {
        const data = await getImpact(
          markerLat,
          markerLon,
          angle,
          meteorDiameter,
          velocity
        );
        setImpactData(data);
      } catch (err) {
        console.error("Failed to fetch impact data", err);
        setImpactData(null);
      } finally {
        setLoadingImpact(false);
      }
    }

    fetchImpact();
  }, [markerLat, markerLon, meteorDiameter, velocity, angle]);

  // Map click handler
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setMarkerLat(e.latlng.lat);
        setMarkerLon(e.latlng.lng);
      },
    });
    return null;
  }

  // Calculate marker size for 3D
  const markerSize = useMemo(() => {
    if (!impactData?.blast?.blast_rings_km) return 0.02;
    const maxRadius = Math.max(
      impactData.blast.blast_rings_km["1psi_km"] || 0,
      impactData.blast.thermal_radius_km || 0
    );
    return Math.min(0.15, 0.01 + maxRadius / 1000);
  }, [impactData]);

  return (
    <div className="content-wrapper">
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#000",
          color: "#fff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Main Column: 3D + Map */}
        <div
          className="main-content"
          style={{
            flex: "1 1 70%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {/* Controls Section */}
          <div
            style={{
              padding: "20px",
              background: "linear-gradient(180deg, #0a0e1a 0%, #151925 100%)",
              borderBottom: "1px solid #2a2e3e",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Loading Bar at the top of controls */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
              <LoadingBar progress={progress} loadingImpact={loadingImpact} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                padding: "0 10px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#bbb",
                    fontWeight: "500",
                  }}
                >
                  Diameter: {meteorDiameter} m
                </label>
                <input
                  type="range"
                  min="10"
                  max="10000"
                  step="10"
                  value={meteorDiameter}
                  onChange={(e) => setMeteorDiameter(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "6px",
                    borderRadius: "3px",
                    WebkitAppearance: "none",
                    background:
                      "linear-gradient(90deg, #4a9eff 0%, #ff6b35 100%)",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#bbb",
                    fontWeight: "500",
                  }}
                >
                  Velocity: {velocity} km/s
                </label>
                <input
                  type="range"
                  min="11"
                  max="72"
                  step="1"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "6px",
                    borderRadius: "3px",
                    WebkitAppearance: "none",
                    background:
                      "linear-gradient(90deg, #4a9eff 0%, #ff6b35 100%)",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#bbb",
                    fontWeight: "500",
                  }}
                >
                  Angle: {angle}°
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "6px",
                    borderRadius: "3px",
                    WebkitAppearance: "none",
                    background:
                      "linear-gradient(90deg, #4a9eff 0%, #ff6b35 100%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <div
            style={{
              flex: 2, // give canvas more vertical space
              borderBottom: "1px solid #333",
              position: "relative",
              minHeight: 0,
            }}
          >
            {showStats && <Stats />}
            <Canvas
              shadows
              camera={{ position: [5, 5, 5], fov: 60 }}
              style={{
                opacity: isLoaded ? 1 : 0.3,
                transition: "opacity 0.5s",
              }}
              gl={{ antialias: true }}
              dpr={[1, 2]}
            >
              <Suspense fallback={null}>
                <Environment preset="night" />
                {showGizmo && (
                  <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                    <GizmoViewport />
                  </GizmoHelper>
                )}
                <SimulationScene
                  markerLat={markerLat}
                  markerLon={markerLon}
                  markerSize={markerSize}
                  loadingImpact={loadingImpact}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Map */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <MapContainer
              center={[markerLat, markerLon]}
              zoom={5}
              minZoom={2}
              maxZoom={18}
              worldCopyJump={false}
              maxBounds={mapBounds}
              style={{ height: "100%", width: "100%" }}
              whenReady={() => setMapLoaded(true)}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <ExplosionCircles
                center={[markerLat, markerLon]}
                impactData={loadingImpact ? null : impactData}
              />

              <MapClickHandler />
            </MapContainer>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <InfoPanel
          impactData={impactData}
          loadingImpact={loadingImpact} // <-- add this
          markerLat={markerLat}
          markerLon={markerLon}
          meteorDiameter={meteorDiameter}
          velocity={velocity}
          angle={angle}
          onSelectMeteor={fetchImpactByName}
        />
      </div>
    </div>
  );
}
