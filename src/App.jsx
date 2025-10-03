import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from 'three';
import { FileText, Github, Laptop, Linkedin, Mail } from 'lucide-react'; // ✨ IMPORT ICONS

// Audio and Asset Imports
import backgroundMusic from './audio/eerie-ambient-10-205803.mp3';
import crunchy from './audio/crumpling-paper-44860.mp3';
import cv from './assets/CV.png';
import mouseClickSound from './audio/mouse-click-290204.mp3';
import tableTapSound from './audio/scratching-83601.mp3';
import chairSound from './audio/sitting.mp3';
import phonePickupSound from './audio/pick-up.mp3';
import phoneLoopSound from './audio/phone.mp3';
import monitorLoopSound from './audio/computer.mp3';
import phoneScreen from './assets/Telephone.png';
import monitorScreen from './assets/Monitor.png'; // Your monitor image with a transparent center
import { color } from "three/tsl";


// =====================================================================
// Camera Rig Component (No changes here)
// =====================================================================
const SITTING_POSITION = new THREE.Vector3(0, 25, -5);
const SITTING_TARGET = new THREE.Vector3(0, 20, 10);
const STANDING_POSITION = new THREE.Vector3(-30, 25, -15);
const STANDING_TARGET = new THREE.Vector3(-5, 8, 10);

function CameraRig({ isSitting, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!isSitting && controlsRef.current) {
      controlsRef.current.target.copy(STANDING_TARGET);
    }
  }, [isSitting, controlsRef]);

  useFrame((state, delta) => {
    const targetPosition = isSitting ? SITTING_POSITION : STANDING_POSITION;
    const speed = delta * 1.5;
    const epsilon = 0.01;

    if (camera.position.distanceTo(targetPosition) > epsilon) {
      camera.position.lerp(targetPosition, speed);
    }

    if (controlsRef.current) {
      if (isSitting) {
        if (controlsRef.current.target.distanceTo(SITTING_TARGET) > epsilon) {
          controlsRef.current.target.lerp(SITTING_TARGET, speed);
        }
      }
      controlsRef.current.update();
    }
  });

  return null;
}


// =====================================================================
// OfficeDesk Component (No changes here)
// =====================================================================
function OfficeDesk({ setIsSitting, isSitting, setIsPaperOpen, setIsPhoneOpen, setIsMonitorOpen, ...props }) {
  const { scene } = useGLTF("/models/office_desk2.glb");

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

    if (meshName === 'Object_14' || meshName === 'Object_5') {
      new Audio(phonePickupSound).play();
      setIsSitting(true);
      setTimeout(() => {
        setIsPhoneOpen(true);
      }, 800);
    }

    if (meshName === 'Object_40') {
      new Audio(tableTapSound).play();
    }

    if (meshName === 'Object_21' || meshName === 'Object_22' || meshName === 'Object_23' || meshName === 'Object_24') {
      if (!isSitting) {
        new Audio(chairSound).play();
        setIsSitting(true);
      }
    }
    
    if (meshName === 'Object_3' || meshName === 'Object_2') {
      new Audio(mouseClickSound).play();
      if (!isSitting) {
        new Audio(chairSound).play();
        setIsSitting(true);
        setTimeout(() => {
          setIsMonitorOpen(true);
        }, 800);
      } else {
        setIsMonitorOpen(true);
      }
    }

    if (meshName === 'Object_25' || meshName === 'Object_30' || meshName === 'Object_29' || meshName === 'Object_28') {
      new Audio(crunchy).play();

      if (!isSitting) {
        new Audio(chairSound).play();
        setIsSitting(true);
        setTimeout(() => {
          setIsPaperOpen(true);
        }, 800);
      } else {
        setIsPaperOpen(true);
      }
      return;
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
// Paper Interface Component (No changes here)
// =====================================================================
function PaperInterface({ onClose }) {
  const interfaceStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10,
    pointerEvents: 'auto',
    backgroundColor: '#3333336f',
    fontFamily: 'monospace',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '30px',
    right: '40px',
    fontSize: '60px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#000000ff',
    zIndex: 14 // Make sure the close button is on top of everything
  };

  const cvStyle = {
    width: '100%',
    height: '100vh',
    objectFit: 'contain',
    borderRadius: '12px',
    // The image itself is no longer clickable
  };

  const handleCV = () => {
    window.open('https://drive.google.com/drive/folders/1-1PPFIQ1gCeYcLGo0XsFLxJTz8aSEWM8?usp=drive_link', '_blank');
  };

  // ✨ Style for your clickable overlay div
  const clickableAreaStyle = {
    position: 'absolute', // Allows you to position it freely
    width: '30%',         // Give it a width (adjust as needed)
    height: '80%',        // Give it a height (adjust as needed)
    marginBottom: '4%',     // Position it from the top (adjust as needed)
    backgroundColor: 'rgba(255, 0, 0, 0)', // Semi-transparent red for positioning
    zIndex: 13,           // Puts it on top of the image
    cursor: 'pointer'     // Changes the cursor to a pointer on hover
  };

  return (
    <div style={interfaceStyle}>
      <div style={closeButtonStyle} onClick={onClose}>
        &times;
      </div>
      
      {/* ✨ This div is now properly sized and positioned */}
      <div style={clickableAreaStyle} onClick={handleCV}></div>

      {/* The image is now just for display */}
      <img src={cv} alt="CV" style={cvStyle} />
    </div>
  );
}

// =====================================================================
// Phone Interface Component (No changes here)
// =====================================================================
function PhoneInterface({ onClose }) {
  const interfaceStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10,
    pointerEvents: 'auto',
    backgroundColor: '#3333336f',
    fontFamily: 'monospace',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '30px',
    right: '40px',
    fontSize: '60px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#000000ff',
    zIndex: 11
  };

  const phoneImageStyle = {
    width: '100%',
    height: '100vh',
    objectFit: 'contain',
    borderRadius: '12px',
  };

  return (
    <div style={interfaceStyle}>
      <div style={closeButtonStyle} onClick={onClose}>
        &times;
      </div>
      <img src={phoneScreen} alt="Phone Screen" style={phoneImageStyle} />
    </div>
  );
}


