import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Float, Environment, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import Fullscreen3DWrapper from './Fullscreen3DWrapper';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, X, Droplets, Sun, Thermometer, Calendar } from 'lucide-react';

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

// Extended plant data for detail panel
interface PlantData {
  type: 'tomato' | 'lettuce' | 'pepper' | 'cucumber';
  growthStage: number;
  name?: string;
  plantedDate?: string;
  wateringSchedule?: string;
  lightRequirement?: string;
  temperature?: { min: number; max: number };
  health?: 'excellent' | 'good' | 'fair' | 'poor';
}

interface PlantProps {
  growthStage: number;
  plantType: 'tomato' | 'lettuce' | 'pepper' | 'cucumber';
  position: [number, number, number];
  performanceMode: boolean;
  showLabel?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  isSelected?: boolean;
}

// Enhanced plant component with better visuals
const Plant: React.FC<PlantProps> = ({ growthStage, plantType, position, performanceMode, showLabel = true, onClick, isSelected = false }) => {
  const plantRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
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
    <group 
      ref={plantRef} 
      position={position}
      onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Selection/Hover ring */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial 
            color={isSelected ? '#22C55E' : '#3B82F6'} 
            transparent 
            opacity={0.6} 
          />
        </mesh>
      )}
      
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
  plants: PlantData[]; 
  controlsRef: React.RefObject<any>; 
  enableZoom: boolean;
  performanceMode: boolean;
  zoomSpeed: number;
  globalGrowthModifier: number;
  selectedPlantIndex: number | null;
  onPlantClick: (index: number) => void;
}> = ({ plants, controlsRef, enableZoom, performanceMode, zoomSpeed, globalGrowthModifier, selectedPlantIndex, onPlantClick }) => {
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
            onClick={(e) => { e.stopPropagation(); onPlantClick(i); }}
            isSelected={selectedPlantIndex === i}
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
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}> = ({ value, onChange, isPlaying, onTogglePlay, onReset }) => {
  return (
    <div className="w-80">
      <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
        <span className="flex items-center gap-2">
          Growth Stage
          {isPlaying && (
            <span className="inline-flex items-center gap-1 text-primary animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Time-lapse
            </span>
          )}
        </span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause time-lapse' : 'Play time-lapse'}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={10}
          max={100}
          step={1}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onReset}
          title="Reset to 100%"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Seedling</span>
        <span>Mature</span>
        <span>Harvest</span>
      </div>
    </div>
  );
};

