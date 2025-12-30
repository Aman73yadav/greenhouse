import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Fullscreen3DWrapper from './Fullscreen3DWrapper';

interface WaterDropletProps {
  startPosition: [number, number, number];
  delay: number;
  active: boolean;
}

const WaterDroplet: React.FC<WaterDropletProps> = ({ startPosition, delay, active }) => {
  const dropletRef = useRef<THREE.Mesh>(null);
  const initialY = startPosition[1];
  
  useFrame((state) => {
    if (dropletRef.current && active) {
      const time = (state.clock.elapsedTime + delay) % 2;
      dropletRef.current.position.y = initialY - time * 1.5;
      dropletRef.current.visible = time < 1.5;
      
      // Scale effect as it falls
      const scale = 1 - time * 0.3;
      dropletRef.current.scale.set(scale, scale, scale);
    } else if (dropletRef.current) {
      dropletRef.current.visible = false;
    }
  });

  return (
    <mesh ref={dropletRef} position={startPosition}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial 
        color="#4FC3F7" 
        transparent 
        opacity={0.8}
        metalness={0.3}
        roughness={0.1}
      />
    </mesh>
  );
};

interface SprinklerHeadProps {
  position: [number, number, number];
  active: boolean;
}

const SprinklerHead: React.FC<SprinklerHeadProps> = ({ position, active }) => {
  const sprinklerRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (sprinklerRef.current && active) {
      sprinklerRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const droplets = useMemo(() => {
    const drops: { position: [number, number, number]; delay: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.2;
      drops.push({
        position: [
          position[0] + Math.cos(angle) * radius,
          position[1] - 0.1,
          position[2] + Math.sin(angle) * radius,
        ],
        delay: i * 0.15,
      });
    }
    return drops;
  }, [position]);

  return (
    <group position={position}>
      {/* Sprinkler base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Rotating head */}
      <group ref={sprinklerRef}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Spray nozzles */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.04, 0.08, Math.sin(angle) * 0.04]} rotation={[Math.PI / 4, 0, angle]}>
            <coneGeometry args={[0.01, 0.02, 4]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        ))}
      </group>
      
      {/* Water droplets */}
      {droplets.map((drop, i) => (
        <WaterDroplet key={i} startPosition={drop.position} delay={drop.delay} active={active} />
      ))}
    </group>
  );
};

interface DripLineProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  active: boolean;
}

const DripLine: React.FC<DripLineProps> = ({ startPos, endPos, active }) => {
  const droplets = useMemo(() => {
    const drops: { position: [number, number, number]; delay: number }[] = [];
    const numDrops = 5;
    for (let i = 0; i < numDrops; i++) {
      const t = (i + 1) / (numDrops + 1);
      drops.push({
        position: [
          startPos[0] + (endPos[0] - startPos[0]) * t,
          startPos[1],
          startPos[2] + (endPos[2] - startPos[2]) * t,
        ],
        delay: i * 0.4,
      });
    }
    return drops;
  }, [startPos, endPos]);

  return (
    <group>
      {/* Pipe */}
      <mesh position={[(startPos[0] + endPos[0]) / 2, startPos[1], (startPos[2] + endPos[2]) / 2]}>
        <boxGeometry args={[Math.abs(endPos[0] - startPos[0]) || 0.02, 0.02, Math.abs(endPos[2] - startPos[2]) || 0.02]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>
      
      {/* Drip emitters */}
      {droplets.map((drop, i) => (
        <group key={i}>
          <mesh position={drop.position}>
            <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <WaterDroplet startPosition={[drop.position[0], drop.position[1] - 0.02, drop.position[2]]} delay={drop.delay} active={active} />
        </group>
      ))}
    </group>
  );
};

const IrrigationScene: React.FC<{ irrigationActive: boolean; mistingActive: boolean; controlsRef: React.RefObject<any>; enableZoom: boolean }> = ({ irrigationActive, mistingActive, controlsRef, enableZoom }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#87CEEB" />
      
      {/* Ground/soil bed */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#3D2314" roughness={0.9} />
      </mesh>
      
      {/* Raised beds */}
      {[-1.5, 1.5].map((z, i) => (
        <mesh key={i} position={[0, -0.3, z]}>
          <boxGeometry args={[5, 0.4, 1.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      ))}
      
      {/* Plants in beds */}
      {[-1.5, 1.5].map((z, zi) => (
        [-2, -1, 0, 1, 2].map((x, xi) => (
          <group key={`${zi}-${xi}`} position={[x, 0, z]}>
            {/* Simple plant representation */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#32CD32" />
            </mesh>
          </group>
        ))
      ))}
      
      {/* Main water pipe */}
      <mesh position={[-2.8, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 4, 16]} />
        <meshStandardMaterial color="#1E90FF" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Drip lines */}
      <DripLine startPos={[-2.5, 0, -1.5]} endPos={[2.5, 0, -1.5]} active={irrigationActive} />
      <DripLine startPos={[-2.5, 0, 1.5]} endPos={[2.5, 0, 1.5]} active={irrigationActive} />
      
      {/* Sprinkler heads */}
      <SprinklerHead position={[-2, 1.5, 0]} active={mistingActive} />
      <SprinklerHead position={[2, 1.5, 0]} active={mistingActive} />
      
      {/* Water tank */}
      <mesh position={[-3.5, 0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
        <meshStandardMaterial color="#4169E1" metalness={0.2} roughness={0.5} transparent opacity={0.8} />
      </mesh>
      
      {/* Water level indicator */}
      <mesh position={[-3.5, 0.2, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 16]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={enableZoom}
        enableRotate={true}
        minDistance={4}
        maxDistance={15}
      />
    </>
  );
};

interface IrrigationSystem3DProps {
  irrigationActive?: boolean;
  mistingActive?: boolean;
}

const DEFAULT_CAMERA_POSITION: [number, number, number] = [5, 4, 5];
const DEFAULT_TARGET: [number, number, number] = [0, 0, 0];

const IrrigationSystem3D: React.FC<IrrigationSystem3DProps> = ({ 
  irrigationActive = true, 
  mistingActive = false 
}) => {
  return (
    <Fullscreen3DWrapper
      title="Irrigation System"
      defaultCameraPosition={DEFAULT_CAMERA_POSITION}
      defaultTarget={DEFAULT_TARGET}
      className="bg-gradient-to-b from-sky-300 to-sky-100"
    >
      {({ enableZoom, controlsRef }) => (
        <Canvas camera={{ position: DEFAULT_CAMERA_POSITION, fov: 50 }}>
          <IrrigationScene irrigationActive={irrigationActive} mistingActive={mistingActive} controlsRef={controlsRef} enableZoom={enableZoom} />
        </Canvas>
      )}
    </Fullscreen3DWrapper>
  );
};

export default IrrigationSystem3D;
