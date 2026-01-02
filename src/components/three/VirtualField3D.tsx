import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Cloud, Html } from '@react-three/drei';
import * as THREE from 'three';
import Fullscreen3DWrapper from './Fullscreen3DWrapper';

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

const Field = ({ 
  temperature, 
  humidity, 
  controlsRef, 
  enableZoom,
  performanceMode 
}: { 
  temperature: number; 
  humidity: number; 
  controlsRef: React.RefObject<any>; 
  enableZoom: boolean;
  performanceMode: boolean;
}) => {
  const plants = useMemo(() => {
    const plantData: Array<{ pos: [number, number, number]; type: 'tomato' | 'corn' | 'lettuce' | 'carrot'; growth: number }> = [];
    const types: Array<'tomato' | 'corn' | 'lettuce' | 'carrot'> = ['tomato', 'corn', 'lettuce', 'carrot'];
    
    // Reduce plant count in performance mode
    const step = performanceMode ? 3 : 1.5;
    for (let x = -6; x <= 6; x += step) {
      for (let z = -4; z <= 4; z += step * 0.8) {
        plantData.push({
          pos: [x + (Math.random() - 0.5) * 0.3, 0, z + (Math.random() - 0.5) * 0.3],
          type: types[Math.floor(Math.random() * types.length)],
          growth: 40 + Math.random() * 60,
        });
      }
    }
    return plantData;
  }, [performanceMode]);

  // Environmental effects based on sensor data
  const sunIntensity = temperature > 25 ? 1.2 : temperature < 15 ? 0.6 : 1;
  const fogDensity = humidity > 80 ? 0.02 : humidity > 60 ? 0.008 : 0.003;

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow={!performanceMode}>
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
      
      {/* Sky and atmosphere - skip in performance mode */}
      {!performanceMode && (
        <Sky 
          sunPosition={[100, sunIntensity * 50, 100]} 
          turbidity={8}
          rayleigh={humidity > 70 ? 4 : 2}
        />
      )}
      
      {/* Clouds based on humidity - skip in performance mode */}
      {!performanceMode && humidity > 50 && (
        <group>
          <Cloud position={[-10, 8, -5]} speed={0.2} opacity={humidity / 200} />
          <Cloud position={[5, 10, 0]} speed={0.1} opacity={humidity / 150} />
          <Cloud position={[10, 7, 5]} speed={0.15} opacity={humidity / 180} />
        </group>
      )}
      
      {/* Fog effect for high humidity - skip in performance mode */}
      {!performanceMode && (
        <fog attach="fog" args={['#a0c4a0', 10, 50 / fogDensity]} />
      )}
      
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
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={enableZoom}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
};

interface VirtualField3DProps {
  temperature?: number;
  humidity?: number;
  moisture?: number;
}

const DEFAULT_CAMERA_POSITION: [number, number, number] = [12, 8, 12];
const DEFAULT_TARGET: [number, number, number] = [0, 0, 0];

const VirtualField3D = ({ 
  temperature = 24,
  humidity = 65,
  moisture = 70 
}: VirtualField3DProps) => {
  return (
    <Fullscreen3DWrapper
      title="Virtual Field"
      defaultCameraPosition={DEFAULT_CAMERA_POSITION}
      defaultTarget={DEFAULT_TARGET}
    >
      {({ enableZoom, controlsRef, sceneRef, performanceMode }) => (
        <>
          <Canvas shadows={!performanceMode}>
            <SceneCapture sceneRef={sceneRef} />
            <PerspectiveCamera makeDefault position={DEFAULT_CAMERA_POSITION} fov={45} />
            
            <ambientLight intensity={performanceMode ? 0.6 : 0.4} />
            {!performanceMode && (
              <directionalLight 
                position={[10, 15, 10]} 
                intensity={1.2} 
                castShadow
                shadow-mapSize={[2048, 2048]}
              />
            )}
            {performanceMode && (
              <directionalLight position={[10, 15, 10]} intensity={0.9} />
            )}
            
            <Suspense fallback={null}>
              <Field 
                temperature={temperature} 
                humidity={humidity} 
                controlsRef={controlsRef} 
                enableZoom={enableZoom}
                performanceMode={performanceMode}
              />
            </Suspense>
          </Canvas>
          
          {/* Environment indicators */}
          <div className="absolute top-16 right-3 glass-card p-3 space-y-2 z-10">
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
        </>
      )}
    </Fullscreen3DWrapper>
  );
};

export default VirtualField3D;
