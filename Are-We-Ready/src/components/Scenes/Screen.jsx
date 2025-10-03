// Screen.jsx
import React, { Suspense, useState, useEffect, useRef } from "react";
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

// ------------------ 3D Meteor Preview ------------------
function Meteor_pre_Model() {
  const { scene } = useGLTF("Models/meteor.glb");
  const earthRef = useRef();

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.01;
    }
  });

  return <primitive ref={earthRef} object={scene} scale={0.001} />;
}

// ------------------ Explosion Effect ------------------
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

// ------------------ Loading Bar ------------------
function LoadingBar({ progress }) {
  if (progress >= 100) return null;
  return (
    <div className="loading-bar-container">
      <div className="loading-bar-bg">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="loading-bar-label">{`Loading... ${progress}%`}</span>
    </div>
  );
}

// ------------------ Screen Component ------------------
function Screen({
  onlyMap,
  showStats = true,
  showGizmo = true,
  explosion_radius = 1000,
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

  // Simulated loading progress
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      setProgress(Math.min(100, p));
      if (p >= 100) clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("load", () => setMapLoaded(true));
    }
  }, [mapRef.current]);

  useEffect(() => {
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

  if (onlyMap) {
    return (
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={13}
        minZoom={1}
        maxZoom={30}
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
        <Explosion center={[40.7128, -74.006]} explosion_radius_o={explosion_radius} />
      </MapContainer>
    );
  }

  return (
    <div className="app-layout show-screen">
      <LoadingBar progress={progress} />

      <div
        className="main-column"
        style={{
          opacity: isLoaded ? 1 : 0.3,
          pointerEvents: isLoaded ? "auto" : "none",
          transition: "opacity 0.5s",
        }}
      >
        {/* 3D Canvas */}
        <div className="canvas-layer stacked">
          {showStats && <Stats />}
          <Canvas
            shadows
            camera={{ position: [5, 5, 5], rotation: [Math.PI / 2, 0, 0], fov: 60 }}
          >
            <Suspense fallback={null}>
              <Environment preset="city" />
              {showGizmo && (
                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                  <GizmoViewport />
                </GizmoHelper>
              )}
              <OrbitControls makeDefault />
              <SimulationScene
                markerLat={markerLat}
                markerLon={markerLon}
                explosion_radius={explosion_radius}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Map */}
        <div className="map-layer">
          <MapContainer
            center={[markerLat, markerLon]}
            zoom={13}
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
            <Explosion center={[markerLat, markerLon]} explosion_radius_o={explosion_radius} />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {/* Sidebar */}
      <div className="info-panel">
        <div className="meteor-preview">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.2} />
            <directionalLight position={[0, 9, 2]} intensity={2} castShadow />
            <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
            <Suspense fallback={null}>
              <Meteor_pre_Model />
            </Suspense>
            <OrbitControls enableZoom={false} enableRotate={false} />
          </Canvas>
        </div>

        <h2>💥 Explosion Info</h2>
        <p><strong>Location:</strong> {markerLat.toFixed(4)}, {markerLon.toFixed(4)}</p>
        <p><strong>Estimated Radius:</strong> Expanding up to 5 km 🌍</p>
        <p>Click anywhere on the map to drop a marker 📍</p>

        <h2 className="impact-title">📊 Impact Data</h2>
        <ul className="impact-list">
          <li>Impact Velocity: ~20 km/s 🚀</li>
          <li>Energy Release: ~500 MT TNT equivalent 💣</li>
          <li>Crater Size: ~1.2 km wide 🕳️</li>
          <li>Shockwave Radius: ~20 km 🌪️</li>
        </ul>
      </div>
    </div>
  );
}

// ------------------ Simulation Scene ------------------
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
  return <primitive ref={earthRef} object={scene} scale={1} />;
}

function SimulationScene({ markerLat, markerLon, explosion_radius }) {
  const earthRef = useRef();
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
      <Suspense fallback={null}>
        <EarthModel earthRef={earthRef} />
        {markerLat && markerLon && (
          <EarthMarker lat={markerLat} lon={markerLon} volume={explosion_radius / 1000} />
        )}
      </Suspense>
      <OrbitControls enableZoom={true} enableRotate={true} />
    </>
  );
}
useGLTF.preload("Models/earth.glb");

export default Screen;
