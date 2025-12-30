import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Eye, 
  Compass, 
  ArrowUp,
  Info,
  X
} from 'lucide-react';

interface CameraPreset {
  name: string;
  icon: React.ReactNode;
  position: [number, number, number];
  target: [number, number, number];
}

interface Fullscreen3DWrapperProps {
  children: (props: { 
    isFullscreen: boolean; 
    enableZoom: boolean;
    controlsRef: React.RefObject<any>;
    onCameraChange?: () => void;
  }) => React.ReactNode;
  title?: string;
  defaultCameraPosition?: [number, number, number];
  defaultTarget?: [number, number, number];
  className?: string;
}

const Fullscreen3DWrapper: React.FC<Fullscreen3DWrapperProps> = ({
  children,
  title = '3D View',
  defaultCameraPosition = [5, 4, 5],
  defaultTarget = [0, 0, 0],
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cameraInfo, setCameraInfo] = useState({ distance: 0, azimuth: 0, polar: 0 });

  const presets: CameraPreset[] = [
    { 
      name: 'Isometric', 
      icon: <Eye className="w-3 h-3" />,
      position: defaultCameraPosition,
      target: defaultTarget
    },
    { 
      name: 'Top', 
      icon: <ArrowUp className="w-3 h-3" />,
      position: [0, Math.max(...defaultCameraPosition) * 1.5, 0.01],
      target: defaultTarget
    },
    { 
      name: 'Front', 
      icon: <Compass className="w-3 h-3" />,
      position: [0, defaultCameraPosition[1] * 0.5, Math.max(...defaultCameraPosition) * 1.2],
      target: defaultTarget
    },
    { 
      name: 'Side', 
      icon: <Compass className="w-3 h-3 rotate-90" />,
      position: [Math.max(...defaultCameraPosition) * 1.2, defaultCameraPosition[1] * 0.5, 0],
      target: defaultTarget
    },
  ];

  const updateCameraInfo = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const distance = controls.getDistance?.() || 
        controls.object?.position?.distanceTo?.(controls.target) || 0;
      const azimuth = controls.getAzimuthalAngle?.() || 0;
      const polar = controls.getPolarAngle?.() || 0;
      
      setCameraInfo({
        distance: Math.round(distance * 10) / 10,
        azimuth: Math.round((azimuth * 180 / Math.PI) % 360),
        polar: Math.round(polar * 180 / Math.PI),
      });
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(document.fullscreenElement === containerRef.current);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleFullscreenChange]);

  useEffect(() => {
    if (isFullscreen) {
      const interval = setInterval(updateCameraInfo, 100);
      return () => clearInterval(interval);
    }
  }, [isFullscreen, updateCameraInfo]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(...defaultCameraPosition);
      controlsRef.current.target.set(...defaultTarget);
      controlsRef.current.update();
      updateCameraInfo();
    }
  };

  const handlePresetView = (preset: CameraPreset) => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(...preset.position);
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.update();
      updateCameraInfo();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] rounded-xl overflow-hidden ${isFullscreen ? 'bg-background' : ''} ${className}`}
    >
      {/* Canvas Content */}
      {children({ 
        isFullscreen, 
        enableZoom: isFullscreen,
        controlsRef,
        onCameraChange: updateCameraInfo,
      })}
      
      {/* Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Fullscreen Expanded Controls */}
      {isFullscreen && (
        <>
          {/* Title */}
          <div className="absolute top-3 left-3 glass-card px-4 py-2 z-10">
            <h3 className="font-display font-bold text-lg">{title}</h3>
          </div>

          {/* View Presets */}
          <div className="absolute top-16 right-3 flex flex-col gap-1 z-10">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetView(preset)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors text-sm"
                title={preset.name}
              >
                {preset.icon}
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Camera HUD */}
          <div className="absolute bottom-3 left-3 glass-card px-4 py-3 z-10">
            <div className="text-xs text-muted-foreground mb-1">Camera</div>
            <div className="flex gap-4 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">Dist:</span>{' '}
                <span className="text-foreground">{cameraInfo.distance}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Az:</span>{' '}
                <span className="text-foreground">{cameraInfo.azimuth}°</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pol:</span>{' '}
                <span className="text-foreground">{cameraInfo.polar}°</span>
              </div>
            </div>
          </div>

          {/* Help Toggle */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors z-10"
            title="Toggle Help"
          >
            {showHelp ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          </button>

          {/* Help Panel */}
          {showHelp && (
            <div className="absolute bottom-16 right-3 glass-card px-4 py-3 w-64 z-10">
              <h4 className="font-bold mb-2">Controls</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Drag</strong> — Rotate view</li>
                <li>• <strong>Right-drag</strong> — Pan view</li>
                <li>• <strong>Scroll</strong> — Zoom in/out</li>
                <li>• <strong>Presets</strong> — Quick camera angles</li>
                <li>• <strong>Esc</strong> — Exit fullscreen</li>
              </ul>
            </div>
          )}

          {/* Zoom enabled indicator */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 glass-card px-3 py-1 text-xs text-muted-foreground z-10">
            Scroll to zoom enabled
          </div>
        </>
      )}
    </div>
  );
};

export default Fullscreen3DWrapper;
