import React, { useState, useRef, useEffect, Suspense } from "react";
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
import axios from "axios";
const API_BASE = "http://127.0.0.1:8000"; // FastAPI backend URL
export async function getImpact(lat, lon, angle, diameter, velocity) {
  try {
    const response = await axios.get(`${API_BASE}/impact_realistic`, {
      params: {
        lat, // example: 30
        lon, // example: 31
        angle_deg: angle, // example: 45
        diameter_m: diameter, // example: 50
        velocity_km_s: velocity, // example: 20
      },
    });
    return response.data; // return JSON from server
  } catch (err) {
    console.error("Error fetching impact data:", err);
    throw err;
  }
}

/* =====================
   Meteor Preview Model
   ===================== */
function Meteor_pre_Model() {
  const { scene } = useGLTF("Models/meteor.glb");
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.01;
  });
  return <primitive ref={ref} object={scene} scale={0.001} />;
}

function InfoPanel({ impactData, markerLat, markerLon, meteorDiameter }) {
  if (!impactData) return <p>Loading impact data...</p>;

  return (
    <div
      style={{
        flex: 1.2,
        background: "#222",
        padding: "20px",
        overflowY: "auto",
        fontSize: "14px",
        lineHeight: "1.5em",
      }}
    >
      <h2>💥 Explosion Info</h2>
      <p>
        <strong>Location:</strong> {markerLat.toFixed(4)},{" "}
        {markerLon.toFixed(4)}
      </p>
      <p>
        <strong>Meteor Diameter:</strong> {meteorDiameter} m
      </p>

      {/* Physics */}
      <h3 style={{ marginTop: "15px", color: "#4af" }}>⚛️ Physics</h3>
      <ul>
        <li>Mass: {impactData.physics?.mass_kg?.toExponential(2)} kg</li>
        <li>Velocity: {impactData.physics?.entry_velocity_km_s} km/s</li>
        <li>
          Energy: {impactData.physics?.kinetic_energy_mt_tnt?.toFixed(2)} MT TNT
        </li>
        <li>
          Airburst Altitude:{" "}
          {impactData.physics?.airburst_altitude_m?.toFixed(0)} m
        </li>
        <li>
          Sonic Boom Radius: {impactData.physics?.sonic_boom_radius_km} km
        </li>
      </ul>

      {/* Crater */}
      <h3 style={{ marginTop: "15px", color: "#ffaa4d" }}>🕳️ Crater</h3>
      <ul>
        <li>Diameter: {impactData.crater?.crater_diameter_km} km</li>
        <li>Depth: {impactData.crater?.crater_depth_m} m</li>
      </ul>

      {/* Blast */}
      <h3 style={{ marginTop: "15px", color: "#ff4d4d" }}>💣 Blast</h3>
      <ul>
        <li>Thermal Radius: {impactData.blast?.thermal_radius_km} km</li>
        <li>
          1psi Damage Radius: {impactData.blast?.blast_rings_km?.["1psi_km"]} km
        </li>
        <li>
          5psi Severe Radius: {impactData.blast?.blast_rings_km?.["5psi_km"]} km
        </li>
        <li>
          10psi Fatal Radius: {impactData.blast?.blast_rings_km?.["10psi_km"]}{" "}
          km
        </li>
      </ul>

      {/* Seismic & Tsunami */}
      <h3 style={{ marginTop: "15px", color: "#66ff99" }}>
        🌪️ Seismic & Tsunami
      </h3>
      <ul>
        <li>Magnitude: {impactData.seismic?.seismic_magnitude}</li>
        <li>Radius: {impactData.seismic?.seismic_radius_km} km</li>
        <li>Tsunami Height: {impactData.tsunami?.tsunami_max_coastal_m} m</li>
        <li>Tsunami Deaths: {impactData.tsunami?.tsunami_deaths_estimate}</li>
      </ul>

      {/* Casualties */}
      <h3 style={{ marginTop: "15px", color: "#ff6666" }}>☠️ Casualties</h3>
      <ul>
        <li>Deaths (low): {impactData.casualties?.deaths_estimate_low}</li>
        <li>Deaths (med): {impactData.casualties?.deaths_estimate_med}</li>
        <li>Deaths (high): {impactData.casualties?.deaths_estimate_high}</li>
        <li>Injuries (med): {impactData.casualties?.injuries_estimate_med}</li>
      </ul>

      {/* Infrastructure */}
      <h3 style={{ marginTop: "15px", color: "#ffaa00" }}>🏗️ Infrastructure</h3>
      <ul>
        <li>
          Buildings Destroyed:{" "}
          {impactData.infrastructure?.buildings_destroyed_percent}%
        </li>
        <li>Roads Lost: {impactData.infrastructure?.roads_destroyed_km} km</li>
        <li>Bridges Lost: {impactData.infrastructure?.bridges_destroyed}</li>
        <li>Airports Lost: {impactData.infrastructure?.airports_destroyed}</li>
      </ul>

      {/* Environment */}
      <h3 style={{ marginTop: "15px", color: "#88ccff" }}>🌡️ Environmental</h3>
      <ul>
        <li>Soot: {impactData.environmental?.soot_megatonnes} Mt</li>
        <li>Dust: {impactData.environmental?.dust_megatonnes} Mt</li>
        <li>
          Global Temp Drop: {impactData.environmental?.global_temp_drop_c} °C
        </li>
        <li>
          Ozone Loss: {impactData.environmental?.ozone_loss_percent_estimate}%
        </li>
      </ul>

      {/* Economy */}
      <h3 style={{ marginTop: "15px", color: "#ffcc00" }}>💰 Economy</h3>
      <ul>
        <li>
          Loss: $
          {impactData.economy_recovery?.economic_loss_usd?.toLocaleString()}
        </li>
        <li>
          Recovery Time: {impactData.economy_recovery?.estimated_recovery_years}{" "}
          years
        </li>
      </ul>

      {/* Extras */}
      <h3 style={{ marginTop: "15px", color: "#bbb" }}>🔬 Extras</h3>
      <ul>
        <li>Fireball Radius: {impactData.extras?.fireball_radius_km} km</li>
        <li>Fallout Radius: {impactData.extras?.fallout_radius_km} km</li>
        <li>
          Secondary Fires: {impactData.extras?.number_of_secondary_fires_est}
        </li>
      </ul>
    </div>
  );
}