// =====================================================================
// Monitor Interface Component (No changes here)
// =====================================================================
function MonitorInterface({ onClose }) {
  const interfaceStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10,
    pointerEvents: 'auto',
    backgroundColor: '#3333336f',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '30px',
    right: '40px',
    fontSize: '60px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#000000ff',
    zIndex: 11
  };

  const contentWrapperStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    aspectRatio: '2/1',
    width: '90%',
    maxWidth: '1600px',
  };

  const monitorImageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 11,
    pointerEvents: 'none',
  };

  const boxStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: '38%',
    height: '70%',
    top: '-5.5%',
    left: '0.2%',
    borderRadius: '15px',
  };

  const iframeStyle = {
    position: 'absolute',
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
    border: 'none',
    backgroundColor: '#000000',
  };

  return (
    <div style={interfaceStyle}>
      <div style={closeButtonStyle} onClick={onClose}>
        &times;
      </div>

      <div style={contentWrapperStyle}>
        <div style={boxStyle}>
          <iframe
            style={iframeStyle}
            src="https://backroomsgame.io/"
            title="Monitor Content"
            scrolling="no" // ✨ ADD THIS ATTRIBUTE TO DISABLE SCROLLING
          />
        </div>
        <img
          src={monitorScreen}
          alt="Monitor Frame"
          style={monitorImageStyle}
        />
      </div>
    </div>
  );
}

// =====================================================================
// ✨ Social Links Component (NEW)
// =====================================================================
function SocialLinks() {
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const containerStyle = {
    position: 'absolute',
    bottom: '30px',
    right: '40px',
    display: 'flex',
    gap: '20px',
    zIndex: 2,
  };

  // Base style for all icons
  const baseIconStyle = {
    width: '24px',
    height: '24px',
    color: '#a0a0a0', // A faded, eerie gray
    cursor: 'pointer',
    transition: 'transform 0.3s ease, color 0.3s ease',
  };

  // Dynamically generate icon style based on hover state
  const getIconStyle = (iconName) => {
    const isHovered = hoveredIcon === iconName;
    return {
      ...baseIconStyle,
      transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      color: isHovered ? '#ffffff' : '#a0a0a0', // Brightens on hover
    };
  };

  const links = [
    { name: 'cv', Icon: FileText, href: 'https://drive.google.com/drive/folders/1-1PPFIQ1gCeYcLGo0XsFLxJTz8aSEWM8?usp=sharing' },
    { name: 'github', Icon: Github, href: 'https://github.com/Syed-Ausaf-Hasib' },
    { name: 'leetcode', Icon: Laptop, href: 'https://leetcode.com/u/Ausaf_Hasib/' },
    { name: 'linkedin', Icon: Linkedin, href: 'https://www.linkedin.com/in/ausaf-hasib-7seven7/' },
    { name: 'mail', Icon: Mail, href: 'mailto:syedausaf2003@gmail.com' }
  ];

  return (
    <div style={containerStyle}>
      {links.map(({ name, Icon, href }) => (
        <Icon
          key={name}
          style={getIconStyle(name)}
          onClick={() => window.open(href, '_blank')}
          onMouseEnter={() => setHoveredIcon(name)}
          onMouseLeave={() => setHoveredIcon(null)}
        />
      ))}
    </div>
  );
}


