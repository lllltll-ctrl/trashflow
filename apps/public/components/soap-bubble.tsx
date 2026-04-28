'use client';

import { useCallback, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const POP_DURATION_MS = 380;
const RESPAWN_MS = 1500;
const DRAG_THRESHOLD_PX = 8;

const BUBBLE_RADIUS = 1.2;
const CAMERA_Z = 5.6;

/**
 * Interactive 3D soap bubble. Drag rotates it (with momentum), tap pops it
 * with a brief expand-then-collapse animation, and after 1.5s a fresh bubble
 * respawns. Uses MeshTransmissionMaterial for realistic real-time refraction
 * + chromatic aberration without requiring an HDR environment fetch — the
 * scene's emerald background is what gets refracted through the bubble.
 */
function Bubble({ onPop }: { onPop: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const popStart = useRef<number | null>(null);
  const dragState = useRef({
    pressed: false,
    moved: 0,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  });
  const [popped, setPopped] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (popped) return;
      e.stopPropagation();
      dragState.current = {
        pressed: true,
        moved: 0,
        lastX: e.clientX,
        lastY: e.clientY,
        velocityX: 0,
        velocityY: 0,
      };
      const target = e.target as Element & { setPointerCapture?: (id: number) => void };
      target.setPointerCapture?.(e.pointerId);
    },
    [popped],
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const ds = dragState.current;
      if (!ds.pressed || popped) return;
      const dx = e.clientX - ds.lastX;
      const dy = e.clientY - ds.lastY;
      ds.lastX = e.clientX;
      ds.lastY = e.clientY;
      ds.moved += Math.hypot(dx, dy);
      ds.velocityX = dy * 0.005;
      ds.velocityY = dx * 0.005;
      if (groupRef.current) {
        groupRef.current.rotation.x += dy * 0.005;
        groupRef.current.rotation.y += dx * 0.005;
      }
    },
    [popped],
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const ds = dragState.current;
      const wasPressed = ds.pressed;
      ds.pressed = false;
      const target = e.target as Element & { releasePointerCapture?: (id: number) => void };
      target.releasePointerCapture?.(e.pointerId);
      if (!wasPressed) return;
      if (ds.moved < DRAG_THRESHOLD_PX && !popped) {
        setPopped(true);
        popStart.current = performance.now();
        onPop();
        window.setTimeout(() => setHidden(true), POP_DURATION_MS);
        window.setTimeout(() => {
          setPopped(false);
          setHidden(false);
          popStart.current = null;
          if (meshRef.current) meshRef.current.scale.setScalar(1);
        }, RESPAWN_MS);
      }
    },
    [popped, onPop],
  );

  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return;
    if (popped && popStart.current !== null) {
      const elapsed = performance.now() - popStart.current;
      const peakAt = POP_DURATION_MS * 0.28;
      if (elapsed < peakAt) {
        meshRef.current.scale.setScalar(1 + (elapsed / peakAt) * 0.45);
      } else if (elapsed < POP_DURATION_MS) {
        const t = (elapsed - peakAt) / (POP_DURATION_MS - peakAt);
        meshRef.current.scale.setScalar(1.45 * (1 - t));
      } else {
        meshRef.current.scale.setScalar(0);
      }
      return;
    }
    if (!dragState.current.pressed) {
      groupRef.current.rotation.y += 0.0035 + dragState.current.velocityY;
      groupRef.current.rotation.x += dragState.current.velocityX;
      dragState.current.velocityX *= 0.94;
      dragState.current.velocityY *= 0.94;
    }
  });

  if (hidden) return null;

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[BUBBLE_RADIUS, 128, 128]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.04}
          ior={1.33}
          roughness={0}
          chromaticAberration={0.06}
          anisotropicBlur={0.02}
          distortion={0.25}
          distortionScale={0.2}
          temporalDistortion={0.05}
          backside
          samples={4}
          resolution={128}
          transparent
          opacity={popped ? 0.45 : 1}
          color="#ffffff"
        />
      </mesh>
      {/* Iridescent rim shell — slightly larger sphere with iridescent
          physical material rendered as a thin halo to give the bubble its
          characteristic soap-film color shift on the edges. */}
      <mesh scale={1.015}>
        <sphereGeometry args={[BUBBLE_RADIUS, 96, 96]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0}
          metalness={0}
          iridescence={1}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[300, 900]}
          transparent
          opacity={popped ? 0.2 : 0.35}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function SoapBubble() {
  const popCountRef = useRef(0);
  return (
    <div
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
      role="img"
      aria-label="Інтерактивна мильна бульбашка — крутіть або торкніться, щоб лопнути"
    >
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#ffffff" />
        <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#FFD23F" />
        <pointLight position={[2, -2, 3]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-2, 3, 2]} intensity={0.5} color="#a8e6c8" />

        {/* Tiny sparkles inside the bubble — read as the "dust" you see
            floating inside a real soap bubble. */}
        <Sparkles
          count={14}
          scale={BUBBLE_RADIUS * 1.4}
          size={2.4}
          speed={0.35}
          opacity={0.55}
          color="#ffffff"
        />
        <Bubble
          onPop={() => {
            popCountRef.current += 1;
          }}
        />
      </Canvas>
    </div>
  );
}
