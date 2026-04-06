import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Html, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import Fullscreen3DWrapper from './Fullscreen3DWrapper';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, SkipForward, SkipBack, Calendar, Sprout, Apple, Sun, CloudRain, Thermometer, Droplets, Lightbulb, LightbulbOff } from 'lucide-react';

// ===================== TYPES =====================

type PlantType = 'tomato' | 'pepper' | 'lettuce' | 'strawberry' | 'corn' | 'sunflower' | 'basil' | 'cucumber' | 'watermelon' | 'carrot' | 'eggplant' | 'pumpkin' | 'grape' | 'rose' | 'cactus';

interface PlantProfile {
  name: string;
  emoji: string;
  totalDays: number;
  bestHarvestDay: number;
  stemColor: string;
  leafColor: string;
  leafColorYoung: string;
  fruitColorUnripe: string;
  fruitColorRipe: string;
  flowerColor: string;
  petalColor: string;
  maxFruits: number;
  maxLeaves: number;
  idealTemp: number;
  idealHumidity: number;
  idealLight: number;
  fruitShape: 'sphere' | 'elongated' | 'flat' | 'cone' | 'cylinder';
  tallPlant?: boolean;
  rootVegetable?: boolean;
}

const PLANT_PROFILES: Record<PlantType, PlantProfile> = {
  tomato: {
    name: 'Tomato', emoji: '🍅', totalDays: 112, bestHarvestDay: 105, stemColor: '#2d5a27', leafColor: '#38a169', leafColorYoung: '#68d391',
    fruitColorUnripe: '#48bb78', fruitColorRipe: '#e53e3e', flowerColor: '#FBBF24', petalColor: '#FDE68A',
    maxFruits: 6, maxLeaves: 12, idealTemp: 25, idealHumidity: 65, idealLight: 80, fruitShape: 'sphere',
  },
  pepper: {
    name: 'Pepper', emoji: '🌶️', totalDays: 126, bestHarvestDay: 118, stemColor: '#2E7D32', leafColor: '#4CAF50', leafColorYoung: '#81C784',
    fruitColorUnripe: '#66BB6A', fruitColorRipe: '#FF5722', flowerColor: '#E8F5E9', petalColor: '#C8E6C9',
    maxFruits: 5, maxLeaves: 10, idealTemp: 28, idealHumidity: 60, idealLight: 85, fruitShape: 'elongated',
  },
  lettuce: {
    name: 'Lettuce', emoji: '🥬', totalDays: 70, bestHarvestDay: 63, stemColor: '#4CAF50', leafColor: '#81C784', leafColorYoung: '#A5D6A7',
    fruitColorUnripe: '#81C784', fruitColorRipe: '#81C784', flowerColor: '#FFF9C4', petalColor: '#FFFDE7',
    maxFruits: 0, maxLeaves: 18, idealTemp: 18, idealHumidity: 70, idealLight: 60, fruitShape: 'sphere',
  },
  strawberry: {
    name: 'Strawberry', emoji: '🍓', totalDays: 98, bestHarvestDay: 90, stemColor: '#33691E', leafColor: '#558B2F', leafColorYoung: '#7CB342',
    fruitColorUnripe: '#AED581', fruitColorRipe: '#D32F2F', flowerColor: '#FFFFFF', petalColor: '#F5F5F5',
    maxFruits: 8, maxLeaves: 9, idealTemp: 22, idealHumidity: 70, idealLight: 75, fruitShape: 'sphere',
  },
  corn: {
    name: 'Corn', emoji: '🌽', totalDays: 105, bestHarvestDay: 95, stemColor: '#33691E', leafColor: '#558B2F', leafColorYoung: '#8BC34A',
    fruitColorUnripe: '#C5E1A5', fruitColorRipe: '#FFD54F', flowerColor: '#F0E68C', petalColor: '#FFF8E1',
    maxFruits: 3, maxLeaves: 14, idealTemp: 27, idealHumidity: 55, idealLight: 90, fruitShape: 'cylinder', tallPlant: true,
  },
  sunflower: {
    name: 'Sunflower', emoji: '🌻', totalDays: 85, bestHarvestDay: 78, stemColor: '#2E7D32', leafColor: '#4CAF50', leafColorYoung: '#81C784',
    fruitColorUnripe: '#795548', fruitColorRipe: '#4E342E', flowerColor: '#FFD600', petalColor: '#FFEB3B',
    maxFruits: 1, maxLeaves: 10, idealTemp: 24, idealHumidity: 45, idealLight: 95, fruitShape: 'flat', tallPlant: true,
  },
  basil: {
    name: 'Basil', emoji: '🌿', totalDays: 60, bestHarvestDay: 50, stemColor: '#2E7D32', leafColor: '#1B5E20', leafColorYoung: '#4CAF50',
    fruitColorUnripe: '#66BB6A', fruitColorRipe: '#66BB6A', flowerColor: '#CE93D8', petalColor: '#E1BEE7',
    maxFruits: 0, maxLeaves: 20, idealTemp: 23, idealHumidity: 55, idealLight: 70, fruitShape: 'sphere',
  },
  cucumber: {
    name: 'Cucumber', emoji: '🥒', totalDays: 75, bestHarvestDay: 68, stemColor: '#388E3C', leafColor: '#66BB6A', leafColorYoung: '#A5D6A7',
    fruitColorUnripe: '#81C784', fruitColorRipe: '#2E7D32', flowerColor: '#FFEB3B', petalColor: '#FFF9C4',
    maxFruits: 5, maxLeaves: 12, idealTemp: 26, idealHumidity: 75, idealLight: 75, fruitShape: 'elongated',
  },
  watermelon: {
    name: 'Watermelon', emoji: '🍉', totalDays: 95, bestHarvestDay: 88, stemColor: '#33691E', leafColor: '#4CAF50', leafColorYoung: '#81C784',
    fruitColorUnripe: '#81C784', fruitColorRipe: '#2E7D32', flowerColor: '#FFEB3B', petalColor: '#FFF9C4',
    maxFruits: 2, maxLeaves: 14, idealTemp: 28, idealHumidity: 65, idealLight: 85, fruitShape: 'sphere',
  },
  carrot: {
    name: 'Carrot', emoji: '🥕', totalDays: 80, bestHarvestDay: 72, stemColor: '#33691E', leafColor: '#66BB6A', leafColorYoung: '#A5D6A7',
    fruitColorUnripe: '#FFB74D', fruitColorRipe: '#E65100', flowerColor: '#FFFFFF', petalColor: '#F5F5F5',
    maxFruits: 1, maxLeaves: 8, idealTemp: 18, idealHumidity: 60, idealLight: 65, fruitShape: 'cone', rootVegetable: true,
  },
  eggplant: {
    name: 'Eggplant', emoji: '🍆', totalDays: 100, bestHarvestDay: 92, stemColor: '#4A148C', leafColor: '#4CAF50', leafColorYoung: '#81C784',
    fruitColorUnripe: '#81C784', fruitColorRipe: '#4A148C', flowerColor: '#CE93D8', petalColor: '#E1BEE7',
    maxFruits: 4, maxLeaves: 10, idealTemp: 27, idealHumidity: 65, idealLight: 80, fruitShape: 'elongated',
  },
  pumpkin: {
    name: 'Pumpkin', emoji: '🎃', totalDays: 120, bestHarvestDay: 110, stemColor: '#33691E', leafColor: '#4CAF50', leafColorYoung: '#81C784',
    fruitColorUnripe: '#81C784', fruitColorRipe: '#E65100', flowerColor: '#FFB300', petalColor: '#FFE082',
    maxFruits: 2, maxLeaves: 14, idealTemp: 24, idealHumidity: 60, idealLight: 85, fruitShape: 'sphere',
  },
  grape: {
    name: 'Grape', emoji: '🍇', totalDays: 140, bestHarvestDay: 130, stemColor: '#5D4037', leafColor: '#388E3C', leafColorYoung: '#66BB6A',
    fruitColorUnripe: '#A5D6A7', fruitColorRipe: '#6A1B9A', flowerColor: '#E8F5E9', petalColor: '#C8E6C9',
    maxFruits: 6, maxLeaves: 12, idealTemp: 22, idealHumidity: 55, idealLight: 80, fruitShape: 'sphere',
  },
  rose: {
    name: 'Rose', emoji: '🌹', totalDays: 90, bestHarvestDay: 80, stemColor: '#2E7D32', leafColor: '#388E3C', leafColorYoung: '#66BB6A',
    fruitColorUnripe: '#F48FB1', fruitColorRipe: '#C62828', flowerColor: '#E53935', petalColor: '#EF5350',
    maxFruits: 3, maxLeaves: 8, idealTemp: 20, idealHumidity: 60, idealLight: 70, fruitShape: 'sphere',
  },
  cactus: {
    name: 'Cactus', emoji: '🌵', totalDays: 180, bestHarvestDay: 170, stemColor: '#2E7D32', leafColor: '#388E3C', leafColorYoung: '#4CAF50',
    fruitColorUnripe: '#F48FB1', fruitColorRipe: '#E91E63', flowerColor: '#FF4081', petalColor: '#F8BBD0',
    maxFruits: 2, maxLeaves: 0, idealTemp: 30, idealHumidity: 25, idealLight: 95, fruitShape: 'sphere',
  },
};

