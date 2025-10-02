import React, { useRef, useEffect } from "react"; // Import useRef and useEffect
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
//... (keep other imports)
import * as THREE from 'three';
import backgroundMusic from './audio/eerie-ambient-10-205803.mp3';

// OfficeDesk component remains the same...
function OfficeDesk(props) {
  // ... (no changes needed here)
  const { scene } = useGLTF("/models/office_desk.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;     // ✅ allow desk objects to cast shadows
        child.receiveShadow = true;

        if (child.material) {
          child.material.flatShading = false;
          // ✅ FIX: Use the back side of the mesh for shadow generation to prevent self-shadowing artifacts (acne)
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

  return (
    <primitive
      object={scene}
      {...props}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}


export default function App() {
  // 1. Create a ref to get direct access to the audio element
  const audioRef = useRef(null);

  // 2. Use useEffect to add a one-time event listener
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
        camera={{ position: [-50, 30, -50], fov: 40 }}
        dpr={[1, 1.5]} // lower device pixel ratio (saves memory)
        gl={{
          physicallyCorrectLights: true,
          toneMappingExposure: 0.8,
          shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap }, // ✅ soft blurred shadows
        }}
      >
        <ambientLight intensity={0} />

        {/* Original directional light */}
        <directionalLight
          castShadow
          position={[5, 10, 500]}
          intensity={0.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-radius={4} // ✅ blur
          shadow-bias={-0.0005}   // ✅ prevent acne
        />

        {/* ✅ New overhead "12 o'clock" sun light for blurred shadows */}
        <directionalLight
          castShadow
          position={[0, 20, 10]}   // overhead + slightly forward
          intensity={1}
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-radius={8}         // ✅ stronger blur
          shadow-bias={-0.0005}   // ✅ prevent acne
          shadow-normalBias={0.02}
        />

        {/* Original point lights (unchanged) */}
        <pointLight position={[50, 25, 0]} intensity={3000} color="red" distance={150} castShadow />
        <pointLight position={[0, 50, 30]} intensity={6000} color="yellow" distance={100} castShadow />

        {/* GLTF Office Desk */}
        <OfficeDesk scale={0.5} position={[0, -1, 0]} />

        {/* Shadow-catching plane */}
        {/* Shadow-catching plane (fixed to remove acne/texture issues) */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.1, 10]}
          receiveShadow
        >
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial
            color="#111111"      // dark neutral floor
            transparent={true}
            opacity={0.7}        // lets lighting glow through
          />
        </mesh>


        <OrbitControls target={[0, 10, 10]} enableDamping dampingFactor={0.05} />
      </Canvas>

      {/* Blurred atmospheric overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
          backgroundColor: "rgba(185, 54, 54, 0.17)",
          backdropFilter: "blur(0.65px) saturate(200%) brightness(150%)",
          WebkitBackdropFilter: "blur(1px) saturate(120%) brightness(105%)",
          mixBlendMode: "screen",
          boxShadow: "0 0 40px rgba(255, 180, 180, 0.6) inset",
        }}
      ></div>
    </div>
  );
}