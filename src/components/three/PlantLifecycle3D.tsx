import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Fullscreen3DWrapper from './Fullscreen3DWrapper';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Calendar, Sprout, Apple, Sun } from 'lucide-react';

// --- Types & Data ---

interface DayStage {
  day: number;
  week: number;
  name: string;
  phase: 'seed' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  description: string;
  heightPercent: number;
  leafCount: number;
  fruitCount: number;
  fruitRipeness: number; // 0-1
  harvestScore: number; // 0-100 (best harvest readiness)
}

const TOTAL_DAYS = 112; // 16 weeks

const getDayStage = (day: number): DayStage => {
  const week = Math.ceil(day / 7);
  const progress = day / TOTAL_DAYS;

  if (day <= 7) return { day, week, name: 'Seed', phase: 'seed', description: 'Germination — seed absorbs water', heightPercent: 2 + progress * 30, leafCount: 0, fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= 21) return { day, week, name: 'Seedling', phase: 'seedling', description: 'First leaves emerge, roots establish', heightPercent: 8 + (day / 21) * 20, leafCount: Math.floor((day - 7) / 3), fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= 49) return { day, week, name: 'Vegetative', phase: 'vegetative', description: 'Rapid stem & leaf growth', heightPercent: 25 + ((day - 21) / 28) * 35, leafCount: 4 + Math.floor((day - 21) / 4), fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= 63) return { day, week, name: 'Flowering', phase: 'flowering', description: 'Flowers bloom, pollination begins', heightPercent: 60 + ((day - 49) / 14) * 15, leafCount: 10, fruitCount: 0, fruitRipeness: 0, harvestScore: 0 };
  if (day <= 98) {
    const fruitProgress = (day - 63) / 35;
    return { day, week, name: 'Fruiting', phase: 'fruiting', description: 'Fruits develop and ripen', heightPercent: 75 + fruitProgress * 15, leafCount: 10, fruitCount: Math.min(5, Math.floor(fruitProgress * 6)), fruitRipeness: fruitProgress, harvestScore: Math.floor(fruitProgress * 60) };
  }
  const harvestProgress = (day - 98) / 14;
  return { day, week, name: 'Harvest Ready', phase: 'harvest', description: 'Peak ripeness — optimal harvest window!', heightPercent: 90 + harvestProgress * 10, leafCount: 9, fruitCount: 5, fruitRipeness: 1, harvestScore: 60 + Math.floor(Math.sin(harvestProgress * Math.PI) * 40) };
};

const getBestHarvestDay = (): number => 105; // Day 105 = peak

// --- Scene Components ---

const SceneCapture = ({ sceneRef }: { sceneRef: React.RefObject<THREE.Scene | null> }) => {
  const { scene } = useThree();
  useEffect(() => {
    if (sceneRef && 'current' in sceneRef) {
      (sceneRef as React.MutableRefObject<THREE.Scene | null>).current = scene;
    }
  }, [scene, sceneRef]);
  return null;
};

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

interface PlantModelProps {
  stage: DayStage;
  performanceMode: boolean;
}