interface EnvironmentState {
  temperature: number;    // 10-40 °C
  humidity: number;       // 20-100 %
  light: number;          // 0-100 %
  lightsOn: boolean;
  isRaining: boolean;
}

interface DayStage {
  day: number;
  week: number;
  name: string;
  phase: 'seed' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  description: string;
  heightPercent: number;
  leafCount: number;
  fruitCount: number;
  fruitRipeness: number;
  harvestScore: number;
}

// ===================== GROWTH CALCULATION =====================

const computeGrowthSpeed = (env: EnvironmentState, profile: PlantProfile): number => {
  const tempDiff = Math.abs(env.temperature - profile.idealTemp);
  const tempFactor = Math.max(0.1, 1 - tempDiff / 30);
  const humidityDiff = Math.abs(env.humidity - profile.idealHumidity);
  const humidityFactor = Math.max(0.2, 1 - humidityDiff / 80);
  const lightLevel = env.lightsOn ? Math.min(100, env.light + 30) : env.light;
  const lightDiff = Math.abs(lightLevel - profile.idealLight);
  const lightFactor = Math.max(0.15, 1 - lightDiff / 100);
  const rainBonus = env.isRaining ? 1.1 : 1;
  return tempFactor * humidityFactor * lightFactor * rainBonus;
};

const getDayStage = (day: number, profile: PlantProfile): DayStage => {
  const total = profile.totalDays;
  const week = Math.ceil(day / 7);
  const p = day / total; // 0-1 progress

  // Phase boundaries as fractions of total
  const seedEnd = Math.floor(total * 0.06);
  const seedlingEnd = Math.floor(total * 0.19);
  const vegEnd = Math.floor(total * 0.44);
  const flowerEnd = Math.floor(total * 0.56);
  const fruitEnd = Math.floor(total * 0.87);

  if (day <= seedEnd) return { day, week, name: 'Seed', phase: 'seed', description: 'Germination — seed absorbs water', heightPercent: 2 + p * 30, leafCount: 0, fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= seedlingEnd) return { day, week, name: 'Seedling', phase: 'seedling', description: 'First leaves emerge, roots establish', heightPercent: 8 + (day / seedlingEnd) * 20, leafCount: Math.min(profile.maxLeaves, Math.floor((day - seedEnd) / 3)), fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= vegEnd) return { day, week, name: 'Vegetative', phase: 'vegetative', description: 'Rapid stem & leaf growth', heightPercent: 25 + ((day - seedlingEnd) / (vegEnd - seedlingEnd)) * 35, leafCount: Math.min(profile.maxLeaves, 4 + Math.floor((day - seedlingEnd) / 3)), fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= flowerEnd) return { day, week, name: 'Flowering', phase: 'flowering', description: 'Flowers bloom, pollination begins', heightPercent: 60 + ((day - vegEnd) / (flowerEnd - vegEnd)) * 15, leafCount: profile.maxLeaves, fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= fruitEnd) {
    const fp = (day - flowerEnd) / (fruitEnd - flowerEnd);
    return { day, week, name: 'Fruiting', phase: 'fruiting', description: 'Fruits develop and ripen', heightPercent: 75 + fp * 15, leafCount: profile.maxLeaves, fruitCount: Math.min(profile.maxFruits, Math.floor(fp * (profile.maxFruits + 1))), fruitRipeness: fp, harvestScore: Math.floor(fp * 60) };
  }
  const hp = (day - fruitEnd) / (total - fruitEnd);
  return { day, week, name: 'Harvest Ready', phase: 'harvest', description: 'Peak ripeness — optimal harvest window!', heightPercent: 90 + hp * 10, leafCount: profile.maxLeaves - 1, fruitCount: profile.maxFruits, fruitRipeness: 1, harvestScore: 60 + Math.floor(Math.sin(hp * Math.PI) * 40) };
};

// ===================== 3D SCENE HELPERS =====================

const SceneCapture = ({ sceneRef }: { sceneRef: React.RefObject<THREE.Scene | null> }) => {
  const { scene } = useThree();
  useEffect(() => {
    if (sceneRef && 'current' in sceneRef) {
      (sceneRef as React.MutableRefObject<THREE.Scene | null>).current = scene;
    }
  }, [scene, sceneRef]);
  return null;
};

// ===================== RAIN PARTICLES =====================

const RainEffect = ({ active, performanceMode }: { active: boolean; performanceMode: boolean }) => {
  const rainRef = useRef<THREE.Points>(null);
  const count = performanceMode ? 80 : 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!rainRef.current || !active) return;
    const pos = rainRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = (pos.array as Float32Array)[i * 3 + 1];
      y -= 0.15;
      if (y < -0.5) y = 5 + Math.random() * 2;
      (pos.array as Float32Array)[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#90CAF9" transparent opacity={0.7} />
    </points>
  );
};

// ===================== GROW LIGHTS =====================

