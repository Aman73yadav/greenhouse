import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Environment, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import Fullscreen3DWrapper from './Fullscreen3DWrapper';
import { Slider } from '@/components/ui/slider';

// Helper component to capture scene reference
const SceneCapture = ({ sceneRef }: { sceneRef: React.RefObject<THREE.Scene | null> }) => {
  const { scene } = useThree();
  useEffect(() => {
    if (sceneRef && 'current' in sceneRef) {
      (sceneRef as React.MutableRefObject<THREE.Scene | null>).current = scene;
    }
  }, [scene, sceneRef]);
  return null;
};

// Floating label component
interface PlantLabelProps {
  plantType: string;
  growthStage: number;
  position: [number, number, number];
}

const PlantLabel: React.FC<PlantLabelProps> = ({ plantType, growthStage, position }) => {
  const labelY = 0.2 + (growthStage / 100) * 2.2;
  
  return (
    <Html
      position={[position[0], labelY, position[2]]}
      center
      distanceFactor={8}
      occlude={false}
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-1.5 shadow-lg text-center whitespace-nowrap">
        <div className="text-sm font-semibold capitalize text-foreground">{plantType}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ 
              backgroundColor: growthStage < 30 ? '#EF4444' : growthStage < 60 ? '#F59E0B' : '#22C55E' 
            }} 
          />
          {growthStage}% grown
        </div>
      </div>
    </Html>
  );
};

interface PlantProps {
  growthStage: number;
  plantType: 'tomato' | 'lettuce' | 'pepper' | 'cucumber';
  position: [number, number, number];
  performanceMode: boolean;
  showLabel?: boolean;
}

