import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Cloud, Html } from '@react-three/drei';
import * as THREE from 'three';

interface FieldPlantProps {
  position: [number, number, number];
  type: 'tomato' | 'corn' | 'lettuce' | 'carrot';
  growthStage: number;
}

const FieldPlant = ({ position, type, growthStage }: FieldPlantProps) => {
  const plantRef = useRef<THREE.Group>(null);
  const scale = 0.3 + (growthStage / 100) * 0.7;
  
  const colors = {
    tomato: { stem: '#2d5a27', fruit: '#e53e3e', leaf: '#38a169' },
    corn: { stem: '#8b7355', fruit: '#f6e05e', leaf: '#48bb78' },
    lettuce: { stem: '#2d5a27', fruit: '#68d391', leaf: '#48bb78' },
    carrot: { stem: '#2d5a27', fruit: '#ed8936', leaf: '#38a169' },
  };
  
  const plantColor = colors[type];

  useFrame((state) => {
    if (plantRef.current) {
      plantRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02;
    }
  });

  return (
    <group ref={plantRef} position={position}>
      {/* Main stem */}
      <mesh position={[0, scale * 0.4, 0]}>
        <cylinderGeometry args={[0.015 * scale, 0.025 * scale, scale * 0.8, 6]} />
        <meshStandardMaterial color={plantColor.stem} />
      </mesh>
      
      {/* Leaves */}
      {[...Array(Math.ceil(growthStage / 25))].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * 2.4) * 0.08 * scale,
            0.15 + i * 0.12 * scale,
            Math.sin(i * 2.4) * 0.08 * scale
          ]}
          rotation={[0.3, i * 1.2, 0]}
        >
          <sphereGeometry args={[0.05 * scale, 6, 6]} />
          <meshStandardMaterial color={plantColor.leaf} />
        </mesh>
      ))}
      
      {/* Fruit/vegetable */}
      {growthStage > 60 && (
        <mesh position={[0, scale * 0.7, 0.05]}>
          <sphereGeometry args={[0.04 * (growthStage / 100), 12, 12]} />
          <meshStandardMaterial 
            color={plantColor.fruit} 
            roughness={0.4}
          />
        </mesh>
      )}
    </group>
  );
};

const Field = ({ temperature, humidity }: { temperature: number; humidity: number }) => {
  const plants = useMemo(() => {
    const plantData: Array<{ pos: [number, number, number]; type: 'tomato' | 'corn' | 'lettuce' | 'carrot'; growth: number }> = [];
    const types: Array<'tomato' | 'corn' | 'lettuce' | 'carrot'> = ['tomato', 'corn', 'lettuce', 'carrot'];
    
    for (let x = -6; x <= 6; x += 1.5) {
      for (let z = -4; z <= 4; z += 1.2) {
        plantData.push({
          pos: [x + (Math.random() - 0.5) * 0.3, 0, z + (Math.random() - 0.5) * 0.3],
          type: types[Math.floor(Math.random() * types.length)],
          growth: 40 + Math.random() * 60,
        });
      }
    }
    return plantData;
  }, []);

  // Environmental effects based on sensor data
  const sunIntensity = temperature > 25 ? 1.2 : temperature < 15 ? 0.6 : 1;
  const fogDensity = humidity > 80 ? 0.02 : humidity > 60 ? 0.008 : 0.003;

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#3d2914" roughness={0.95} />
      </mesh>
      
      {/* Furrows/rows */}
      {[-4.5, -1.5, 1.5, 4.5].map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 0.8]} />
          <meshStandardMaterial color="#2d1f0f" roughness={1} />
        </mesh>
      ))}
      
      {/* Plants */}
      {plants.map((plant, i) => (
        <FieldPlant
          key={i}
          position={plant.pos}
          type={plant.type}
          growthStage={plant.growth}
        />
      ))}
      
      {/* Sky and atmosphere */}
      <Sky 
        sunPosition={[100, sunIntensity * 50, 100]} 
        turbidity={8}
        rayleigh={humidity > 70 ? 4 : 2}
      />
      
      {/* Clouds based on humidity */}
      {humidity > 50 && (
        <group>
          <Cloud position={[-10, 8, -5]} speed={0.2} opacity={humidity / 200} />
          <Cloud position={[5, 10, 0]} speed={0.1} opacity={humidity / 150} />
          <Cloud position={[10, 7, 5]} speed={0.15} opacity={humidity / 180} />
        </group>
      )}
      
      {/* Fog effect for high humidity */}
      <fog attach="fog" args={['#a0c4a0', 10, 50 / fogDensity]} />
      
      {/* Sensor display posts */}
      {[
        { pos: [-7, 0, 0] as [number, number, number], label: 'Zone A' },
        { pos: [7, 0, 0] as [number, number, number], label: 'Zone B' },
      ].map((post, i) => (
        <group key={i} position={post.pos}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
            <meshStandardMaterial color="#4a5568" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.1]} />
            <meshStandardMaterial color="#1a202c" />
          </mesh>
          <Html position={[0, 1.8, 0]} center>
            <div className="glass-card px-2 py-1 text-xs text-center whitespace-nowrap">
              <div className="font-bold text-primary">{post.label}</div>
              <div className="text-muted-foreground">{temperature.toFixed(1)}°C</div>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
};

interface VirtualField3DProps {
  temperature?: number;
  humidity?: number;
  moisture?: number;
}

const VirtualField3D = ({ 
  temperature = 24,
  humidity = 65,
  moisture = 70 
}: VirtualField3DProps) => {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={45} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.1}
        />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 15, 10]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        <Suspense fallback={null}>
          <Field temperature={temperature} humidity={humidity} />
        </Suspense>
      </Canvas>
      
      {/* Environment indicators */}
      <div className="absolute top-4 right-4 glass-card p-3 space-y-2">
        <div className="text-xs text-muted-foreground">Real-time Environment</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-temperature" />
          <span>{temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-humidity" />
          <span>{humidity.toFixed(0)}% RH</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-moisture" />
          <span>{moisture.toFixed(0)}% Soil</span>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground glass-card px-3 py-2">
        Drag to rotate • Scroll to zoom • Environmental effects respond to sensor data
      </div>
    </div>
  );
};

export default VirtualField3D;
