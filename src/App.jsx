import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from 'three';
import backgroundMusic from './audio/eerie-ambient-10-205803.mp3';


// =====================================================================
// Camera Rig Component (No changes needed here)
// =====================================================================
const SITTING_POSITION = new THREE.Vector3(0, 20, -5);
const SITTING_TARGET = new THREE.Vector3(0, 20, 10);
const STANDING_POSITION = new THREE.Vector3(-30, 25, -15);
const STANDING_TARGET = new THREE.Vector3(-5, 8, 10);

function CameraRig({ isSitting, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    // Initialize camera and controls at standing position
    if (controlsRef.current) {
      if (isSitting) {
        camera.position.copy(SITTING_POSITION);
        controlsRef.current.target.copy(SITTING_TARGET);
      } else {
        camera.position.copy(STANDING_POSITION);
        controlsRef.current.target.copy(STANDING_TARGET);
      }
      controlsRef.current.update();
    }
  }, []); // run only once at mount

  useEffect(() => {
    // On state change, snap target instantly when switching to standing
    if (!isSitting && controlsRef.current) {
      controlsRef.current.target.copy(STANDING_TARGET);
    }
  }, [isSitting, controlsRef]);

  useFrame((state, delta) => {
    const targetPosition = isSitting ? SITTING_POSITION : STANDING_POSITION;
    camera.position.lerp(targetPosition, delta * 1.5);

    if (isSitting && controlsRef.current) {
      controlsRef.current.target.lerp(SITTING_TARGET, delta * 1.5);
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return null;
}



// =====================================================================
// OfficeDesk Component (Updated with correct mesh names)
// =====================================================================
function OfficeDesk({ setIsSitting, ...props }) {
  const { scene } = useGLTF("/models/office_desk.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.flatShading = false;
          child.material.shadowSide = THREE.BackSide;
          const baseColor = new THREE.Color(child.material.color);
          child.material.emissive = baseColor.multiplyScalar(0.2);
          child.material.emissiveIntensity = 0.5;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  const handlePointerOver = (event) => {
    event.stopPropagation();
    const hoveredMesh = event.object;
    if (hoveredMesh.material) {
      hoveredMesh.material.emissive.set("cyan");
      hoveredMesh.material.emissiveIntensity = 0.4;
    }
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    const hoveredMesh = event.object;
    if (hoveredMesh.material) {
      const baseColor = new THREE.Color(hoveredMesh.material.color);
      hoveredMesh.material.emissive.copy(baseColor.multiplyScalar(0.2));
      hoveredMesh.material.emissiveIntensity = 0.5;
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    const clickedMesh = event.object;

    const meshName = clickedMesh.name;

    // ✅ Based on your list:
    // 'Object_22' is the Chair
    // 'Object_2' is the Monitor
    if (meshName === 'Object_22' || meshName === 'Object_2') {
      setIsSitting(true);
    }
  };

  return (
    <primitive
      object={scene}
      {...props}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}


// =====================================================================
// Main App Component
// =====================================================================
export default function App() {
  const audioRef = useRef(null);
  const controlsRef = useRef();
  const [isSitting, setIsSitting] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(error => {
          console.error("Audio play failed:", error);
        });
      }
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", backgroundColor: "#202020ff" }}>
      <audio ref={audioRef} src={backgroundMusic} loop></audio>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          physicallyCorrectLights: true,
          toneMappingExposure: 0.8,
          shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
        }}
      >
        <ambientLight intensity={0} />
        <directionalLight castShadow position={[5, 10, 500]} intensity={0.5} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-radius={4} shadow-bias={-0.0005} />
        <directionalLight castShadow position={[0, 20, 10]} intensity={1} shadow-mapSize-width={4096} shadow-mapSize-height={4096} shadow-radius={8} shadow-bias={-0.0005} shadow-normalBias={0.02} />
        <pointLight position={[50, 25, 0]} intensity={3000} color="red" distance={150} castShadow />
        <pointLight position={[0, 50, 30]} intensity={6000} color="yellow" distance={100} castShadow />
        <OfficeDesk scale={0.5} position={[0, -1, 0]} setIsSitting={setIsSitting} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 10]} receiveShadow >
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#111111" transparent={true} opacity={0.7} />
        </mesh>
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={isSitting ? Math.PI / 2 : Math.PI * 2}
          minDistance={isSitting ? 5 : 50}   // keep a consistent distance while standing
          maxDistance={isSitting ? 20 : 50}  // lock distance when standing
        />

        <CameraRig isSitting={isSitting} controlsRef={controlsRef} />
      </Canvas>

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", backgroundColor: "rgba(185, 54, 54, 0.17)", backdropFilter: "blur(0.65px) saturate(200%) brightness(150%)", WebkitBackdropFilter: "blur(1px) saturate(120%) brightness(105%)", mixBlendMode: "screen", boxShadow: "0 0 40px rgba(255, 180, 180, 0.6) inset", }} ></div>

      {isSitting && (
        <button onClick={() => setIsSitting(false)} style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, padding: '12px 24px', fontSize: '16px', backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', backdropFilter: 'blur(5px)', }} >
          Stand Up
        </button>
      )}
    </div>
  );
}