/* =====================
   Explosion Circle
   ===================== */
function Explosion({ center, explosion_radius_o }) {
  const [radius, setRadius] = useState(0);

  useEffect(() => {
    let r = 0;
    setRadius(0);
    const interval = setInterval(() => {
      r += explosion_radius_o / 100;
      if (r > explosion_radius_o) {
        clearInterval(interval);
        setRadius(explosion_radius_o);
      } else {
        setRadius(r);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [explosion_radius_o]);

  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color: "red",
        fillColor: "darkred",
        fillOpacity: 0.5,
      }}
    />
  );
}

/* =====================
   Earth + Marker Utils
   ===================== */
function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

function EarthMarker({ lat, lon, volume }) {
  const pos = latLonToVector3(lat, lon, 1.01);
  return (
    <mesh position={pos}>
      <sphereGeometry args={[volume / 2, 16, 16]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={3} />
    </mesh>
  );
}

function EarthModel({ earthRef }) {
  const { scene } = useGLTF("Models/earth.glb");
  useEffect(() => {
    if (earthRef.current) {
      const box = new THREE.Box3().setFromObject(earthRef.current);
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      earthRef.current.userData.boundingSphere = { radius: sphere.radius };
    }
  }, []);
  return <primitive ref={earthRef} object={scene} scale={1} />;
}

/* =====================
   Simulation Scene (3D)
   ===================== */
function SimulationScene({ markerLat, markerLon, explosion_radius }) {
  const earthRef = useRef();
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={300} depth={60} count={20000} factor={7} fade />
      <Suspense fallback={null}>
        <EarthModel earthRef={earthRef} />
        {markerLat && markerLon && (
          <EarthMarker
            lat={markerLat}
            lon={markerLon}
            volume={explosion_radius ? explosion_radius / 1000 : 1}
          />
        )}
      </Suspense>
      <OrbitControls enableZoom={true} enableRotate={true} />
    </>
  );
}
useGLTF.preload("Models/earth.glb");

/* =====================
   Loading Bar
   ===================== */
function LoadingBar({ progress }) {
  if (progress >= 100) return null;
  return (
    <div style={{ padding: "8px", color: "#fff", fontSize: "14px" }}>
      <div style={{ background: "#333", height: "6px", borderRadius: "3px" }}>
        <div
          style={{
            height: "6px",
            borderRadius: "3px",
            background: "#4af",
            width: `${progress}%`,
            transition: "width 0.3s",
          }}
        />
      </div>
      <span>{`Loading... ${progress}%`}</span>
    </div>
  );
}

/* =====================
   Main Screen
   ===================== */
// --- inside SS() ---
export default function SS({
  showStats = true,
  showGizmo = true,
  explosion_radius = 10,
}) {
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [markerLat, setMarkerLat] = useState(40.7128);
  const [markerLon, setMarkerLon] = useState(-74.006);

  // === Meteor parameters ===
  const meteorDiameter = 100000; // meters
  const velocity = 100;       // km/s
  const angle = 90;          // degrees

  // API state
  const [impactData, setImpactData] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  const mapRef = useRef();
  const mapBounds = [
    [85, -180],
    [-85, 180],
  ];

  // Simulate loading (fake progress bar)
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      setProgress(Math.min(100, p));
      if (p >= 100) clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Map + canvas readiness
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("load", () => setMapLoaded(true));
    }
    const timer = setTimeout(() => setCanvasLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const isLoaded = canvasLoaded && mapLoaded && progress >= 100;

  // === call API whenever marker changes ===
  useEffect(() => {
    async function fetchImpact() {
      setLoadingImpact(true);
      try {
        const data = await getImpact(markerLat, markerLon, angle, meteorDiameter, velocity);
        setImpactData(data);
      } catch (err) {
        setImpactData(null);
      } finally {
        setLoadingImpact(false);
      }
    }
    fetchImpact();
  }, [markerLat, markerLon]);

  // --- map click handler ---
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setMarkerLat(e.latlng.lat);
        setMarkerLon(e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#000",
        color: "#fff",
      }}
    >
      {/* Main Column: 3D + Map */}
      <div style={{ flex: 3, display: "flex", flexDirection: "column" }}>
        <LoadingBar progress={progress} />

        {/* 3D Canvas */}
        <div style={{ flex: 1, borderBottom: "1px solid #333" }}>
          {showStats && <Stats />}
          <Canvas
            shadows
            camera={{ position: [5, 5, 5], fov: 60 }}
            style={{ opacity: isLoaded ? 1 : 0.3, transition: "opacity 0.5s" }}
          >
            <Suspense fallback={null}>
              <Environment preset="city" />
              {showGizmo && (
                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                  <GizmoViewport />
                </GizmoHelper>
              )}
              <SimulationScene
                markerLat={markerLat}
                markerLon={markerLon}
                explosion_radius={explosion_radius}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Map */}
        <div style={{ height: "40vh" }}>
          <MapContainer
            center={[markerLat, markerLon]}
            zoom={5}
            minZoom={3}
            maxZoom={18}
            worldCopyJump={false}
            maxBounds={mapBounds}
            style={{ height: "100%", width: "100%" }}
            whenReady={() => setMapLoaded(true)}
            ref={mapRef}
          >
            <TileLayer
              url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            />
            <Explosion
              center={[markerLat, markerLon]}
              explosion_radius_o={explosion_radius}
            />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {/* Sidebar Info Panel */}
      <InfoPanel
        impactData={impactData}
        markerLat={markerLat}
        markerLon={markerLon}
        meteorDiameter={meteorDiameter}
      />
    </div>
  );
}
