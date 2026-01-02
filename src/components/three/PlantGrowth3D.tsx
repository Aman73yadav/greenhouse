import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

interface PlantProps {
  growthStage: number;
  plantType: 'tomato' | 'lettuce' | 'pepper' | 'cucumber';
  position: [number, number, number];
}

const Plant: React.FC<PlantProps> = ({ growthStage, plantType, position }) => {
  const plantRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);
  
  const stemHeight = useMemo(() => 0.1 + (growthStage / 100) * 1.5, [growthStage]);
  const leafScale = useMemo(() => 0.2 + (growthStage / 100) * 0.8, [growthStage]);
  
  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf, i) => {
        leaf.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.05;
      });
    }
  });

  const getPlantColor = () => {
    switch (plantType) {
      case 'tomato': return '#228B22';
      case 'lettuce': return '#90EE90';
      case 'pepper': return '#2E8B57';
      case 'cucumber': return '#32CD32';
      default: return '#228B22';
    }
  };

  const getFruitColor = () => {
    switch (plantType) {
      case 'tomato': return growthStage > 70 ? '#FF6347' : '#90EE90';
      case 'pepper': return growthStage > 70 ? '#FF4500' : '#228B22';
      case 'cucumber': return '#228B22';
      default: return '#228B22';
    }
  };

  const numLeaves = Math.min(8, Math.floor(growthStage / 10) + 2);

  return (
    <group ref={plantRef} position={position}>
      {/* Pot */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.3, 16]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* Soil in pot */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
        <meshStandardMaterial color="#3D2314" roughness={0.9} />
      </mesh>
      
      {/* Stem */}
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.03, stemHeight, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.6} />
      </mesh>
      
      {/* Leaves */}
      <group ref={leavesRef} position={[0, stemHeight * 0.3, 0]}>
        {[...Array(numLeaves)].map((_, i) => {
          const angle = (i / numLeaves) * Math.PI * 2;
          const height = (i / numLeaves) * stemHeight * 0.6;
          return (
            <group key={i} position={[0, height, 0]} rotation={[0, angle, Math.PI / 6]}>
              <mesh position={[0.15 * leafScale, 0, 0]} rotation={[0, 0, -0.3]}>
                <sphereGeometry args={[0.1 * leafScale, 8, 4]} />
                <meshStandardMaterial 
                  color={getPlantColor()} 
                  roughness={0.6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* Fruits (if mature enough) */}
      {growthStage > 50 && (plantType === 'tomato' || plantType === 'pepper') && (
        <group position={[0, stemHeight * 0.7, 0]}>
          {[...Array(Math.floor((growthStage - 50) / 15))].map((_, i) => {
            const angle = (i / 3) * Math.PI * 2 + Math.random();
            return (
              <mesh 
                key={i} 
                position={[
                  Math.cos(angle) * 0.15,
                  -0.1 - i * 0.08,
                  Math.sin(angle) * 0.15
                ]}
              >
                <sphereGeometry args={[0.05 + (growthStage - 50) * 0.001, 8, 8]} />
                <meshStandardMaterial color={getFruitColor()} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      )}
      
      {/* Lettuce leaves */}
      {plantType === 'lettuce' && growthStage > 20 && (
        <group position={[0, 0.1, 0]}>
          {[...Array(Math.floor(growthStage / 8))].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const tilt = 0.2 + (i * 0.05);
            return (
              <mesh 
                key={i} 
                position={[Math.cos(angle) * 0.1, i * 0.02, Math.sin(angle) * 0.1]}
                rotation={[tilt, angle, 0]}
              >
                <planeGeometry args={[0.15, 0.2]} />
                <meshStandardMaterial 
                  color="#90EE90" 
                  roughness={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

const PlantScene: React.FC<{ 
  plants: { type: 'tomato' | 'lettuce' | 'pepper' | 'cucumber'; growthStage: number }[]; 
  controlsRef: React.RefObject<any>; 
  enableZoom: boolean;
  performanceMode: boolean;
}> = ({ plants, controlsRef, enableZoom, performanceMode }) => {
  return (
    <>
      <ambientLight intensity={performanceMode ? 0.7 : 0.5} />
      {!performanceMode && (
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      )}
      {performanceMode && (
        <directionalLight position={[5, 10, 5]} intensity={0.7} />
      )}
      {!performanceMode && (
        <pointLight position={[-3, 5, -3]} intensity={0.3} color="#FFD700" />
      )}
      
      {/* Growing table */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#4A4A4A" roughness={0.8} />
      </mesh>
      
      {/* Show fewer plants in performance mode */}
      {(performanceMode ? plants.slice(0, 3) : plants).map((plant, i) => (
        <Plant
          key={i}
          plantType={plant.type}
          growthStage={plant.growthStage}
          position={[(i % 3 - 1) * 1.5, 0, Math.floor(i / 3) * 1.2 - 0.5]}
        />
      ))}
      
      {/* Grow lights - skip in performance mode */}
      {!performanceMode && (
        <group position={[0, 2, 0]}>
          {[-1.5, 0, 1.5].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.8, 0.1, 0.3]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <pointLight position={[0, -0.2, 0]} intensity={0.5} color="#FF69B4" distance={3} />
            </group>
          ))}
        </group>
      )}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={enableZoom}
        enableRotate={true}
        minDistance={3}
        maxDistance={12}
      />
    </>
  );
};

interface PlantGrowth3DProps {
  plants?: { type: 'tomato' | 'lettuce' | 'pepper' | 'cucumber'; growthStage: number }[];
}

const DEFAULT_CAMERA_POSITION: [number, number, number] = [4, 3, 4];
const DEFAULT_TARGET: [number, number, number] = [0, 0, 0];

const PlantGrowth3D: React.FC<PlantGrowth3DProps> = ({ 
  plants = [
    { type: 'tomato', growthStage: 75 },
    { type: 'lettuce', growthStage: 60 },
    { type: 'pepper', growthStage: 85 },
    { type: 'cucumber', growthStage: 45 },
    { type: 'tomato', growthStage: 30 },
    { type: 'lettuce', growthStage: 90 },
  ] 
}) => {
  return (
    <Fullscreen3DWrapper
      title="Plant Growth Process"
      defaultCameraPosition={DEFAULT_CAMERA_POSITION}
      defaultTarget={DEFAULT_TARGET}
      className="bg-gradient-to-b from-gray-800 to-gray-900"
    >
      {({ enableZoom, controlsRef, sceneRef, performanceMode }) => (
        <Canvas camera={{ position: DEFAULT_CAMERA_POSITION, fov: 50 }}>
          <SceneCapture sceneRef={sceneRef} />
          <PlantScene plants={plants} controlsRef={controlsRef} enableZoom={enableZoom} performanceMode={performanceMode} />
        </Canvas>
      )}
    </Fullscreen3DWrapper>
  );
};

export default PlantGrowth3D;
