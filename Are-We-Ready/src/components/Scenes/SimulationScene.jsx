import React, {
  useState,
  useRef,
  useEffect,
  Suspense,
} from "react";
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
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as THREE from "three";

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

  const mapRef = useRef();
  const mapBounds = [
    [85, -180],
    [-85, 180],
  ];

  // Simulate loading
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      setProgress(Math.min(100, p));
      if (p >= 100) clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("load", () => setMapLoaded(true));
    }
    const timer = setTimeout(() => setCanvasLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const isLoaded = canvasLoaded && mapLoaded && progress >= 100;

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
        background: "#000000ff",
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
            style={{
              opacity: isLoaded ? 1 : 0.3,
              transition: "opacity 0.5s",
            }}
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

      {/* Sidebar */}
      <div
        style={{
          flex: 1.2,
          background: "#222",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {/* Meteor Preview */}
        <div
          style={{
            height: "200px",
            border: "2px solid rgba(0, 0, 0, 0.3)",
            backgroundColor: "#000000ff",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.2} />
            <directionalLight position={[0, 9, 2]} intensity={2} />
            <Stars radius={300} depth={60} count={20000} factor={7} fade />
            <Suspense fallback={null}>
              <Meteor_pre_Model />
            </Suspense>
            <OrbitControls enableZoom={false} enableRotate={false} />
          </Canvas>
        </div>

        {/* Info */}
        <h2>💥 Explosion Info</h2>
        <p>
          <strong>Location:</strong> {markerLat.toFixed(4)}, {markerLon.toFixed(4)}
        </p>
        <p>
          <strong>Radius:</strong> {explosion_radius / 1000} km
        </p>
        <p>Click map to change marker 📍</p>

        <h2 style={{ marginTop: "20px", color: "#ffaa4d" }}>📊 Impact Data</h2>
        <ul>
          <li>Velocity: ~20 km/s 🚀</li>
          <li>Energy: ~500 MT TNT 💣</li>
          <li>Crater Size: ~1.2 km 🕳️</li>
          <li>Shockwave Radius: ~20 km 🌪️</li>
        </ul>
      </div>
    </div>
  );
}
