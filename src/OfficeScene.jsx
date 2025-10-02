import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

export function OfficeScene({ setView, currentView, ...props }) {
  const { scene, nodes } = useGLTF("/models/office_desk.glb");

  // Find the specific meshes. The names ('Chair', 'Monitor', 'Phone')
  // must match the names of the objects in your GLB file.
  // Use a tool like Blender to name your objects before exporting.
  const chair = useMemo(() => nodes['Chair'], [nodes]);
  const monitor = useMemo(() => nodes['Monitor'], [nodes]);
  const phone = useMemo(() => nodes['Phone'], [nodes]);
  
  const handleObjectClick = (targetView) => {
    // If we are standing, the first click on any object should make us sit.
    if (currentView === 'default') {
      setView('sitting');
      // After a short delay to let the sit animation start,
      // transition to the object view.
      setTimeout(() => setView(targetView), 800);
    } else {
      // If already sitting, just switch to the new view.
      setView(targetView);
    }
  };

  return (
    <group {...props}>
      {/* Render the whole scene, but make specific parts clickable */}
      <primitive object={scene} />

      {/* Add invisible meshes for clicking if needed, or attach to existing ones */}
      {chair && <primitive object={chair} onClick={() => setView('sitting')} />}
      {monitor && <primitive object={monitor} onClick={() => handleObjectClick('monitor')} />}
      {phone && <primitive object={phone} onClick={() => handleObjectClick('phone')} />}
    </group>
  );
}

// Preload the model so it's ready instantly
useGLTF.preload("/models/office_desk.glb");