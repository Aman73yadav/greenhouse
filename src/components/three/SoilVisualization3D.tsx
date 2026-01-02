import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
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

interface SoilLayerProps {
  position: [number, number, number];
  color: string;
  height: number;
  label: string;
  moisture: number;
}

const SoilLayer: React.FC<SoilLayerProps> = ({ position, color, height, label, moisture }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const moistureColor = useMemo(() => {
    const baseColor = new THREE.Color(color);
    const darkColor = baseColor.clone().multiplyScalar(0.6);
    return baseColor.lerp(darkColor, moisture / 100);
  }, [color, moisture]);

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[4, height, 4]} />
        <meshStandardMaterial 
          color={moistureColor} 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      <Text
        position={[2.5, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="left"
      >
        {label}
      </Text>
    </group>
  );
};

interface RootSystemProps {
  growthStage: number;
}

const RootSystem: React.FC<RootSystemProps> = ({ growthStage }) => {
  const rootsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (rootsRef.current) {
      rootsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.scale.y = 0.5 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
      });
    }
  });

  const roots = useMemo(() => {
    const rootPaths: { position: [number, number, number]; rotation: [number, number, number]; length: number }[] = [];
    const numRoots = Math.floor(5 + growthStage * 0.1);
    
    for (let i = 0; i < numRoots; i++) {
      const angle = (i / numRoots) * Math.PI * 2;
      const depth = -0.5 - Math.random() * growthStage * 0.02;
      rootPaths.push({
        position: [Math.cos(angle) * 0.3, depth, Math.sin(angle) * 0.3],
        rotation: [Math.random() * 0.5, angle, Math.random() * 0.5],
        length: 0.3 + growthStage * 0.01,
      });
    }
    return rootPaths;
  }, [growthStage]);

  return (
    <group ref={rootsRef}>
      {roots.map((root, i) => (
        <mesh key={i} position={root.position} rotation={root.rotation}>
          <cylinderGeometry args={[0.02, 0.01, root.length, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

interface WormProps {
  position: [number, number, number];
}

const Worm: React.FC<WormProps> = ({ position }) => {
  const wormRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (wormRef.current) {
      wormRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      wormRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  return (
    <group ref={wormRef} position={position}>
      {[0, 0.05, 0.1, 0.15, 0.2].map((offset, i) => (
        <mesh key={i} position={[offset, 0, 0]}>
          <sphereGeometry args={[0.03 - i * 0.005, 8, 8]} />
          <meshStandardMaterial color="#CD853F" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

const SoilScene: React.FC<{ 
  moisture: number; 
  growthStage: number; 
  controlsRef: React.RefObject<any>; 
  enableZoom: boolean;
  performanceMode: boolean;
}> = ({ moisture, growthStage, controlsRef, enableZoom, performanceMode }) => {
  const soilLayers = [
    { y: 0.6, color: '#228B22', height: 0.2, label: 'Organic Matter' },
    { y: 0.3, color: '#3D2314', height: 0.4, label: 'Topsoil (A Horizon)' },
    { y: -0.2, color: '#8B4513', height: 0.6, label: 'Subsoil (B Horizon)' },
    { y: -0.8, color: '#A0522D', height: 0.6, label: 'Parent Material (C)' },
    { y: -1.4, color: '#696969', height: 0.6, label: 'Bedrock (R Horizon)' },
  ];

  return (
    <>
      <ambientLight intensity={performanceMode ? 0.6 : 0.4} />
      {!performanceMode && (
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      )}
      {performanceMode && (
        <directionalLight position={[5, 10, 5]} intensity={0.7} />
      )}
      {!performanceMode && (
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#FFE4B5" />
      )}
      
      {soilLayers.map((layer, i) => (
        <SoilLayer
          key={i}
          position={[0, layer.y, 0]}
          color={layer.color}
          height={layer.height}
          label={layer.label}
          moisture={moisture}
        />
      ))}
      
      <RootSystem growthStage={growthStage} />
      
      {/* Worms - skip in performance mode */}
      {!performanceMode && (
        <>
          <Worm position={[0.5, 0.1, 0.5]} />
          <Worm position={[-0.3, -0.3, -0.2]} />
        </>
      )}
      
      {/* Water droplets - skip in performance mode */}
      {!performanceMode && moisture > 50 && (
        <group>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[Math.random() * 2 - 1, 0.5 + Math.random() * 0.3, Math.random() * 2 - 1]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#4FC3F7" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      )}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true} 
        enableZoom={enableZoom} 
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
      />
    </>
  );
};

interface SoilVisualization3DProps {
  moisture: number;
  growthStage: number;
}

const DEFAULT_CAMERA_POSITION: [number, number, number] = [5, 3, 5];
const DEFAULT_TARGET: [number, number, number] = [0, 0, 0];

const SoilVisualization3D: React.FC<SoilVisualization3DProps> = ({ moisture, growthStage }) => {
  return (
    <Fullscreen3DWrapper
      title="Soil Layers & Root System"
      defaultCameraPosition={DEFAULT_CAMERA_POSITION}
      defaultTarget={DEFAULT_TARGET}
      className="bg-gradient-to-b from-sky-200 to-amber-100"
    >
      {({ enableZoom, controlsRef, sceneRef, performanceMode }) => (
        <Canvas camera={{ position: DEFAULT_CAMERA_POSITION, fov: 50 }}>
          <SceneCapture sceneRef={sceneRef} />
          <SoilScene
            moisture={moisture} 
            growthStage={growthStage} 
            controlsRef={controlsRef} 
            enableZoom={enableZoom}
            performanceMode={performanceMode}
          />
        </Canvas>
      )}
    </Fullscreen3DWrapper>
  );
};

export default SoilVisualization3D;