const GrowLights = ({ on, performanceMode }: { on: boolean; performanceMode: boolean }) => {
  const lightsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightsRef.current && on && !performanceMode) {
      lightsRef.current.children.forEach((child, i) => {
        const pl = child.children.find((c: any) => c.type === 'PointLight') as THREE.PointLight | undefined;
        if (pl) pl.intensity = 0.4 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
      });
    }
  });

  return (
    <group ref={lightsRef} position={[0, 3, 0]}>
      {[-1.5, 0, 1.5].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Housing */}
          <mesh>
            <boxGeometry args={[0.8, 0.08, 0.3]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Panel */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.25]} />
            <meshStandardMaterial
              color={on ? '#FF69B4' : '#555'}
              emissive={on ? '#FF1493' : '#000000'}
              emissiveIntensity={on ? (performanceMode ? 0.4 : 0.8) : 0}
            />
          </mesh>
          {on && !performanceMode && (
            <pointLight position={[0, -0.3, 0]} intensity={0.5} color="#FF69B4" distance={4} />
          )}
        </group>
      ))}
      {/* Bar */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[5, 0.04, 0.04]} />
        <meshStandardMaterial color="#404040" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// ===================== SENSOR HUD (in-scene) =====================

const SensorHUD = ({ env, profile }: { env: EnvironmentState; profile: PlantProfile }) => {
  const speed = computeGrowthSpeed(env, profile);
  const lightEff = env.lightsOn ? Math.min(100, env.light + 30) : env.light;

  return (
    <Html position={[2.8, 2.2, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
      <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 shadow-xl space-y-2 min-w-[150px]">
        <div className="text-xs font-bold text-foreground border-b border-border/30 pb-1 mb-1">Sensors</div>
        <div className="flex items-center gap-2 text-xs">
          <Thermometer className="w-3.5 h-3.5 text-destructive" />
          <span className="text-muted-foreground">Temp</span>
          <span className="ml-auto font-bold text-foreground">{env.temperature}°C</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-muted-foreground">Humidity</span>
          <span className="ml-auto font-bold text-foreground">{env.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-muted-foreground">Light</span>
          <span className="ml-auto font-bold text-foreground">{lightEff}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {env.lightsOn ? <Lightbulb className="w-3.5 h-3.5 text-pink-400" /> : <LightbulbOff className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className="text-muted-foreground">Grow Light</span>
          <span className="ml-auto font-bold text-foreground">{env.lightsOn ? 'ON' : 'OFF'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CloudRain className="w-3.5 h-3.5 text-blue-300" />
          <span className="text-muted-foreground">Rain</span>
          <span className="ml-auto font-bold text-foreground">{env.isRaining ? 'Yes' : 'No'}</span>
        </div>
        <div className="border-t border-border/30 pt-1 mt-1 flex items-center gap-2 text-xs">
          <Sprout className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Speed</span>
          <span className={`ml-auto font-bold ${speed > 0.7 ? 'text-primary' : speed > 0.4 ? 'text-yellow-500' : 'text-destructive'}`}>
            {(speed * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </Html>
  );
};

// ===================== POT =====================

const Pot = () => (
  <group position={[0, -0.25, 0]}>
    <mesh>
      <cylinderGeometry args={[0.45, 0.35, 0.5, 24]} />
      <meshStandardMaterial color="#A0522D" roughness={0.7} metalness={0.1} />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <torusGeometry args={[0.45, 0.05, 8, 24]} />
      <meshStandardMaterial color="#8B4513" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.28, 0]}>
      <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
      <meshStandardMaterial color="#3E2723" roughness={0.95} />
    </mesh>
  </group>
);

// ===================== PLANT MODEL =====================

interface PlantModelProps {
  stage: DayStage;
  profile: PlantProfile;
  performanceMode: boolean;
  env: EnvironmentState;
}

const PlantModel = ({ stage, profile, performanceMode, env }: PlantModelProps) => {
  const plantRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);
  // stemHeight computed below after stemMaxHeight
  const isHarvest = stage.phase === 'harvest';

  // Wilting effect when conditions are bad
  const speed = computeGrowthSpeed(env, profile);
  const wiltAngle = speed < 0.3 ? 0.15 : 0;

  useFrame((state) => {
    if (plantRef.current && !performanceMode) {
      plantRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.02 + wiltAngle;
    }
    if (leavesRef.current && !performanceMode) {
      leavesRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + i * 0.7) * 0.06 + wiltAngle * 0.5;
      });
    }
  });

  const fruitColor = useMemo(() => {
    return new THREE.Color().lerpColors(
      new THREE.Color(profile.fruitColorUnripe),
      new THREE.Color(profile.fruitColorRipe),
      stage.fruitRipeness
    );
  }, [stage.fruitRipeness, profile]);

  // Leaf color adjusts with light
  const effectiveLeafColor = useMemo(() => {
    const base = new THREE.Color(profile.leafColor);
    const lightLevel = env.lightsOn ? Math.min(100, env.light + 30) : env.light;
    if (lightLevel < 30) return base.clone().multiplyScalar(0.6).getStyle();
    return base.getStyle();
  }, [profile.leafColor, env.light, env.lightsOn]);

  const stemMaxHeight = profile.tallPlant ? 3.5 : 2.5;
  const stemHeight = (stage.heightPercent / 100) * stemMaxHeight;

  return (
    <group ref={plantRef}>
      <Pot />

      {/* Seed */}
      {stage.phase === 'seed' && (
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#8B7355" roughness={0.8} />
        </mesh>
      )}

      {/* Sprout */}
      {stage.phase === 'seed' && stage.day > Math.floor(profile.totalDays * 0.03) && (
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.01, 0.015, 0.12, 6]} />
          <meshStandardMaterial color={profile.leafColorYoung} />
        </mesh>
      )}

      {/* Stem */}
      {stage.phase !== 'seed' && (
        <group>
          {[...Array(Math.max(2, Math.ceil(stemHeight / 0.4)))].map((_, i) => {
            const segH = stemHeight / Math.max(2, Math.ceil(stemHeight / 0.4));
            const thick = (profile.tallPlant ? 0.06 : 0.04) - i * 0.003;
            return (
              <mesh key={i} position={[0, i * segH + segH / 2, 0]}>
                <cylinderGeometry args={[Math.max(0.01, thick * 0.8), Math.max(0.012, thick), segH, 8]} />
                <meshStandardMaterial color={profile.stemColor} roughness={0.7} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Leaves */}
      {stage.leafCount > 0 && (
        <group ref={leavesRef}>
          {[...Array(stage.leafCount)].map((_, i) => {
            const angle = (i * 137.5 * Math.PI) / 180;
            const h = 0.15 + (i / stage.leafCount) * stemHeight * 0.85;
            const size = 0.1 + (i % 3) * 0.03;
            const isYoung = i > stage.leafCount - 3;
            // Corn/sunflower: longer, narrower leaves
            const leafScale = profile.tallPlant ? [1.8, 0.6, 1] : [1, 1, 1];
            return (
              <Float key={i} speed={performanceMode ? 0 : 1.2} rotationIntensity={performanceMode ? 0 : 0.08} floatIntensity={0}>
                <group position={[0, Math.min(h, stemHeight * 0.95), 0]} rotation={[0.35, angle, Math.PI / 5]}>
                  <mesh position={[0.15, 0, 0]} scale={leafScale as any}>
                    <sphereGeometry args={[size, 6, 4]} />
                    <meshStandardMaterial color={isYoung ? profile.leafColorYoung : effectiveLeafColor} roughness={0.5} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              </Float>
            );
          })}
        </group>
      )}

      {/* Lettuce head */}
      {profile.name === 'Lettuce' && stage.phase !== 'seed' && stage.phase !== 'seedling' && (
        <group position={[0, 0.1, 0]}>
          {[...Array(Math.min(15, Math.floor(stage.heightPercent / 5)))].map((_, i) => {
            const angle = (i / 15) * Math.PI * 2 + i * 0.5;
            const tilt = 0.1 + i * 0.05;
            return (
              <Float key={i} speed={performanceMode ? 0 : 1} rotationIntensity={performanceMode ? 0 : 0.04} floatIntensity={0}>
                <mesh position={[Math.cos(angle) * 0.07 * (i / 10), i * 0.022, Math.sin(angle) * 0.07 * (i / 10)]} rotation={[tilt, angle, 0]}>
                  <planeGeometry args={[0.12 + i * 0.008, 0.16 + i * 0.01]} />
                  <meshStandardMaterial color={i % 3 === 0 ? profile.leafColor : profile.leafColorYoung} roughness={0.6} side={THREE.DoubleSide} />
                </mesh>
              </Float>
            );
          })}
        </group>
      )}

      {/* Basil bush - dense leaf clusters */}
      {profile.name === 'Basil' && stage.phase !== 'seed' && stage.phase !== 'seedling' && (
        <group position={[0, stemHeight * 0.4, 0]}>
          {[...Array(Math.min(12, Math.floor(stage.heightPercent / 6)))].map((_, i) => {
            const angle = (i * 2.4);
            const radius = 0.08 + (i / 12) * 0.15;
            return (
              <Float key={i} speed={performanceMode ? 0 : 1.5} rotationIntensity={performanceMode ? 0 : 0.06} floatIntensity={0}>
                <mesh position={[Math.cos(angle) * radius, i * 0.04, Math.sin(angle) * radius]}>
                  <sphereGeometry args={[0.06 + Math.random() * 0.03, 6, 4]} />
                  <meshStandardMaterial color={i % 2 === 0 ? profile.leafColor : profile.leafColorYoung} roughness={0.4} side={THREE.DoubleSide} />
                </mesh>
              </Float>
            );
          })}
        </group>
      )}

      {/* Sunflower head */}
      {profile.name === 'Sunflower' && (stage.phase === 'flowering' || stage.phase === 'fruiting' || stage.phase === 'harvest') && (
        <group position={[0, stemHeight * 0.95, 0]} rotation={[0.2, 0, 0]}>
          {/* Center disc */}
          <mesh>
            <cylinderGeometry args={[0.18 + stage.fruitRipeness * 0.1, 0.18 + stage.fruitRipeness * 0.1, 0.06, 24]} />
            <meshStandardMaterial color={stage.fruitRipeness > 0.5 ? '#4E342E' : '#795548'} roughness={0.8} />
          </mesh>
          {/* Petals */}
          {[...Array(16)].map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r = 0.25 + stage.fruitRipeness * 0.08;
            return (
              <mesh key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation={[0, 0, a + Math.PI / 2]}>
                <planeGeometry args={[0.12, 0.06]} />
                <meshStandardMaterial color={profile.petalColor} emissive={profile.flowerColor} emissiveIntensity={0.15} side={THREE.DoubleSide} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Corn cobs */}
      {profile.name === 'Corn' && stage.fruitCount > 0 && (
        <group position={[0, stemHeight * 0.55, 0]}>
          {[...Array(stage.fruitCount)].map((_, i) => {
            const a = (i / Math.max(stage.fruitCount, 1)) * Math.PI * 2;
            return (
              <group key={i} position={[Math.cos(a) * 0.12, -i * 0.25, Math.sin(a) * 0.12]} rotation={[0.5, a, 0]}>
                {/* Husk */}
                <mesh>
                  <cylinderGeometry args={[0.06, 0.04, 0.25, 8]} />
                  <meshStandardMaterial color={stage.fruitRipeness > 0.5 ? '#F5DEB3' : '#81C784'} roughness={0.6} />
                </mesh>
                {/* Kernels showing */}
                {stage.fruitRipeness > 0.3 && (
                  <mesh position={[0, 0, 0.03]}>
                    <cylinderGeometry args={[0.045, 0.03, 0.2, 8]} />
                    <meshStandardMaterial color={fruitColor} roughness={0.4} />
                  </mesh>
                )}
                {/* Silk */}
                <mesh position={[0, 0.14, 0]}>
                  <cylinderGeometry args={[0.01, 0.003, 0.08, 4]} />
                  <meshStandardMaterial color="#F0E68C" />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Carrot (root vegetable - shows root below pot) */}
      {profile.name === 'Carrot' && stage.phase !== 'seed' && stage.phase !== 'seedling' && (
        <group position={[0, -0.3, 0]}>
          {/* Root visible partially */}
          <mesh position={[0, -0.1 - stage.fruitRipeness * 0.2, 0]}>
            <coneGeometry args={[0.06 + stage.fruitRipeness * 0.04, 0.3 + stage.fruitRipeness * 0.2, 8]} />
            <meshStandardMaterial color={fruitColor} roughness={0.5} />
          </mesh>
          {/* Feathery carrot top */}
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 1.05) * 0.03, 0.15 + i * 0.02, Math.sin(i * 1.05) * 0.03]} rotation={[0.4, i * 1.05, 0]}>
              <planeGeometry args={[0.04, 0.15]} />
              <meshStandardMaterial color={profile.leafColor} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* Watermelon - large ground fruit */}
      {profile.name === 'Watermelon' && stage.fruitCount > 0 && (
        <group position={[0, -0.2, 0]}>
          {[...Array(stage.fruitCount)].map((_, i) => (
            <Float key={i} speed={0} floatIntensity={0}>
              <mesh position={[i * 0.5 - 0.25, 0, 0.3]}>
                <sphereGeometry args={[0.12 + stage.fruitRipeness * 0.12, 16, 16]} />
                <meshStandardMaterial color={fruitColor} roughness={0.3} />
              </mesh>
              {/* Stripe */}
              {stage.fruitRipeness > 0.3 && (
                <mesh position={[i * 0.5 - 0.25, 0, 0.3]} rotation={[0, i * 0.5, 0]}>
                  <sphereGeometry args={[0.125 + stage.fruitRipeness * 0.12, 16, 4]} />
                  <meshStandardMaterial color="#1B5E20" roughness={0.3} wireframe />
                </mesh>
              )}
            </Float>
          ))}
        </group>
      )}

      {/* Cucumber fruits - hanging */}
      {profile.name === 'Cucumber' && stage.fruitCount > 0 && (
        <group position={[0, stemHeight * 0.5, 0]}>
          {[...Array(stage.fruitCount)].map((_, i) => {
            const a = (i / Math.max(stage.fruitCount, 1)) * Math.PI * 2 + 0.4;
            return (
              <group key={i} position={[Math.cos(a) * 0.2, -0.05 - i * 0.12, Math.sin(a) * 0.2]}>
                <mesh rotation={[0.3, 0, 0]}>
                  <cylinderGeometry args={[0.006, 0.004, 0.07, 6]} />
                  <meshStandardMaterial color="#4A7023" />
                </mesh>
                <Float speed={performanceMode ? 0 : 1.5} floatIntensity={performanceMode ? 0 : 0.04}>
                  <mesh position={[0, -0.06, 0]}>
                    <capsuleGeometry args={[0.03 + stage.fruitRipeness * 0.02, 0.08 + stage.fruitRipeness * 0.06, 6, 12]} />
                    <meshStandardMaterial color={fruitColor} roughness={0.3} />
                  </mesh>
                  {/* Bumps on cucumber */}
                  {stage.fruitRipeness > 0.4 && [0, 1, 2].map(b => (
                    <mesh key={b} position={[Math.cos(b * 2.1) * 0.035, -0.06 + b * 0.03, Math.sin(b * 2.1) * 0.035]}>
                      <sphereGeometry args={[0.008, 4, 4]} />
                      <meshStandardMaterial color="#388E3C" />
                    </mesh>
                  ))}
                </Float>
              </group>
            );
          })}
        </group>
      )}

      {/* Flowers (generic for plants that don't have special rendering) */}
      {stage.phase === 'flowering' && profile.name !== 'Sunflower' && (
        <group position={[0, stemHeight * 0.8, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <Float key={i} speed={2} floatIntensity={0.1}>
              <mesh position={[Math.cos(i * 1.6) * 0.2, 0.05, Math.sin(i * 1.6) * 0.2]}>
                <sphereGeometry args={[0.04, 10, 10]} />
                <meshStandardMaterial color={profile.flowerColor} emissive={profile.flowerColor} emissiveIntensity={0.2} />
              </mesh>
              {[0, 1, 2, 3, 4].map((p) => (
                <mesh key={p} position={[
                  Math.cos(i * 1.6) * 0.2 + Math.cos(p * 1.26) * 0.05,
                  0.05,
                  Math.sin(i * 1.6) * 0.2 + Math.sin(p * 1.26) * 0.05
                ]}>
                  <sphereGeometry args={[0.02, 6, 6]} />
                  <meshStandardMaterial color={profile.petalColor} />
                </mesh>
              ))}
            </Float>
          ))}
        </group>
      )}

      {/* Eggplant fruits - large hanging */}
      {profile.name === 'Eggplant' && stage.fruitCount > 0 && (
        <group position={[0, stemHeight * 0.55, 0]}>
          {[...Array(stage.fruitCount)].map((_, i) => {
            const a = (i / Math.max(stage.fruitCount, 1)) * Math.PI * 2 + 0.3;
            return (
              <group key={i} position={[Math.cos(a) * 0.2, -0.05 - i * 0.15, Math.sin(a) * 0.2]}>
                <mesh rotation={[0.2, 0, 0]}>
                  <cylinderGeometry args={[0.005, 0.004, 0.06, 6]} />
                  <meshStandardMaterial color="#4A7023" />
                </mesh>
                <Float speed={performanceMode ? 0 : 1} floatIntensity={performanceMode ? 0 : 0.03}>
                  <mesh position={[0, -0.08, 0]}>
                    <capsuleGeometry args={[0.045 + stage.fruitRipeness * 0.03, 0.06 + stage.fruitRipeness * 0.05, 8, 16]} />
                    <meshStandardMaterial color={fruitColor} roughness={0.25} metalness={0.15} />
                  </mesh>
                  {/* Calyx */}
                  <mesh position={[0, -0.02, 0]}>
                    <coneGeometry args={[0.04, 0.03, 6]} />
                    <meshStandardMaterial color="#2E7D32" roughness={0.5} />
                  </mesh>
                </Float>
              </group>
            );
          })}
        </group>
      )}

      {/* Pumpkin - large ground fruit */}
      {profile.name === 'Pumpkin' && stage.fruitCount > 0 && (
        <group position={[0, -0.25, 0]}>
          {[...Array(stage.fruitCount)].map((_, i) => (
            <group key={i} position={[i * 0.6 - 0.3, 0, 0.35]}>
              {/* Main body - flattened sphere with ridges */}
              <mesh scale={[1, 0.7, 1]}>
                <sphereGeometry args={[0.15 + stage.fruitRipeness * 0.15, 8, 16]} />
                <meshStandardMaterial color={fruitColor} roughness={0.4} />
              </mesh>
              {/* Ridges */}
              {[0, 1, 2, 3, 4, 5].map(r => {
                const ra = (r / 6) * Math.PI * 2;
                return (
                  <mesh key={r} position={[Math.cos(ra) * (0.12 + stage.fruitRipeness * 0.1), 0, Math.sin(ra) * (0.12 + stage.fruitRipeness * 0.1)]} scale={[0.4, 0.6, 0.4]}>
                    <sphereGeometry args={[0.08, 6, 6]} />
                    <meshStandardMaterial color={fruitColor} roughness={0.5} />
                  </mesh>
                );
              })}
              {/* Stem on top */}
              <mesh position={[0, 0.12 + stage.fruitRipeness * 0.08, 0]}>
                <cylinderGeometry args={[0.015, 0.02, 0.06, 6]} />
                <meshStandardMaterial color="#5D4037" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Grape clusters */}
      {profile.name === 'Grape' && stage.fruitCount > 0 && (
        <group position={[0, stemHeight * 0.6, 0]}>
          {[...Array(Math.min(stage.fruitCount, 4))].map((_, ci) => {
            const ca = (ci / 4) * Math.PI * 2 + 0.5;
            return (
              <group key={ci} position={[Math.cos(ca) * 0.22, -ci * 0.08, Math.sin(ca) * 0.22]}>
                {/* Vine */}
                <mesh>
                  <cylinderGeometry args={[0.004, 0.003, 0.1, 4]} />
                  <meshStandardMaterial color="#5D4037" />
                </mesh>
                {/* Grape cluster */}
                <Float speed={performanceMode ? 0 : 1.2} floatIntensity={performanceMode ? 0 : 0.02}>
                  <group position={[0, -0.08, 0]}>
                    {[...Array(Math.floor(3 + stage.fruitRipeness * 6))].map((_, gi) => {
                      const gx = (Math.random() - 0.5) * 0.06;
                      const gy = -gi * 0.018;
                      const gz = (Math.random() - 0.5) * 0.06;
                      return (
                        <mesh key={gi} position={[gx, gy, gz]}>
                          <sphereGeometry args={[0.015 + stage.fruitRipeness * 0.005, 8, 8]} />
                          <meshStandardMaterial color={fruitColor} roughness={0.2} metalness={0.1} />
                        </mesh>
                      );
                    })}
                  </group>
                </Float>
              </group>
            );
          })}
        </group>
      )}

      {/* Rose - flowers instead of fruits */}
      {profile.name === 'Rose' && (stage.phase === 'flowering' || stage.phase === 'fruiting' || stage.phase === 'harvest') && (
        <group position={[0, stemHeight * 0.85, 0]}>
          {[...Array(Math.min(stage.fruitCount || 1, 3))].map((_, i) => {
            const a = (i / 3) * Math.PI * 2;
            return (
              <group key={i} position={[Math.cos(a) * 0.1 * i, 0.05 * i, Math.sin(a) * 0.1 * i]}>
                {/* Rose bud center */}
                <mesh>
                  <sphereGeometry args={[0.03 + stage.fruitRipeness * 0.02, 10, 10]} />
                  <meshStandardMaterial color={fruitColor} roughness={0.3} />
                </mesh>
                {/* Petals - layered */}
                {[...Array(Math.floor(5 + stage.fruitRipeness * 8))].map((_, pi) => {
                  const pa = (pi / 13) * Math.PI * 2;
                  const layer = Math.floor(pi / 5);
                  const r = 0.03 + layer * 0.02 + stage.fruitRipeness * 0.015;
                  return (
                    <mesh key={pi} position={[Math.cos(pa) * r, -layer * 0.008, Math.sin(pa) * r]} rotation={[0.3 + layer * 0.15, pa, 0]}>
                      <planeGeometry args={[0.025, 0.03]} />
                      <meshStandardMaterial color={profile.petalColor} side={THREE.DoubleSide} roughness={0.3} />
                    </mesh>
                  );
                })}
              </group>
            );
          })}
          {/* Thorns on stem */}
          {[...Array(4)].map((_, i) => (
            <mesh key={i} position={[0.04, -stemHeight * 0.2 * (i + 1), 0]} rotation={[0, 0, -0.5]}>
              <coneGeometry args={[0.008, 0.025, 4]} />
              <meshStandardMaterial color="#5D4037" />
            </mesh>
          ))}
        </group>
      )}

      {/* Cactus - columnar body with spines */}
      {profile.name === 'Cactus' && stage.phase !== 'seed' && (
        <group position={[0, 0, 0]}>
          {/* Main body */}
          <mesh position={[0, stemHeight * 0.4, 0]}>
            <capsuleGeometry args={[0.12 + (stage.heightPercent / 100) * 0.06, stemHeight * 0.6, 8, 16]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.6} />
          </mesh>
          {/* Ridges */}
          {[...Array(8)].map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * (0.13 + (stage.heightPercent / 100) * 0.05), stemHeight * 0.4, Math.sin(a) * (0.13 + (stage.heightPercent / 100) * 0.05)]}>
                <capsuleGeometry args={[0.015, stemHeight * 0.55, 4, 8]} />
                <meshStandardMaterial color="#388E3C" roughness={0.5} />
              </mesh>
            );
          })}
          {/* Spines */}
          {[...Array(Math.min(20, Math.floor(stage.heightPercent / 4)))].map((_, i) => {
            const a = (i * 2.4);
            const h = 0.1 + (i / 20) * stemHeight * 0.7;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.18, h, Math.sin(a) * 0.18]} rotation={[0, 0, Math.cos(a) * 0.5]}>
                <cylinderGeometry args={[0.002, 0.001, 0.04, 3]} />
                <meshStandardMaterial color="#F5F5DC" />
              </mesh>
            );
          })}
          {/* Arms (mature) */}
          {stage.heightPercent > 50 && (
            <>
              <group position={[0.15, stemHeight * 0.5, 0]} rotation={[0, 0, -0.6]}>
                <mesh>
                  <capsuleGeometry args={[0.07, 0.2 + stage.heightPercent * 0.002, 6, 12]} />
                  <meshStandardMaterial color="#2E7D32" roughness={0.6} />
                </mesh>
              </group>
              {stage.heightPercent > 70 && (
                <group position={[-0.15, stemHeight * 0.4, 0]} rotation={[0, 0, 0.5]}>
                  <mesh>
                    <capsuleGeometry args={[0.06, 0.15 + stage.heightPercent * 0.001, 6, 12]} />
                    <meshStandardMaterial color="#2E7D32" roughness={0.6} />
                  </mesh>
                </group>
              )}
            </>
          )}
          {/* Cactus flower on top */}
          {(stage.phase === 'flowering' || stage.phase === 'fruiting' || stage.phase === 'harvest') && (
            <group position={[0, stemHeight * 0.75, 0]}>
              <mesh>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#FFD600" />
              </mesh>
              {[...Array(8)].map((_, pi) => {
                const pa = (pi / 8) * Math.PI * 2;
                return (
                  <mesh key={pi} position={[Math.cos(pa) * 0.04, 0, Math.sin(pa) * 0.04]} rotation={[0.4, pa, 0]}>
                    <planeGeometry args={[0.025, 0.035]} />
                    <meshStandardMaterial color={profile.petalColor} side={THREE.DoubleSide} />
                  </mesh>
                );
              })}
            </group>
          )}
        </group>
      )}

      {/* Generic fruits (tomato, pepper, strawberry) */}
      {stage.fruitCount > 0 && !['Corn', 'Sunflower', 'Watermelon', 'Cucumber', 'Carrot', 'Eggplant', 'Pumpkin', 'Grape', 'Rose', 'Cactus'].includes(profile.name) && (
        <group position={[0, stemHeight * 0.65, 0]}>
          {[...Array(stage.fruitCount)].map((_, i) => {
            const a = (i / Math.max(stage.fruitCount, 1)) * Math.PI * 2 + 0.4;
            const baseSize = 0.05 + stage.fruitRipeness * 0.06;
            return (
              <group key={i} position={[Math.cos(a) * 0.22, -0.05 - i * 0.1, Math.sin(a) * 0.22]}>
                <mesh rotation={[0.3, 0, 0]}>
                  <cylinderGeometry args={[0.006, 0.004, 0.07, 6]} />
                  <meshStandardMaterial color="#4A7023" />
                </mesh>
                <Float speed={performanceMode ? 0 : 1.5} floatIntensity={performanceMode ? 0 : 0.04}>
                  <mesh position={[0, -0.05, 0]}>
                    {profile.fruitShape === 'elongated' ? (
                      <capsuleGeometry args={[baseSize * 0.5, baseSize * 0.8, 6, 12]} />
                    ) : (
                      <sphereGeometry args={[baseSize, 14, 14]} />
                    )}
                    <meshStandardMaterial color={fruitColor} roughness={0.3} metalness={0.1} />
                  </mesh>
                </Float>
              </group>
            );
          })}
        </group>
      )}

      {/* Harvest glow */}
      {isHarvest && !performanceMode && (
        <pointLight position={[0, stemHeight * 0.5, 0]} intensity={0.5} color="#F59E0B" distance={2} />
      )}

      {/* Phase Label */}
      <Html position={[0, stemHeight + 0.4, 0]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-1.5 shadow-lg text-center whitespace-nowrap">
          <div className="text-sm font-semibold text-foreground">{stage.name}</div>
          <div className="text-xs text-muted-foreground">{stage.heightPercent.toFixed(0)}% grown</div>
        </div>
      </Html>
    </group>
  );
};

// ===================== TIMELINE =====================

const TimelinePlants = ({ currentDay, profile, performanceMode, env }: { currentDay: number; profile: PlantProfile; performanceMode: boolean; env: EnvironmentState }) => {
  const total = profile.totalDays;
  const timelineStages = [
    Math.floor(total * 0.05),
    Math.floor(total * 0.12),
    Math.floor(total * 0.32),
    Math.floor(total * 0.5),
    Math.floor(total * 0.75),
    profile.bestHarvestDay
  ];
  const labels = ['Seed', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];

  return (
    <group position={[-6, 0, 0]}>
      {timelineStages.map((day, i) => {
        const stage = getDayStage(day, profile);
        const isActive = currentDay >= day && (i === timelineStages.length - 1 || currentDay < timelineStages[i + 1]);
        return (
          <group key={i} position={[i * 2.5, 0, 0]}>
            {isActive && (
              <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.55, 0.65, 32]} />
                <meshBasicMaterial color="#22C55E" transparent opacity={0.6} />
              </mesh>
            )}
            <group scale={0.6}>
              <PlantModel stage={stage} profile={profile} performanceMode={performanceMode} env={env} />
            </group>
            <Html position={[0, -0.7, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
              <div className={`text-xs font-medium px-2 py-1 rounded ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {labels[i]}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// ===================== GROUND =====================

const Ground = ({ isRaining }: { isRaining: boolean }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[30, 20]} />
    <meshStandardMaterial color={isRaining ? '#143d1f' : '#1a472a'} roughness={0.9} />
  </mesh>
);

// ===================== SCENE =====================

const LifecycleScene = ({
  currentDay, controlsRef, enableZoom, performanceMode, zoomSpeed, viewMode, profile, env
}: {
  currentDay: number;
  controlsRef: React.RefObject<any>;
  enableZoom: boolean;
  performanceMode: boolean;
  zoomSpeed: number;
  viewMode: 'single' | 'timeline';
  profile: PlantProfile;
  env: EnvironmentState;
}) => {
  const stage = getDayStage(currentDay, profile);
  const lightLevel = env.lightsOn ? Math.min(100, env.light + 30) : env.light;
  const ambientIntensity = performanceMode ? 0.5 : 0.15 + (lightLevel / 100) * 0.35;
  const dirIntensity = performanceMode ? 0.6 : 0.3 + (lightLevel / 100) * 0.6;
  const tempFactor = (env.temperature - 10) / 30;
  const dirColor = tempFactor > 0.6 ? '#FFE0B2' : tempFactor < 0.3 ? '#E3F2FD' : '#FFF8E1';

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[8, 12, 6]} intensity={dirIntensity} castShadow={!performanceMode} color={dirColor} />
      {!performanceMode && <pointLight position={[-5, 5, -5]} intensity={0.15 * (lightLevel / 100)} color="#FFE4B5" />}

      {viewMode === 'single' ? (
        <PlantModel stage={stage} profile={profile} performanceMode={performanceMode} env={env} />
      ) : (
        <TimelinePlants currentDay={currentDay} profile={profile} performanceMode={performanceMode} env={env} />
      )}

      <GrowLights on={env.lightsOn} performanceMode={performanceMode} />
      <RainEffect active={env.isRaining} performanceMode={performanceMode} />
      {viewMode === 'single' && <SensorHUD env={env} profile={profile} />}

      {/* Rain mist sparkles */}
      {env.isRaining && !performanceMode && (
        <Sparkles count={40} scale={[6, 1, 6]} position={[0, 0, 0]} size={1} speed={0.4} opacity={0.3} color="#90CAF9" />
      )}

      <Ground isRaining={env.isRaining} />
      {!performanceMode && <Environment preset={lightLevel > 50 ? 'sunset' : 'night'} />}

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={enableZoom}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
        target={viewMode === 'timeline' ? [0, 0.5, 0] : [0, 0.8, 0]}
        zoomSpeed={zoomSpeed}
      />
    </>
  );
};

// ===================== MAIN COMPONENT =====================

const DEFAULT_CAMERA_SINGLE: [number, number, number] = [4, 3, 4];
const DEFAULT_CAMERA_TIMELINE: [number, number, number] = [0, 5, 12];
const DEFAULT_TARGET: [number, number, number] = [0, 0.8, 0];

interface PlantLifecycle3DProps {
  liveSensorData?: {
    temperature?: number;
    humidity?: number;
    light?: number;
    lightsOn?: boolean;
  };
}

const PlantLifecycle3D = ({ liveSensorData }: PlantLifecycle3DProps) => {
  const [plantType, setPlantType] = useState<PlantType>('tomato');
  const [currentDay, setCurrentDay] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'timeline'>('single');
  const [useLiveData, setUseLiveData] = useState(true);
  const [env, setEnv] = useState<EnvironmentState>({
    temperature: 25,
    humidity: 65,
    light: 75,
    lightsOn: true,
    isRaining: false,
  });
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const profile = PLANT_PROFILES[plantType];
  const stage = getDayStage(currentDay, profile);
  const bestDay = profile.bestHarvestDay;
  const isHarvestWindow = currentDay >= Math.floor(profile.totalDays * 0.87);
  const growthSpeed = computeGrowthSpeed(env, profile);

  // Sync live sensor data when enabled
  useEffect(() => {
    if (useLiveData && liveSensorData) {
      setEnv(prev => ({
        ...prev,
        temperature: liveSensorData.temperature ?? prev.temperature,
        humidity: liveSensorData.humidity ?? prev.humidity,
        light: liveSensorData.light ?? prev.light,
        lightsOn: liveSensorData.lightsOn ?? prev.lightsOn,
      }));
    }
  }, [useLiveData, liveSensorData?.temperature, liveSensorData?.humidity, liveSensorData?.light, liveSensorData?.lightsOn]);

  // Clamp currentDay when switching plant type
  useEffect(() => {
    if (currentDay > profile.totalDays) setCurrentDay(profile.totalDays);
  }, [plantType, profile.totalDays, currentDay]);

  // Auto-play with speed affected by environment
  useEffect(() => {
    if (isPlaying) {
      const interval = Math.max(50, 200 / Math.max(0.2, growthSpeed));
      playIntervalRef.current = setInterval(() => {
        setCurrentDay(prev => {
          if (prev >= profile.totalDays) { setIsPlaying(false); return profile.totalDays; }
          return prev + 1;
        });
      }, interval);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, growthSpeed, profile.totalDays]);

  const jumpToHarvest = useCallback(() => { setCurrentDay(bestDay); setIsPlaying(false); }, [bestDay]);

  const phaseColors: Record<string, string> = {
    seed: 'hsl(var(--muted))',
    seedling: 'hsl(142, 71%, 45%)',
    vegetative: 'hsl(142, 76%, 36%)',
    flowering: 'hsl(45, 93%, 47%)',
    fruiting: 'hsl(16, 85%, 54%)',
    harvest: 'hsl(0, 72%, 51%)',
  };

  const totalDays = profile.totalDays;

  return (
    <Fullscreen3DWrapper
      title="Plant Lifecycle"
      defaultCameraPosition={viewMode === 'timeline' ? DEFAULT_CAMERA_TIMELINE : DEFAULT_CAMERA_SINGLE}
      defaultTarget={DEFAULT_TARGET}
      autoFitOnLoad={true}
      zoomSpeed={0.5}
    >
      {({ enableZoom, controlsRef, sceneRef, performanceMode, zoomSpeed }) => (
        <>
          <Canvas shadows={!performanceMode}>
            <SceneCapture sceneRef={sceneRef} />
            <PerspectiveCamera makeDefault position={viewMode === 'timeline' ? DEFAULT_CAMERA_TIMELINE : DEFAULT_CAMERA_SINGLE} fov={45} />
            <Suspense fallback={null}>
              <LifecycleScene
                currentDay={currentDay}
                controlsRef={controlsRef}
                enableZoom={enableZoom}
                performanceMode={performanceMode}
                zoomSpeed={zoomSpeed}
                viewMode={viewMode}
                profile={profile}
                env={env}
              />
            </Suspense>
          </Canvas>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2 max-h-[60%] overflow-y-auto">
            {/* Harvest indicator */}
            {isHarvestWindow && (
              <div className="glass-card p-3 border-2 border-primary/50 animate-pulse">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary">
                    {stage.phase === 'harvest' ? '🎉 Optimal Harvest Window!' : 'Approaching harvest...'}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Best day: <strong className="text-primary">Day {bestDay}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Main control panel */}
            <div className="glass-card p-4">
              {/* Plant selector + stage info */}
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Select value={plantType} onValueChange={(v) => { setPlantType(v as PlantType); setCurrentDay(1); setIsPlaying(false); }}>
                      <SelectTrigger className="w-[150px] h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PLANT_PROFILES).map(([key, p]) => (
                          <SelectItem key={key} value={key}>{p.emoji} {p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phaseColors[stage.phase] }} />
                    <span className="text-sm font-display font-bold text-foreground">{stage.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient-primary">Day {currentDay}</div>
                  <div className="text-xs text-muted-foreground">Week {stage.week} / {Math.ceil(totalDays / 7)} • Speed {(growthSpeed * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center p-1.5 rounded-lg bg-muted/50">
                  <Sprout className="w-3.5 h-3.5 mx-auto text-primary mb-0.5" />
                  <div className="text-[10px] text-muted-foreground">Growth</div>
                  <div className="text-xs font-bold">{stage.heightPercent.toFixed(0)}%</div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-muted/50">
                  <Sun className="w-3.5 h-3.5 mx-auto text-yellow-500 mb-0.5" />
                  <div className="text-[10px] text-muted-foreground">Leaves</div>
                  <div className="text-xs font-bold">{stage.leafCount}</div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-muted/50">
                  <Apple className="w-3.5 h-3.5 mx-auto text-destructive mb-0.5" />
                  <div className="text-[10px] text-muted-foreground">Fruits</div>
                  <div className="text-xs font-bold">{stage.fruitCount}</div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-muted/50">
                  <Calendar className="w-3.5 h-3.5 mx-auto text-accent-foreground mb-0.5" />
                  <div className="text-[10px] text-muted-foreground">Harvest</div>
                  <div className="text-xs font-bold">{stage.harvestScore}%</div>
                </div>
              </div>

              {/* Day slider */}
              <div className="flex items-center gap-2 mb-2">
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setCurrentDay(Math.max(1, currentDay - 1))} disabled={currentDay <= 1}>
                  <SkipBack className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant={isPlaying ? 'destructive' : 'default'} className="h-7 w-7 p-0" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setCurrentDay(Math.min(totalDays, currentDay + 1))} disabled={currentDay >= totalDays}>
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
                <div className="flex-1">
                  <Slider value={[currentDay]} onValueChange={([val]) => { setCurrentDay(val); setIsPlaying(false); }} min={1} max={totalDays} step={1} />
                </div>
                <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={jumpToHarvest}>
                  <Apple className="w-3 h-3 mr-1" /> Best
                </Button>
              </div>

              {/* Timeline bar */}
              <div className="relative h-2.5 rounded-full overflow-hidden bg-muted mb-3">
                <div className="absolute inset-0 flex">
                  {[
                    { end: Math.floor(totalDays * 0.06), color: phaseColors.seed },
                    { end: Math.floor(totalDays * 0.19), color: phaseColors.seedling },
                    { end: Math.floor(totalDays * 0.44), color: phaseColors.vegetative },
                    { end: Math.floor(totalDays * 0.56), color: phaseColors.flowering },
                    { end: Math.floor(totalDays * 0.87), color: phaseColors.fruiting },
                    { end: totalDays, color: phaseColors.harvest },
                  ].map((seg, i, arr) => {
                    const start = i === 0 ? 0 : arr[i - 1].end;
                    return <div key={i} style={{ width: `${((seg.end - start) / totalDays) * 100}%`, backgroundColor: seg.color, opacity: currentDay >= start ? 0.8 : 0.2 }} />;
                  })}
                </div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10" style={{ left: `${(currentDay / totalDays) * 100}%` }} />
                <div className="absolute top-0 bottom-0 w-1 bg-primary z-10 rounded-full" style={{ left: `${(bestDay / totalDays) * 100}%` }} title={`Best harvest: Day ${bestDay}`} />
              </div>

              {/* Environment controls + view mode */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left: environment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Environment</div>
                    {liveSensorData && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Live</span>
                        <Switch checked={useLiveData} onCheckedChange={(v) => setUseLiveData(v)} className="scale-[0.6]" />
                        {useLiveData && <span className="text-[10px] text-primary font-bold animate-pulse">●</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3 h-3 text-destructive" />
                    <span className="text-[10px] text-muted-foreground w-8">{env.temperature}°C</span>
                    <Slider value={[env.temperature]} onValueChange={([v]) => setEnv(prev => ({ ...prev, temperature: v }))} min={10} max={40} step={1} className="flex-1" disabled={useLiveData && !!liveSensorData} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] text-muted-foreground w-8">{env.humidity}%</span>
                    <Slider value={[env.humidity]} onValueChange={([v]) => setEnv(prev => ({ ...prev, humidity: v }))} min={20} max={100} step={1} className="flex-1" disabled={useLiveData && !!liveSensorData} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] text-muted-foreground w-8">{env.light}%</span>
                    <Slider value={[env.light]} onValueChange={([v]) => setEnv(prev => ({ ...prev, light: v }))} min={0} max={100} step={1} className="flex-1" disabled={useLiveData && !!liveSensorData} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {env.lightsOn ? <Lightbulb className="w-3 h-3 text-pink-400" /> : <LightbulbOff className="w-3 h-3 text-muted-foreground" />}
                      <span className="text-[10px] text-muted-foreground">Lights</span>
                      <Switch checked={env.lightsOn} onCheckedChange={(v) => setEnv(prev => ({ ...prev, lightsOn: v }))} className="scale-75" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CloudRain className="w-3 h-3 text-blue-300" />
                      <span className="text-[10px] text-muted-foreground">Rain</span>
                      <Switch checked={env.isRaining} onCheckedChange={(v) => setEnv(prev => ({ ...prev, isRaining: v }))} className="scale-75" />
                    </div>
                  </div>
                </div>

                {/* Right: view mode + info */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">View</div>
                  <div className="flex gap-1">
                    <Button size="sm" variant={viewMode === 'single' ? 'default' : 'outline'} onClick={() => setViewMode('single')} className="text-[10px] h-7 flex-1">
                      🌱 Plant
                    </Button>
                    <Button size="sm" variant={viewMode === 'timeline' ? 'default' : 'outline'} onClick={() => setViewMode('timeline')} className="text-[10px] h-7 flex-1">
                      📊 Stages
                    </Button>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5 p-2 bg-muted/30 rounded-lg">
                    <div>Ideal: {profile.idealTemp}°C / {profile.idealHumidity}% RH / {profile.idealLight}% light</div>
                    <div>Harvest: Day {bestDay} ({Math.ceil(bestDay / 7)} weeks)</div>
                    <div>Total cycle: {totalDays} days ({Math.ceil(totalDays / 7)} weeks)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Fullscreen3DWrapper>
  );
};

export default PlantLifecycle3D;
