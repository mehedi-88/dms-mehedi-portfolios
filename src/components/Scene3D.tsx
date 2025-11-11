'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { RobotScanner, AIBrain, RoboticArms, DataBot, AssistantBot } from './models/RobotModels';
import * as THREE from 'three';
import { getModelForPath } from '../../models/config';

// Loading fallback component
const LoadingFallback = () => (
  <Html center>
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C4FF]"></div>
    </div>
  </Html>
);

// Particle system for background glow
const ParticleSystem = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  useEffect(() => {
    if (!pointsRef.current) return;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      colors[i * 3] = 0; // R
      colors[i * 3 + 1] = 0.76; // G (196/255)
      colors[i * 3 + 2] = 1; // B (255/255)
    }

    pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Camera controller with smooth transitions
const CameraController = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

// Lighting setup
const Lighting = () => (
  <>
    <ambientLight intensity={0.3} color="#ffffff" />
    <directionalLight
      position={[10, 10, 5]}
      intensity={1}
      color="#ffffff"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00C4FF" />
    <pointLight position={[10, 10, 10]} intensity={0.3} color="#1254FF" />
  </>
);

// Main 3D Scene Component
interface Scene3DProps {
  modelPath: string;
  modelConfig: any;
  isVisible: boolean;
}

const Scene3D: React.FC<Scene3DProps> = ({ modelPath, modelConfig, isVisible }) => {
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Handle tab visibility for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        frameloop={isTabVisible ? "always" : "never"}
      >
        <Suspense fallback={<LoadingFallback />}>
          <CameraController />
          <Lighting />

          {/* Environment and background */}
          <color attach="background" args={['#000000']} />

          {/* Particle system */}
          <ParticleSystem />

          {/* Dynamic model loading */}
          <Suspense fallback={<LoadingFallback />}>
            <DynamicModelLoader
              modelPath={modelPath}
              config={modelConfig}
              isVisible={isVisible}
            />
          </Suspense>

          {/* Post-processing effects */}
          {typeof window !== 'undefined' && (
            <EffectComposer>
              <Bloom
                intensity={0.3}
                kernelSize={2}
                luminanceThreshold={0.9}
                luminanceSmoothing={0.025}
                blendFunction={BlendFunction.ADD}
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </motion.div>
  );
};

// Dynamic model loader component
interface DynamicModelLoaderProps {
  modelPath: string;
  config: any;
  isVisible: boolean;
}

const DynamicModelLoader: React.FC<DynamicModelLoaderProps> = ({ modelPath, config, isVisible }) => {
  const renderModel = () => {
    switch (config.animation) {
      case 'scan':
        return <RobotScanner config={config} />;
      case 'pulse':
        return <AIBrain config={config} />;
      case 'build':
        return <RoboticArms config={config} />;
      case 'project':
        return <DataBot config={config} />;
      case 'greet':
        return <AssistantBot config={config} />;
      case 'monitor':
        return <RobotScanner config={config} />; // Security bot similar to scanner
      case 'communicate':
        return <DataBot config={config} />; // Communications bot similar to data bot
      case 'process':
        return <AIBrain config={config} />; // AI core similar to brain
      case 'assist':
        return <AssistantBot config={config} />; // Info bot similar to assistant
      default:
        return <RobotScanner config={config} />;
    }
  };

  return (
    <group>
      {renderModel()}
    </group>
  );
};

export default Scene3D;