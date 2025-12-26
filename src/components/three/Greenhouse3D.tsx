import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

interface PlantProps {
  position: [number, number, number];
  growthStage: number;
  type: 'tomato' | 'lettuce' | 'pepper' | 'strawberry';
}

const Plant = ({ position, growthStage, type }: PlantProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const scale = 0.3 + (growthStage / 100) * 0.7;
  
  const colors = {
    tomato: '#e53e3e',
    lettuce: '#48bb78',
    pepper: '#f6ad55',
    strawberry: '#fc8181',
  };

  return (
    <group ref={meshRef} position={position}>
      {/* Stem */}
      <mesh position={[0, scale * 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.03, scale, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      
      {/* Leaves */}
      {[...Array(Math.floor(growthStage / 20))].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * 1.5) * 0.15,
            0.2 + i * 0.15,
            Math.sin(i * 1.5) * 0.15
          ]}
          rotation={[0.3, i * 0.8, 0]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#38a169" />
        </mesh>
      ))}
      
      {/* Fruit/Vegetable */}
      {growthStage > 50 && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={[0.1, scale * 0.8, 0.1]}>
            <sphereGeometry args={[0.06 + (growthStage - 50) * 0.001, 16, 16]} />
            <meshStandardMaterial 
              color={colors[type]} 
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
};

const GreenhouseStructure = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#3d2914" roughness={0.9} />
      </mesh>
      
      {/* Raised beds */}
      {[-2, 0, 2].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.5, 0.3, 4]} />
            <meshStandardMaterial color="#5a3e1b" roughness={0.8} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[1.4, 0.05, 3.9]} />
            <meshStandardMaterial color="#2d1f0f" roughness={1} />
          </mesh>
        </group>
      ))}
      
      {/* Glass walls */}
      {[
        { pos: [0, 1.5, -3] as [number, number, number], rot: [0, 0, 0] as [number, number, number], size: [8, 3, 0.05] as [number, number, number] },
        { pos: [0, 1.5, 3] as [number, number, number], rot: [0, 0, 0] as [number, number, number], size: [8, 3, 0.05] as [number, number, number] },
        { pos: [-4, 1.5, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], size: [6, 3, 0.05] as [number, number, number] },
        { pos: [4, 1.5, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], size: [6, 3, 0.05] as [number, number, number] },
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos} rotation={wall.rot}>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial 
            color="#88ccff"
            transparent
            opacity={0.2}
            roughness={0}
            metalness={0.8}
          />
        </mesh>
      ))}
      
      {/* Roof frame */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[5.7, 1.5, 4]} />
        <meshStandardMaterial 
          color="#88ccff"
          transparent
          opacity={0.15}
          roughness={0}
          metalness={0.9}
        />
      </mesh>
      
      {/* Metal frame beams */}
      {[-4, 0, 4].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0]}>
          <boxGeometry args={[0.08, 3, 0.08]} />
          <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const SensorIndicator = ({ position, value, unit, type }: { 
  position: [number, number, number];
  value: number;
  unit: string;
  type: string;
}) => {
  const colors: Record<string, string> = {
    temperature: '#f56565',
    humidity: '#4299e1',
    moisture: '#48bb78',
  };

  return (
    <Html position={position} center>
      <div className="glass-card px-3 py-2 text-center min-w-[80px] animate-pulse-glow">
        <div className="text-xs text-muted-foreground capitalize">{type}</div>
        <div className="text-lg font-bold" style={{ color: colors[type] }}>
          {value.toFixed(1)}{unit}
        </div>
      </div>
    </Html>
  );
};

const IrrigationSystem = ({ active }: { active: boolean }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current && active) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  if (!active) return null;

  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = Math.random() * 2 + 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#4299e1"
        transparent
        opacity={0.8}
      />
    </points>
  );
};

const AnimatedScene = ({ sensorData, irrigationActive }: {
  sensorData: { temperature: number; humidity: number; moisture: number };
  irrigationActive: boolean;
}) => {
  const [growthStages, setGrowthStages] = useState([68, 45, 82, 55, 40, 75, 60, 88, 30]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGrowthStages(prev => prev.map(stage => 
        Math.min(100, stage + Math.random() * 0.5)
      ));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const plantPositions: Array<{ pos: [number, number, number]; type: 'tomato' | 'lettuce' | 'pepper' | 'strawberry' }> = [
    { pos: [-2, 0.35, -1.2], type: 'tomato' },
    { pos: [-2, 0.35, 0], type: 'tomato' },
    { pos: [-2, 0.35, 1.2], type: 'lettuce' },
    { pos: [0, 0.35, -1.2], type: 'pepper' },
    { pos: [0, 0.35, 0], type: 'lettuce' },
    { pos: [0, 0.35, 1.2], type: 'strawberry' },
    { pos: [2, 0.35, -1.2], type: 'strawberry' },
    { pos: [2, 0.35, 0], type: 'pepper' },
    { pos: [2, 0.35, 1.2], type: 'tomato' },
  ];

  return (
    <>
      <GreenhouseStructure />
      
      {plantPositions.map((plant, i) => (
        <Plant
          key={i}
          position={plant.pos}
          growthStage={growthStages[i]}
          type={plant.type}
        />
      ))}
      
      <IrrigationSystem active={irrigationActive} />
      
      {/* Sensor indicators */}
      <SensorIndicator 
        position={[-3, 2, -2]} 
        value={sensorData.temperature} 
        unit="°C" 
        type="temperature" 
      />
      <SensorIndicator 
        position={[3, 2, -2]} 
        value={sensorData.humidity} 
        unit="%" 
        type="humidity" 
      />
      <SensorIndicator 
        position={[0, 2, 2]} 
        value={sensorData.moisture} 
        unit="%" 
        type="moisture" 
      />
    </>
  );
};

interface Greenhouse3DProps {
  sensorData?: { temperature: number; humidity: number; moisture: number };
  irrigationActive?: boolean;
}

const Greenhouse3D = ({ 
  sensorData = { temperature: 24.5, humidity: 65, moisture: 72 },
  irrigationActive = false 
}: Greenhouse3DProps) => {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.1}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ffb74d" />
        
        <Suspense fallback={null}>
          <AnimatedScene 
            sensorData={sensorData} 
            irrigationActive={irrigationActive}
          />
          <Environment preset="sunset" />
        </Suspense>
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a472a" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Greenhouse3D;