const PlantModel = ({ stage, performanceMode }: PlantModelProps) => {
  const plantRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);

  const stemHeight = (stage.heightPercent / 100) * 2.5;
  const isHarvest = stage.phase === 'harvest';

  useFrame((state) => {
    if (plantRef.current && !performanceMode) {
      plantRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.02;
    }
    if (leavesRef.current && !performanceMode) {
      leavesRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + i * 0.7) * 0.06;
      });
    }
  });

  const fruitColor = useMemo(() => {
    return new THREE.Color().lerpColors(
      new THREE.Color('#48bb78'),
      new THREE.Color('#e53e3e'),
      stage.fruitRipeness
    );
  }, [stage.fruitRipeness]);

  return (
    <group ref={plantRef}>
      <Pot />

      {/* Seed visible */}
      {stage.phase === 'seed' && (
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#8B7355" roughness={0.8} />
        </mesh>
      )}

      {/* Sprout */}
      {stage.phase === 'seed' && stage.day > 4 && (
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.01, 0.015, 0.12, 6]} />
          <meshStandardMaterial color="#68d391" />
        </mesh>
      )}

      {/* Stem */}
      {stage.phase !== 'seed' && (
        <group>
          {[...Array(Math.max(2, Math.ceil(stemHeight / 0.4)))].map((_, i) => {
            const segH = stemHeight / Math.max(2, Math.ceil(stemHeight / 0.4));
            const thick = 0.04 - i * 0.003;
            return (
              <mesh key={i} position={[0, i * segH + segH / 2, 0]}>
                <cylinderGeometry args={[Math.max(0.01, thick * 0.8), Math.max(0.012, thick), segH, 8]} />
                <meshStandardMaterial color="#2d5a27" roughness={0.7} />
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
            return (
              <Float key={i} speed={performanceMode ? 0 : 1.2} rotationIntensity={performanceMode ? 0 : 0.08} floatIntensity={0}>
                <group position={[0, Math.min(h, stemHeight * 0.95), 0]} rotation={[0.35, angle, Math.PI / 5]}>
                  <mesh position={[0.15, 0, 0]}>
                    <sphereGeometry args={[size, 6, 4]} />
                    <meshStandardMaterial color={i > stage.leafCount - 3 ? '#68d391' : '#38a169'} roughness={0.5} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              </Float>
            );
          })}
        </group>
      )}

      {/* Flowers */}
      {stage.phase === 'flowering' && (
        <group position={[0, stemHeight * 0.8, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <Float key={i} speed={2} floatIntensity={0.1}>
              <mesh position={[Math.cos(i * 1.6) * 0.2, 0.05, Math.sin(i * 1.6) * 0.2]}>
                <sphereGeometry args={[0.04, 10, 10]} />
                <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.3} />
              </mesh>
              {/* Petals */}
              {[0, 1, 2, 3, 4].map((p) => (
                <mesh key={p} position={[
                  Math.cos(i * 1.6) * 0.2 + Math.cos(p * 1.26) * 0.05,
                  0.05,
                  Math.sin(i * 1.6) * 0.2 + Math.sin(p * 1.26) * 0.05
                ]}>
                  <sphereGeometry args={[0.02, 6, 6]} />
                  <meshStandardMaterial color="#FDE68A" />
                </mesh>
              ))}
            </Float>
          ))}
        </group>
      )}

      {/* Fruits */}
      {stage.fruitCount > 0 && (
        <group position={[0, stemHeight * 0.65, 0]}>
          {[...Array(stage.fruitCount)].map((_, i) => {
            const a = (i / Math.max(stage.fruitCount, 1)) * Math.PI * 2 + 0.4;
            const fruitSize = 0.05 + stage.fruitRipeness * 0.06;
            return (
              <group key={i} position={[Math.cos(a) * 0.22, -0.05 - i * 0.1, Math.sin(a) * 0.22]}>
                <mesh rotation={[0.3, 0, 0]}>
                  <cylinderGeometry args={[0.006, 0.004, 0.07, 6]} />
                  <meshStandardMaterial color="#4A7023" />
                </mesh>
                <Float speed={performanceMode ? 0 : 1.5} floatIntensity={performanceMode ? 0 : 0.04}>
                  <mesh position={[0, -0.05, 0]}>
                    <sphereGeometry args={[fruitSize, 14, 14]} />
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

// Timeline plants showing all stages side by side
const TimelinePlants = ({ currentDay, performanceMode }: { currentDay: number; performanceMode: boolean }) => {
  const timelineStages = [7, 14, 35, 56, 84, 105];
  const labels = ['Seed', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];

  return (
    <group position={[-6, 0, 0]}>
      {timelineStages.map((day, i) => {
        const stage = getDayStage(day);
        const isActive = currentDay >= day && (i === timelineStages.length - 1 || currentDay < timelineStages[i + 1]);
        return (
          <group key={i} position={[i * 2.5, 0, 0]}>
            {/* Highlight ring for active stage */}
            {isActive && (
              <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.55, 0.65, 32]} />
                <meshBasicMaterial color="#22C55E" transparent opacity={0.6} />
              </mesh>
            )}
            <group scale={0.6}>
              <PlantModel stage={stage} performanceMode={performanceMode} />
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

// Ground
const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[30, 20]} />
    <meshStandardMaterial color="#1a472a" roughness={0.9} />
  </mesh>
);

// --- Main Scene ---

const LifecycleScene = ({ 
  currentDay, controlsRef, enableZoom, performanceMode, zoomSpeed, viewMode 
}: { 
  currentDay: number;
  controlsRef: React.RefObject<any>;
  enableZoom: boolean;
  performanceMode: boolean;
  zoomSpeed: number;
  viewMode: 'single' | 'timeline';
}) => {
  const stage = getDayStage(currentDay);

  return (
    <>
      <ambientLight intensity={performanceMode ? 0.6 : 0.35} />
      <directionalLight position={[8, 12, 6]} intensity={performanceMode ? 0.7 : 0.9} castShadow={!performanceMode} color="#FFF8E1" />
      {!performanceMode && <pointLight position={[-5, 5, -5]} intensity={0.25} color="#FFE4B5" />}

      {viewMode === 'single' ? (
        <PlantModel stage={stage} performanceMode={performanceMode} />
      ) : (
        <TimelinePlants currentDay={currentDay} performanceMode={performanceMode} />
      )}

      <Ground />
      {!performanceMode && <Environment preset="sunset" />}

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

// --- Main Component ---

const DEFAULT_CAMERA_SINGLE: [number, number, number] = [4, 3, 4];
const DEFAULT_CAMERA_TIMELINE: [number, number, number] = [0, 5, 12];
const DEFAULT_TARGET: [number, number, number] = [0, 0.8, 0];

const PlantLifecycle3D = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'timeline'>('single');
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stage = getDayStage(currentDay);
  const bestDay = getBestHarvestDay();
  const isHarvestWindow = currentDay >= 98;

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentDay(prev => {
          if (prev >= TOTAL_DAYS) { setIsPlaying(false); return TOTAL_DAYS; }
          return prev + 1;
        });
      }, 200);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying]);

  const jumpToHarvest = useCallback(() => { setCurrentDay(bestDay); setIsPlaying(false); }, [bestDay]);

  const phaseColors: Record<string, string> = {
    seed: 'hsl(var(--muted))',
    seedling: 'hsl(142, 71%, 45%)',
    vegetative: 'hsl(142, 76%, 36%)',
    flowering: 'hsl(45, 93%, 47%)',
    fruiting: 'hsl(16, 85%, 54%)',
    harvest: 'hsl(0, 72%, 51%)',
  };

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
              />
            </Suspense>
          </Canvas>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-3">
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
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phaseColors[stage.phase] }} />
                    <span className="text-lg font-display font-bold text-foreground">{stage.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{stage.phase}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{stage.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient-primary">Day {currentDay}</div>
                  <div className="text-xs text-muted-foreground">Week {stage.week} / 16</div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <Sprout className="w-4 h-4 mx-auto text-primary mb-1" />
                  <div className="text-xs text-muted-foreground">Growth</div>
                  <div className="text-sm font-bold">{stage.heightPercent.toFixed(0)}%</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <Sun className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                  <div className="text-xs text-muted-foreground">Leaves</div>
                  <div className="text-sm font-bold">{stage.leafCount}</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <Apple className="w-4 h-4 mx-auto text-destructive mb-1" />
                  <div className="text-xs text-muted-foreground">Fruits</div>
                  <div className="text-sm font-bold">{stage.fruitCount}</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <Calendar className="w-4 h-4 mx-auto text-accent-foreground mb-1" />
                  <div className="text-xs text-muted-foreground">Harvest</div>
                  <div className="text-sm font-bold">{stage.harvestScore}%</div>
                </div>
              </div>

              {/* Day slider */}
              <div className="flex items-center gap-3 mb-3">
                <Button size="sm" variant="outline" onClick={() => setCurrentDay(Math.max(1, currentDay - 1))} disabled={currentDay <= 1}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button size="sm" variant={isPlaying ? 'destructive' : 'default'} onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentDay(Math.min(TOTAL_DAYS, currentDay + 1))} disabled={currentDay >= TOTAL_DAYS}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Slider
                    value={[currentDay]}
                    onValueChange={([val]) => { setCurrentDay(val); setIsPlaying(false); }}
                    min={1}
                    max={TOTAL_DAYS}
                    step={1}
                  />
                </div>
                <Button size="sm" variant="secondary" onClick={jumpToHarvest} title="Jump to best harvest day">
                  <Apple className="w-4 h-4 mr-1" /> Best Day
                </Button>
              </div>

              {/* Timeline progress bar */}
              <div className="relative h-3 rounded-full overflow-hidden bg-muted">
                {/* Phase segments */}
                <div className="absolute inset-0 flex">
                  {[
                    { end: 7, color: phaseColors.seed },
                    { end: 21, color: phaseColors.seedling },
                    { end: 49, color: phaseColors.vegetative },
                    { end: 63, color: phaseColors.flowering },
                    { end: 98, color: phaseColors.fruiting },
                    { end: 112, color: phaseColors.harvest },
                  ].map((seg, i, arr) => {
                    const start = i === 0 ? 0 : arr[i - 1].end;
                    return (
                      <div key={i} style={{ width: `${((seg.end - start) / TOTAL_DAYS) * 100}%`, backgroundColor: seg.color, opacity: currentDay >= start ? 0.8 : 0.2 }} />
                    );
                  })}
                </div>
                {/* Current position marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10" style={{ left: `${(currentDay / TOTAL_DAYS) * 100}%` }} />
                {/* Best harvest marker */}
                <div className="absolute top-0 bottom-0 w-1 bg-primary z-10 rounded-full" style={{ left: `${(bestDay / TOTAL_DAYS) * 100}%` }} title={`Best harvest: Day ${bestDay}`} />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant={viewMode === 'single' ? 'default' : 'outline'} onClick={() => setViewMode('single')} className="text-xs">
                  🌱 Single Plant
                </Button>
                <Button size="sm" variant={viewMode === 'timeline' ? 'default' : 'outline'} onClick={() => setViewMode('timeline')} className="text-xs">
                  📊 All Stages
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Fullscreen3DWrapper>
  );
};

export default PlantLifecycle3D;