// Enhanced plant component with better visuals
const Plant: React.FC<PlantProps> = ({ growthStage, plantType, position, performanceMode, showLabel = true }) => {
  const plantRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);
  
  const stemHeight = useMemo(() => 0.1 + (growthStage / 100) * 2, [growthStage]);
  const leafScale = useMemo(() => 0.3 + (growthStage / 100) * 1, [growthStage]);
  
  useFrame((state) => {
    if (leavesRef.current && !performanceMode) {
      leavesRef.current.children.forEach((leaf, i) => {
        leaf.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + i * 0.5) * 0.08;
        leaf.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 + i * 0.3) * 0.03;
      });
    }
    // Subtle plant sway
    if (plantRef.current && !performanceMode) {
      plantRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  const plantColors = {
    tomato: { stem: '#2D5016', leaf: '#3D8B3D', fruit: growthStage > 70 ? '#E53935' : '#8BC34A' },
    lettuce: { stem: '#4CAF50', leaf: '#81C784', fruit: '#81C784' },
    pepper: { stem: '#2E7D32', leaf: '#4CAF50', fruit: growthStage > 70 ? '#FF5722' : '#66BB6A' },
    cucumber: { stem: '#388E3C', leaf: '#66BB6A', fruit: '#558B2F' },
  };

  const colors = plantColors[plantType];
  const numLeaves = Math.min(12, Math.floor(growthStage / 8) + 3);
  const showFruits = growthStage > 50 && (plantType === 'tomato' || plantType === 'pepper' || plantType === 'cucumber');
  const numFruits = showFruits ? Math.floor((growthStage - 50) / 12) : 0;

  return (
    <group ref={plantRef} position={position}>
      {/* Floating label */}
      {showLabel && <PlantLabel plantType={plantType} growthStage={growthStage} position={[0, 0, 0]} />}
      
      {/* Premium terracotta pot */}
      <group position={[0, -0.2, 0]}>
        {/* Pot body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.28, 0.4, 20]} />
          <meshStandardMaterial 
            color="#B7522A" 
            roughness={0.7} 
            metalness={0.1}
          />
        </mesh>
        {/* Pot rim */}
        <mesh position={[0, 0.2, 0]}>
          <torusGeometry args={[0.35, 0.04, 8, 20]} />
          <meshStandardMaterial color="#A0431D" roughness={0.6} />
        </mesh>
        {/* Inner rim detail */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 20]} />
          <meshStandardMaterial color="#8B3A18" roughness={0.8} />
        </mesh>
      </group>
      
      {/* Rich soil with mulch texture */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 20]} />
        <meshStandardMaterial color="#3E2723" roughness={0.95} />
      </mesh>
      
      {/* Main stem with segments */}
      <group>
        {[...Array(Math.max(3, Math.floor(stemHeight / 0.3)))].map((_, i) => {
          const segmentHeight = stemHeight / Math.max(3, Math.floor(stemHeight / 0.3));
          const thickness = 0.035 - (i * 0.003);
          return (
            <mesh key={i} position={[0, i * segmentHeight + segmentHeight / 2, 0]}>
              <cylinderGeometry args={[thickness * 0.8, thickness, segmentHeight, 8]} />
              <meshStandardMaterial color={colors.stem} roughness={0.7} />
            </mesh>
          );
        })}
      </group>
      
      {/* Enhanced leaves */}
      <group ref={leavesRef} position={[0, 0.1, 0]}>
        {[...Array(numLeaves)].map((_, i) => {
          const angle = (i / numLeaves) * Math.PI * 2 + (i % 2) * 0.3;
          const height = (i / numLeaves) * stemHeight * 0.85 + 0.15;
          const sizeVariation = 0.8 + Math.random() * 0.4;
          const droop = Math.min(0.5, i * 0.03);
          
          return (
            <Float 
              key={i} 
              speed={performanceMode ? 0 : 1.5} 
              rotationIntensity={performanceMode ? 0 : 0.1} 
              floatIntensity={performanceMode ? 0 : 0.1}
            >
              <group 
                position={[0, height, 0]} 
                rotation={[droop, angle, Math.PI / 5 + droop]}
              >
                {/* Leaf blade */}
                <mesh position={[0.18 * leafScale * sizeVariation, 0, 0]} rotation={[0, 0, -0.2]}>
                  <sphereGeometry args={[0.12 * leafScale * sizeVariation, 6, 4]} />
                  <meshStandardMaterial 
                    color={colors.leaf}
                    roughness={0.5}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Leaf vein */}
                <mesh position={[0.1 * leafScale * sizeVariation, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <cylinderGeometry args={[0.008, 0.003, 0.15 * leafScale * sizeVariation, 4]} />
                  <meshStandardMaterial color={colors.stem} roughness={0.6} />
                </mesh>
              </group>
            </Float>
          );
        })}
      </group>
      
      {/* Fruits with stems */}
      {showFruits && (
        <group position={[0, stemHeight * 0.6, 0]}>
          {[...Array(numFruits)].map((_, i) => {
            const angle = (i / Math.max(numFruits, 1)) * Math.PI * 2 + 0.5;
            const fruitSize = 0.06 + ((growthStage - 50) / 50) * 0.04;
            return (
              <group key={i} position={[
                Math.cos(angle) * 0.2,
                -0.05 - i * 0.12,
                Math.sin(angle) * 0.2
              ]}>
                {/* Fruit stem */}
                <mesh rotation={[0.3 * Math.cos(angle), 0, 0.3 * Math.sin(angle)]}>
                  <cylinderGeometry args={[0.008, 0.005, 0.08, 6]} />
                  <meshStandardMaterial color="#4A7023" roughness={0.6} />
                </mesh>
                {/* Fruit */}
                <Float speed={performanceMode ? 0 : 2} floatIntensity={performanceMode ? 0 : 0.05}>
                  <mesh position={[0, -0.05, 0]}>
                    <sphereGeometry args={[fruitSize, performanceMode ? 8 : 12, performanceMode ? 8 : 12]} />
                    <meshStandardMaterial 
                      color={colors.fruit} 
                      roughness={0.3} 
                      metalness={0.1}
                    />
                  </mesh>
                </Float>
                {/* Fruit calyx (little green star on top) */}
                {plantType === 'tomato' && (
                  <mesh position={[0, -0.02, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.02, 0.015, 5]} />
                    <meshStandardMaterial color="#4A7023" roughness={0.6} />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>
      )}
      
      {/* Lettuce head */}
      {plantType === 'lettuce' && growthStage > 20 && (
        <group position={[0, 0.08, 0]}>
          {[...Array(Math.min(15, Math.floor(growthStage / 5)))].map((_, i) => {
            const angle = (i / 15) * Math.PI * 2 + i * 0.5;
            const tilt = 0.1 + (i * 0.06);
            const layerSize = 0.12 + (i * 0.01);
            return (
              <Float 
                key={i} 
                speed={performanceMode ? 0 : 1} 
                rotationIntensity={performanceMode ? 0 : 0.05}
                floatIntensity={performanceMode ? 0 : 0.02}
              >
                <mesh 
                  position={[Math.cos(angle) * 0.08 * (i / 10), i * 0.025, Math.sin(angle) * 0.08 * (i / 10)]}
                  rotation={[tilt, angle, 0]}
                >
                  <planeGeometry args={[layerSize, layerSize * 1.3]} />
                  <meshStandardMaterial 
                    color={i % 3 === 0 ? '#81C784' : '#A5D6A7'}
                    roughness={0.6}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </Float>
            );
          })}
        </group>
      )}
      
      {/* Growth indicator glow */}
      {!performanceMode && growthStage > 60 && (
        <pointLight 
          position={[0, stemHeight * 0.5, 0]} 
          intensity={0.3} 
          color="#81C784" 
          distance={1.5} 
        />
      )}
    </group>
  );
};

// Grow lights with realistic glow
const GrowLights: React.FC<{ performanceMode: boolean }> = ({ performanceMode }) => {
  const lightsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lightsRef.current && !performanceMode) {
      lightsRef.current.children.forEach((light, i) => {
        const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
        const pointLight = light.children.find(c => c.type === 'PointLight') as THREE.PointLight;
        if (pointLight) pointLight.intensity = intensity;
      });
    }
  });

  return (
    <group ref={lightsRef} position={[0, 2.5, 0]}>
      {[-2, 0, 2].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Light housing */}
          <mesh>
            <boxGeometry args={[1.2, 0.12, 0.4]} />
            <meshStandardMaterial color="#2C2C2C" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Light panel */}
          <mesh position={[0, -0.07, 0]}>
            <boxGeometry args={[1, 0.02, 0.3]} />
            <meshStandardMaterial 
              color="#FF69B4" 
              emissive="#FF1493" 
              emissiveIntensity={performanceMode ? 0.5 : 1}
            />
          </mesh>
          {/* Light glow */}
          {!performanceMode && (
            <pointLight 
              position={[0, -0.3, 0]} 
              intensity={0.6} 
              color="#FF69B4" 
              distance={4}
            />
          )}
        </group>
      ))}
      {/* Support bar */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[6, 0.05, 0.05]} />
        <meshStandardMaterial color="#404040" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// Growing table/bench