// =====================================================================
// Main App Component (MODIFIED)
// =====================================================================
export default function App() {
  const audioRef = useRef(null);
  const controlsRef = useRef();
  const [isSitting, setIsSitting] = useState(false);
  const [isPaperOpen, setIsPaperOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const phoneAudioRef = useRef(null);
  const monitorAudioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15;
    }
    
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

  useEffect(() => {
    const playClickSound = () => {
      new Audio(mouseClickSound).play().catch(error => {
        console.error("Click sound could not be played:", error);
      });
    };

    window.addEventListener('click', playClickSound);

    return () => {
      window.removeEventListener('click', playClickSound);
    };
  }, []);

  // Effect for looping phone audio
  useEffect(() => {
    if (isPhoneOpen) {
      phoneAudioRef.current = new Audio(phoneLoopSound);
      phoneAudioRef.current.loop = true;
      phoneAudioRef.current.volume = 0.4;
      phoneAudioRef.current.play();
    } else {
      if (phoneAudioRef.current) {
        phoneAudioRef.current.pause();
        phoneAudioRef.current = null;
      }
    }
    return () => {
      if (phoneAudioRef.current) {
        phoneAudioRef.current.pause();
        phoneAudioRef.current = null;
      }
    };
  }, [isPhoneOpen]);

  // Effect to manage looping monitor audio
  useEffect(() => {
    if (isMonitorOpen) {
      monitorAudioRef.current = new Audio(monitorLoopSound);
      monitorAudioRef.current.loop = true;
      monitorAudioRef.current.volume = 0.5;
      monitorAudioRef.current.play();
    } else {
      if (monitorAudioRef.current) {
        monitorAudioRef.current.pause();
        monitorAudioRef.current = null;
      }
    }
    return () => {
      if (monitorAudioRef.current) {
        monitorAudioRef.current.pause();
        monitorAudioRef.current = null;
      }
    };
  }, [isMonitorOpen]);

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

        <OfficeDesk
          scale={0.5}
          position={[0, -1, 0]}
          setIsSitting={setIsSitting}
          isSitting={isSitting}
          setIsPaperOpen={setIsPaperOpen}
          setIsPhoneOpen={setIsPhoneOpen}
          setIsMonitorOpen={setIsMonitorOpen}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 10]} receiveShadow >
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#111111" transparent={true} opacity={0.7} />
        </mesh>
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={isSitting ? Math.PI / 2 : Math.PI * 2}
          minDistance={isSitting ? 5 : 50}
          maxDistance={isSitting ? 20 : 50}
        />

        <CameraRig isSitting={isSitting} controlsRef={controlsRef} />
      </Canvas>

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", backgroundColor: "rgba(185, 54, 54, 0.17)", backdropFilter: "blur(0.65px) saturate(200%) brightness(150%)", WebkitBackdropFilter: "blur(1px) saturate(120%) brightness(105%)", mixBlendMode: "screen", boxShadow: "0 0 40px rgba(255, 180, 180, 0.6) inset", }} ></div>

      {isSitting && (
        <button
          onClick={() => setIsSitting(false)}
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: 'rgba(15, 15, 15, 0.8)',
            color: '#d8d8d8ff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 0 12px rgba(0, 0, 0, 0.25)',
            transition: 'transform 0.3s ease, background-color 0.3s ease',
          }}
        >
          Stand up
        </button>
      )}

      {isPaperOpen && <PaperInterface onClose={() => setIsPaperOpen(false)} />}
      {isPhoneOpen && <PhoneInterface onClose={() => setIsPhoneOpen(false)} />}
      {isMonitorOpen && <MonitorInterface onClose={() => setIsMonitorOpen(false)} />}
      
      {/* ✨ ADDED SOCIAL LINKS COMPONENT HERE */}
      <SocialLinks />
    </div>
  );
}