import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw } from 'lucide-react';

const GROWTH_STAGES = [
  { week: 1, name: 'Seed', description: 'Germination begins', heightPercentage: 5 },
  { week: 2, name: 'Sprout', description: 'First leaves emerge', heightPercentage: 10 },
  { week: 3, name: 'Seedling', description: 'Root development', heightPercentage: 15 },
  { week: 4, name: 'Vegetative 1', description: 'Stem strengthening', heightPercentage: 25 },
  { week: 5, name: 'Vegetative 2', description: 'Leaf expansion', heightPercentage: 35 },
  { week: 6, name: 'Vegetative 3', description: 'Branching begins', heightPercentage: 45 },
  { week: 7, name: 'Pre-flowering', description: 'Bud formation', heightPercentage: 55 },
  { week: 8, name: 'Flowering', description: 'Flowers appear', heightPercentage: 65 },
  { week: 9, name: 'Pollination', description: 'Fruit set begins', heightPercentage: 70 },
  { week: 10, name: 'Fruit Dev 1', description: 'Small fruits forming', heightPercentage: 75 },
  { week: 11, name: 'Fruit Dev 2', description: 'Fruits growing', heightPercentage: 80 },
  { week: 12, name: 'Fruit Dev 3', description: 'Color development', heightPercentage: 85 },
  { week: 13, name: 'Ripening 1', description: 'Sugar accumulation', heightPercentage: 90 },
  { week: 14, name: 'Ripening 2', description: 'Full color', heightPercentage: 95 },
  { week: 15, name: 'Mature', description: 'Ready for harvest', heightPercentage: 100 },
  { week: 16, name: 'Harvest', description: 'Peak ripeness', heightPercentage: 100 },
];

const SoilLayer = () => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Top soil */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#3d2914" roughness={1} />
      </mesh>
      {/* Rich soil */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#2d1f0f" roughness={1} />
      </mesh>
      {/* Clay layer */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#8b4513" roughness={1} />
      </mesh>
      {/* Subsoil */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#654321" roughness={1} />
      </mesh>
    </group>
  );
};

const GrowingPlant = ({ growthPercentage, position }: { 
  growthPercentage: number;
  position: [number, number, number];
}) => {
  const plantRef = useRef<THREE.Group>(null);
  
  const stemHeight = (growthPercentage / 100) * 2;
  const leafCount = Math.floor(growthPercentage / 15);
  const hasFruit = growthPercentage > 60;
  const fruitSize = hasFruit ? Math.min(0.15, (growthPercentage - 60) * 0.004) : 0;
  const fruitRipeness = growthPercentage > 80 ? (growthPercentage - 80) / 20 : 0;
  
  useFrame((state) => {
    if (plantRef.current) {
      plantRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  const fruitColor = new THREE.Color().lerpColors(
    new THREE.Color('#48bb78'),
    new THREE.Color('#e53e3e'),
    fruitRipeness
  );

  return (
    <group ref={plantRef} position={position}>
      {/* Root system (underground) */}
      {growthPercentage > 5 && (
        <group position={[0, -0.3, 0]}>
          {[...Array(Math.min(8, Math.floor(growthPercentage / 10)))].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * 0.8) * 0.2 * (i / 8),
                -0.1 * i,
                Math.sin(i * 0.8) * 0.2 * (i / 8)
              ]}
              rotation={[Math.PI / 4, i * 0.5, 0]}
            >
              <cylinderGeometry args={[0.008, 0.003, 0.15, 6]} />
              <meshStandardMaterial color="#8b7355" />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Stem */}
      {growthPercentage > 3 && (
        <mesh position={[0, stemHeight / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.03, stemHeight, 8]} />
          <meshStandardMaterial color="#2d5a27" />
        </mesh>
      )}
      
      {/* Leaves */}
      {[...Array(leafCount)].map((_, i) => {
        const angle = (i * 137.5 * Math.PI) / 180;
        const height = 0.2 + i * 0.18;
        const leafSize = 0.08 + Math.sin(i * 0.5) * 0.03;
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.1,
              Math.min(height, stemHeight * 0.9),
              Math.sin(angle) * 0.1
            ]}
            rotation={[0.4 - i * 0.03, angle, Math.cos(i) * 0.2]}
          >
            <sphereGeometry args={[leafSize, 8, 6]} />
            <meshStandardMaterial color={i > leafCount - 3 ? '#68d391' : '#38a169'} />
          </mesh>
        );
      })}
      
      {/* Flowers (pre-fruit) */}
      {growthPercentage > 50 && growthPercentage < 70 && (
        <group position={[0, stemHeight * 0.85, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * 2.1) * 0.15,
                0.1,
                Math.sin(i * 2.1) * 0.15
              ]}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#f6e05e" />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Fruits */}
      {hasFruit && (
        <group position={[0, stemHeight * 0.7, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * 2.1) * 0.18,
                0.05 + i * 0.1,
                Math.sin(i * 2.1) * 0.18
              ]}
            >
              <sphereGeometry args={[fruitSize, 16, 16]} />
              <meshStandardMaterial 
                color={fruitColor} 
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

interface GrowthSimulation3DProps {
  simulationSpeed?: number;
  isPaused?: boolean;
  onWeekChange?: (week: number) => void;
}

const CameraController = ({ controlsRef }: { controlsRef: React.RefObject<any> }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(6, 4, 6);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.update();
    }
  }, [camera, controlsRef]);
  
  return null;
};

const GrowthSimulation3D = ({ 
  simulationSpeed = 3000,
  isPaused = false,
  onWeekChange
}: GrowthSimulation3DProps) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [growthPercentage, setGrowthPercentage] = useState(5);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentWeek(prev => {
        const next = prev >= 16 ? 1 : prev + 1;
        onWeekChange?.(next);
        return next;
      });
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [simulationSpeed, isPaused, onWeekChange]);

  useEffect(() => {
    const stage = GROWTH_STAGES.find(s => s.week === currentWeek);
    if (stage) {
      setGrowthPercentage(stage.heightPercentage);
    }
  }, [currentWeek]);

  const currentStage = GROWTH_STAGES.find(s => s.week === currentWeek);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(6, 4, 6);
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={40} />
        <OrbitControls 
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.5, 0]}
        />
        <CameraController controlsRef={controlsRef} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 3, -3]} intensity={0.3} color="#ffb74d" />
        
        <Suspense fallback={null}>
          <SoilLayer />
          
          {/* Main plant */}
          <GrowingPlant growthPercentage={growthPercentage} position={[0, 0, 0]} />
          
          {/* Additional plants for context */}
          <GrowingPlant 
            growthPercentage={Math.max(0, growthPercentage - 15)} 
            position={[-1, 0, 0.5]} 
          />
          <GrowingPlant 
            growthPercentage={Math.max(0, growthPercentage - 30)} 
            position={[1, 0, -0.5]} 
          />
        </Suspense>
      </Canvas>
      
      {/* Reset View Button */}
      <button
        onClick={handleResetView}
        className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors z-10"
        title="Reset View"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      
      {/* Stage info overlay */}
      <div className="absolute bottom-4 left-4 right-4 glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Week {currentWeek} of 16</div>
            <div className="text-lg font-display font-bold text-primary">
              {currentStage?.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStage?.description}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gradient-primary">
              {growthPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Growth Progress</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${(currentWeek / 16) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GrowthSimulation3D;