// Plant detail panel component
const PlantDetailPanel: React.FC<{
  plant: PlantData;
  growthModifier: number;
  onClose: () => void;
}> = ({ plant, growthModifier, onClose }) => {
  const modifiedGrowth = Math.min(100, Math.max(0, plant.growthStage * (growthModifier / 100)));
  const healthColors = {
    excellent: 'text-green-500',
    good: 'text-emerald-400',
    fair: 'text-yellow-500',
    poor: 'text-red-500',
  };
  
  const getGrowthStageLabel = (growth: number) => {
    if (growth < 25) return 'Seedling';
    if (growth < 50) return 'Vegetative';
    if (growth < 75) return 'Flowering';
    return 'Fruiting';
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-72 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl z-20 overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-emerald-500/20 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold capitalize text-foreground">{plant.name || plant.type}</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-background/50 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Growth Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Growth Progress</span>
            <span className="font-medium">{Math.round(modifiedGrowth)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
              style={{ width: `${modifiedGrowth}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Stage: {getGrowthStageLabel(modifiedGrowth)}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplets className="w-3 h-3" />
              <span className="text-xs">Watering</span>
            </div>
            <div className="text-sm font-medium">
              {plant.wateringSchedule || 'Every 2 days'}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Sun className="w-3 h-3" />
              <span className="text-xs">Light</span>
            </div>
            <div className="text-sm font-medium">
              {plant.lightRequirement || 'Full Sun'}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Thermometer className="w-3 h-3" />
              <span className="text-xs">Temperature</span>
            </div>
            <div className="text-sm font-medium">
              {plant.temperature ? `${plant.temperature.min}–${plant.temperature.max}°C` : '18–24°C'}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Planted</span>
            </div>
            <div className="text-sm font-medium">
              {plant.plantedDate || '2 weeks ago'}
            </div>
          </div>
        </div>
        
        {/* Health Status */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Health Status</span>
          <span className={`text-sm font-medium capitalize ${healthColors[plant.health || 'good']}`}>
            {plant.health || 'Good'}
          </span>
        </div>
      </div>
    </div>
  );
};

interface PlantGrowth3DProps {
  plants?: PlantData[];
}

const DEFAULT_CAMERA_POSITION: [number, number, number] = [5, 4, 5];
const DEFAULT_TARGET: [number, number, number] = [0, 0.5, 0];

const DEFAULT_PLANTS: PlantData[] = [
  { type: 'tomato', growthStage: 85, name: 'Cherry Tomato', health: 'excellent', wateringSchedule: 'Daily', lightRequirement: 'Full Sun', temperature: { min: 18, max: 26 }, plantedDate: '6 weeks ago' },
  { type: 'lettuce', growthStage: 70, name: 'Butterhead Lettuce', health: 'good', wateringSchedule: 'Every 2 days', lightRequirement: 'Partial Shade', temperature: { min: 15, max: 20 }, plantedDate: '4 weeks ago' },
  { type: 'pepper', growthStage: 90, name: 'Bell Pepper', health: 'excellent', wateringSchedule: 'Every 3 days', lightRequirement: 'Full Sun', temperature: { min: 20, max: 28 }, plantedDate: '8 weeks ago' },
  { type: 'cucumber', growthStage: 55, name: 'English Cucumber', health: 'good', wateringSchedule: 'Daily', lightRequirement: 'Full Sun', temperature: { min: 18, max: 24 }, plantedDate: '3 weeks ago' },
  { type: 'tomato', growthStage: 40, name: 'Roma Tomato', health: 'fair', wateringSchedule: 'Daily', lightRequirement: 'Full Sun', temperature: { min: 18, max: 26 }, plantedDate: '2 weeks ago' },
  { type: 'lettuce', growthStage: 95, name: 'Romaine Lettuce', health: 'excellent', wateringSchedule: 'Every 2 days', lightRequirement: 'Partial Shade', temperature: { min: 15, max: 20 }, plantedDate: '5 weeks ago' },
];

const PlantGrowth3D: React.FC<PlantGrowth3DProps> = ({ 
  plants = DEFAULT_PLANTS
}) => {
  const [globalGrowthModifier, setGlobalGrowthModifier] = useState(100);
  const [selectedPlantIndex, setSelectedPlantIndex] = useState<number | null>(null);
  const [isTimeLapsePlaying, setIsTimeLapsePlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Time-lapse animation effect
  useEffect(() => {
    if (!isTimeLapsePlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      
      // Update every 50ms for smooth animation (cycle from 10% to 100% over ~5 seconds)
      if (delta > 50) {
        setGlobalGrowthModifier(prev => {
          const next = prev + 1;
          if (next > 100) return 10;
          return next;
        });
        lastTimeRef.current = timestamp;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTimeLapsePlaying]);

  const handleTogglePlay = useCallback(() => {
    setIsTimeLapsePlaying(prev => !prev);
    lastTimeRef.current = 0;
  }, []);

  const handleReset = useCallback(() => {
    setIsTimeLapsePlaying(false);
    setGlobalGrowthModifier(100);
  }, []);

  const handlePlantClick = useCallback((index: number) => {
    setSelectedPlantIndex(prev => prev === index ? null : index);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Fullscreen3DWrapper
        title="Plant Growth Simulation"
        defaultCameraPosition={DEFAULT_CAMERA_POSITION}
        defaultTarget={DEFAULT_TARGET}
        className="bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950"
        customControls={
          <GrowthSliderControl
            value={globalGrowthModifier}
            onChange={setGlobalGrowthModifier}
            isPlaying={isTimeLapsePlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
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
              selectedPlantIndex={selectedPlantIndex}
              onPlantClick={handlePlantClick}
            />
          </Canvas>
        )}
      </Fullscreen3DWrapper>
      
      {/* Plant Detail Panel */}
      {selectedPlantIndex !== null && plants[selectedPlantIndex] && (
        <PlantDetailPanel
          plant={plants[selectedPlantIndex]}
          growthModifier={globalGrowthModifier}
          onClose={() => setSelectedPlantIndex(null)}
        />
      )}
    </div>
  );
};

export default PlantGrowth3D;