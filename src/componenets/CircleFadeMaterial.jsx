import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Create a simple circular feathered shader
const CircleFadeMaterial = shaderMaterial(
  { uColor: new THREE.Color('#1a1a1a'), uRadius: 50, uFeather: 15 },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv * 2.0 - 1.0; // center uv at 0,0
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform vec3 uColor;
    uniform float uRadius;
    uniform float uFeather;
    varying vec2 vUv;
    void main() {
      float dist = length(vUv) * uRadius;
      float alpha = smoothstep(uRadius, uRadius - uFeather, dist);
      gl_FragColor = vec4(uColor, alpha);
    }
  `
);

extend({ CircleFadeMaterial });
