'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Base Robot Component
interface BaseRobotProps {
  config: any;
  children?: React.ReactNode;
}

const BaseRobot: React.FC<BaseRobotProps> = ({ config, children }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = config.position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={config.scale || 1}
      position={config.position || [0, 0, 0]}
      rotation={config.rotation || [0, 0, 0]}
    >
      {children}
    </group>
  );
};

// Home Page: Futuristic Robot Scanner
export const RobotScanner: React.FC<{ config: any }> = ({ config }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scannerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Breathing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }

    if (scannerRef.current) {
      // Scanner rotation
      scannerRef.current.rotation.y = state.clock.elapsedTime * 2;
      // Scanner pulsing
      const material = scannerRef.current.material as THREE.MeshStandardMaterial;
      if (material.emissive) {
        material.emissive.setRGB(
          0.1 + Math.sin(state.clock.elapsedTime * 4) * 0.1,
          0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2,
          0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3
        );
      }
    }
  });

  return (
    <BaseRobot config={config}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* Robot body */}
        <boxGeometry args={[1, 1.5, 0.5]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#001122"
          emissiveIntensity={0.2}
        />

        {/* Scanner head */}
        <mesh ref={scannerRef} position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial
            color="#2a2a4e"
            metalness={0.9}
            roughness={0.1}
            emissive="#002244"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Scanner beam */}
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.5, 16]} />
          <meshStandardMaterial
            color="#00C4FF"
            emissive="#00C4FF"
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.15, 0.9, 0.21]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#00C4FF"
            emissive="#00C4FF"
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.15, 0.9, 0.21]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#00C4FF"
            emissive="#00C4FF"
            emissiveIntensity={0.8}
          />
        </mesh>
      </mesh>
    </BaseRobot>
  );
};

// About Page: AI Brain
export const AIBrain: React.FC<{ config: any }> = ({ config }) => {
  const brainRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (brainRef.current) {
      // Pulsing brain
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      brainRef.current.scale.setScalar(scale);

      // Emissive pulsing
      const material = brainRef.current.material as THREE.MeshStandardMaterial;
      if (material.emissive) {
        material.emissive.setRGB(
          0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.1,
          0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.15,
          0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2
        );
      }
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01;
    }
  });

  return (
    <BaseRobot config={config}>
      <mesh ref={brainRef} castShadow receiveShadow>
        {/* Brain shape approximation */}
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshStandardMaterial
          color="#2a2a4e"
          metalness={0.3}
          roughness={0.7}
          emissive="#001133"
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Neural network particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={new Float32Array(Array.from({ length: 150 }, () => (Math.random() - 0.5) * 2))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#00C4FF"
          transparent
          opacity={0.6}
        />
      </points>
    </BaseRobot>
  );
};

// Projects Page: Robotic Arms Builder
export const RoboticArms: React.FC<{ config: any }> = ({ config }) => {
  const arm1Ref = useRef<THREE.Group>(null);
  const arm2Ref = useRef<THREE.Group>(null);
  const toolRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (arm1Ref.current) {
      arm1Ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.3;
    }
    if (arm2Ref.current) {
      arm2Ref.current.rotation.z = Math.sin(state.clock.elapsedTime + Math.PI) * 0.3;
    }
    if (toolRef.current) {
      toolRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <BaseRobot config={config}>
      {/* Base */}
      <mesh position={[0, -1, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 16]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Arm 1 */}
      <group ref={arm1Ref} position={[0, -0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
          <meshStandardMaterial
            color="#2a2a4e"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Arm 2 */}
      <group ref={arm2Ref} position={[0, 0.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
          <meshStandardMaterial
            color="#2a2a4e"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Tool */}
      <mesh ref={toolRef} position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.1]} />
        <meshStandardMaterial
          color="#00C4FF"
          emissive="#00C4FF"
          emissiveIntensity={0.5}
        />
      </mesh>
    </BaseRobot>
  );
};

// Services Page: Data Bot
export const DataBot: React.FC<{ config: any }> = ({ config }) => {
  const botRef = useRef<THREE.Mesh>(null);
  const dataStreamsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (botRef.current) {
      botRef.current.rotation.y += 0.01;
    }
    if (dataStreamsRef.current) {
      dataStreamsRef.current.rotation.y -= 0.02;
    }
  });

  return (
    <BaseRobot config={config}>
      <mesh ref={botRef} castShadow receiveShadow>
        {/* Bot body */}
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#001122"
          emissiveIntensity={0.3}
        />

        {/* Data streams */}
        <group ref={dataStreamsRef}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * 1.2,
                Math.sin((i / 8) * Math.PI * 2) * 1.2,
                0
              ]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
              <meshStandardMaterial
                color="#00C4FF"
                emissive="#00C4FF"
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>
      </mesh>
    </BaseRobot>
  );
};

// Contact Page: Assistant Bot
export const AssistantBot: React.FC<{ config: any }> = ({ config }) => {
  const botRef = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (botRef.current) {
      // Gentle bobbing
      botRef.current.position.y = config.position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    }
    if (armRef.current) {
      // Waving motion
      armRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.3;
    }
  });

  return (
    <BaseRobot config={config}>
      <mesh ref={botRef} castShadow receiveShadow>
        {/* Bot body */}
        <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#001122"
          emissiveIntensity={0.2}
        />

        {/* Head */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshStandardMaterial
            color="#2a2a4e"
            metalness={0.9}
            roughness={0.1}
            emissive="#002244"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.1, 0.9, 0.25]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#00C4FF"
            emissive="#00C4FF"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh position={[0.1, 0.9, 0.25]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#00C4FF"
            emissive="#00C4FF"
            emissiveIntensity={1}
          />
        </mesh>

        {/* Waving arm */}
        <group ref={armRef} position={[0.6, 0.3, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.6, 4, 6]} />
            <meshStandardMaterial
              color="#2a2a4e"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.4, 0]} castShadow>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      </mesh>
    </BaseRobot>
  );
};