const GrowingTable: React.FC = () => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Table top */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[7, 0.1, 5]} />
        <meshStandardMaterial color="#37474F" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Table legs */}
      {[[-3, -1.8], [-3, 1.8], [3, -1.8], [3, 1.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.6, z]}>
          <boxGeometry args={[0.15, 1.1, 0.15]} />
          <meshStandardMaterial color="#263238" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* Drainage mat */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 4.5]} />
        <meshStandardMaterial color="#1B5E20" roughness={0.9} opacity={0.8} transparent />
      </mesh>
    </group>
  );
};

// Water droplets particle effect
const WaterMist: React.FC<{ performanceMode: boolean }> = ({ performanceMode }) => {
  if (performanceMode) return null;
  
  return (
    <Sparkles
      count={50}
      scale={[6, 2, 4]}
      position={[0, 1, 0]}
      size={1.5}
      speed={0.3}
      opacity={0.4}
      color="#4FC3F7"
    />
  );
};

const PlantScene: React.FC<{ 
  plants: { type: 'tomato' | 'lettuce' | 'pepper' | 'cucumber'; growthStage: number }[]; 
  controlsRef: React.RefObject<any>; 
  enableZoom: boolean;
  performanceMode: boolean;
  zoomSpeed: number;
  globalGrowthModifier: number;
}> = ({ plants, controlsRef, enableZoom, performanceMode, zoomSpeed, globalGrowthModifier }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={performanceMode ? 0.5 : 0.35} />
      <directionalLight 
        position={[8, 12, 8]} 
        intensity={performanceMode ? 0.6 : 0.8} 
        castShadow={!performanceMode}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {!performanceMode && (
        <>
          <pointLight position={[-5, 6, -5]} intensity={0.25} color="#FFE4B5" />
          <pointLight position={[5, 3, 5]} intensity={0.15} color="#87CEEB" />
        </>
      )}
      
      {/* Environment */}
      {!performanceMode && <Environment preset="warehouse" backgroundBlurriness={1} />}
      
      {/* Growing table */}
      <GrowingTable />
      
      {/* Grow lights */}
      <GrowLights performanceMode={performanceMode} />
      
      {/* Water mist effect */}
      <WaterMist performanceMode={performanceMode} />
      
      {/* Plants - arranged in a nice grid */}
      {(performanceMode ? plants.slice(0, 4) : plants).map((plant, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        // Apply global growth modifier to each plant's growth stage
        const modifiedGrowth = Math.min(100, Math.max(0, plant.growthStage * (globalGrowthModifier / 100)));
        return (
          <Plant
            key={i}
            plantType={plant.type}
            growthStage={modifiedGrowth}
            position={[(col - 1) * 2, 0, (row - 0.5) * 1.8]}
            performanceMode={performanceMode}
            showLabel={!performanceMode}
          />
        );
      })}
      
      {/* Ambient particles */}
      {!performanceMode && (
        <Sparkles
          count={30}
          scale={[8, 4, 6]}
          position={[0, 1.5, 0]}
          size={0.8}
          speed={0.2}
          opacity={0.3}
          color="#FFFACD"
        />
      )}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={enableZoom}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        zoomSpeed={zoomSpeed}
        maxPolarAngle={Math.PI / 2 + 0.2}
      />
    </>
  );
};

// Growth slider control component
const GrowthSliderControl: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="w-64">
      <div className="text-xs text-muted-foreground mb-2 flex justify-between">
        <span>Growth Stage</span>
        <span className="font-mono">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={10}
        max={100}
        step={5}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Seedling</span>
        <span>Mature</span>
        <span>Harvest</span>
      </div>
    </div>
  );
};

interface PlantGrowth3DProps {
  plants?: { type: 'tomato' | 'lettuce' | 'pepper' | 'cucumber'; growthStage: number }[];
}

const DEFAULT_CAMERA_POSITION: [number, number, number] = [5, 4, 5];
const DEFAULT_TARGET: [number, number, number] = [0, 0.5, 0];

const PlantGrowth3D: React.FC<PlantGrowth3DProps> = ({ 
  plants = [
    { type: 'tomato', growthStage: 85 },
    { type: 'lettuce', growthStage: 70 },
    { type: 'pepper', growthStage: 90 },
    { type: 'cucumber', growthStage: 55 },
    { type: 'tomato', growthStage: 40 },
    { type: 'lettuce', growthStage: 95 },
  ] 
}) => {
  const [globalGrowthModifier, setGlobalGrowthModifier] = useState(100);

  return (
    <Fullscreen3DWrapper
      title="Plant Growth Simulation"
      defaultCameraPosition={DEFAULT_CAMERA_POSITION}
      defaultTarget={DEFAULT_TARGET}
      className="bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950"
      customControls={
        <GrowthSliderControl
          value={globalGrowthModifier}
          onChange={setGlobalGrowthModifier}
        />
      }
    >
      {({ enableZoom, controlsRef, sceneRef, canvasRef, performanceMode, zoomSpeed }) => (
        <Canvas 
          camera={{ position: DEFAULT_CAMERA_POSITION, fov: 45 }}
          shadows={!performanceMode}
          dpr={performanceMode ? 1 : [1, 2]}
          gl={{ preserveDrawingBuffer: true }}
        >
          <SceneCapture sceneRef={sceneRef} />
          <color attach="background" args={['#0F1A0F']} />
          <fog attach="fog" args={['#0F1A0F', 8, 25]} />
          <PlantScene 
            plants={plants} 
            controlsRef={controlsRef} 
            enableZoom={enableZoom} 
            performanceMode={performanceMode} 
            zoomSpeed={zoomSpeed}
            globalGrowthModifier={globalGrowthModifier}
          />
        </Canvas>
      )}
    </Fullscreen3DWrapper>
  );
};

export default PlantGrowth3D;