import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  Compass,
  ArrowUp,
  Info,
  X,
  Lock,
  Unlock,
  Focus,
  Zap,
  Sparkles,
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
    sceneRef: React.RefObject<THREE.Scene | null>;
    onCameraChange?: () => void;
    performanceMode: boolean;
  }) => React.ReactNode;
  title?: string;
  defaultCameraPosition?: [number, number, number];
  defaultTarget?: [number, number, number];
  className?: string;
  /** Fallback radius if scene bounds can't be computed */
  sceneRadius?: number;
}

const Fullscreen3DWrapper: React.FC<Fullscreen3DWrapperProps> = ({
  children,
  title = '3D View',
  defaultCameraPosition = [5, 4, 5],
  defaultTarget = [0, 0, 0],
  className = '',
  sceneRadius = 5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isZoomLocked, setIsZoomLocked] = useState(false);
  const [zoomOutsideFullscreen, setZoomOutsideFullscreen] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [cameraInfo, setCameraInfo] = useState({ distance: 0, azimuth: 0, polar: 0 });
  const prevFullscreenRef = useRef(false);

  const presets: CameraPreset[] = [
    {
      name: 'Isometric',
      icon: <Eye className="w-3 h-3" />,
      position: defaultCameraPosition,
      target: defaultTarget,
    },
    {
      name: 'Top',
      icon: <ArrowUp className="w-3 h-3" />,
      position: [0, Math.max(...defaultCameraPosition) * 1.5, 0.01],
      target: defaultTarget,
    },
    {
      name: 'Front',
      icon: <Compass className="w-3 h-3" />,
      position: [0, defaultCameraPosition[1] * 0.5, Math.max(...defaultCameraPosition) * 1.2],
      target: defaultTarget,
    },
    {
      name: 'Side',
      icon: <Compass className="w-3 h-3 rotate-90" />,
      position: [Math.max(...defaultCameraPosition) * 1.2, defaultCameraPosition[1] * 0.5, 0],
      target: defaultTarget,
    },
  ];

  const updateCameraInfo = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const distance =
        controls.getDistance?.() || controls.object?.position?.distanceTo?.(controls.target) || 0;
      const azimuth = controls.getAzimuthalAngle?.() || 0;
      const polar = controls.getPolarAngle?.() || 0;

      setCameraInfo({
        distance: Math.round(distance * 10) / 10,
        azimuth: Math.round((azimuth * 180) / Math.PI) % 360,
        polar: Math.round((polar * 180) / Math.PI),
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

  const handleResetView = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(...defaultCameraPosition);
      controlsRef.current.target.set(...defaultTarget);
      controlsRef.current.update();
      updateCameraInfo();
    }
  }, [defaultCameraPosition, defaultTarget, updateCameraInfo]);

  // Prevent "stuck zoom" when leaving fullscreen (zoom is disabled outside fullscreen)
  useEffect(() => {
    const wasFullscreen = prevFullscreenRef.current;
    prevFullscreenRef.current = isFullscreen;

    if (wasFullscreen && !isFullscreen) {
      handleResetView();
    }
  }, [isFullscreen, handleResetView]);

  const handlePresetView = (preset: CameraPreset) => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(...preset.position);
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.update();
      updateCameraInfo();
    }
  };

  const handleFitToScene = () => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const camera = controls.object;
    const target = controls.target;

    let computedRadius = sceneRadius;

    // Try to compute bounding sphere from actual scene objects
    if (sceneRef.current) {
      const box = new THREE.Box3();
      sceneRef.current.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          box.expandByObject(obj);
        }
      });

      if (!box.isEmpty()) {
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        computedRadius = sphere.radius;
        // Update target to center of bounding sphere for better framing
        target.copy(sphere.center);
      }
    }

    // Calculate distance needed to fit the scene in the current FOV
    const fov = (camera.fov * Math.PI) / 180;
    const rawFitDistance = computedRadius / Math.sin(fov / 2);

    // Clamp to OrbitControls min/max to avoid accidental "mega zoom"
    const minD = typeof controls.minDistance === 'number' ? controls.minDistance : 0;
    const maxD = typeof controls.maxDistance === 'number' ? controls.maxDistance : Infinity;
    const fitDistance = Math.min(maxD, Math.max(minD, rawFitDistance * 1.1));

    const direction = camera.position.clone().sub(target).normalize();
    camera.position.copy(target.clone().add(direction.multiplyScalar(fitDistance)));

    controls.update();
    updateCameraInfo();
  };

  const toggleZoomLock = () => {
    setIsZoomLocked(!isZoomLocked);
  };

  const togglePerformanceMode = () => {
    setPerformanceMode(!performanceMode);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when in fullscreen
      if (!isFullscreen) return;

      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          toggleFullscreen();
          break;
        case 'r':
          handleResetView();
          break;
        case '1':
          if (presets[0]) handlePresetView(presets[0]);
          break;
        case '2':
          if (presets[1]) handlePresetView(presets[1]);
          break;
        case '3':
          if (presets[2]) handlePresetView(presets[2]);
          break;
        case '4':
          if (presets[3]) handlePresetView(presets[3]);
          break;
        case 'p':
          togglePerformanceMode();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, presets, handleResetView]);

  // Determine if zoom should be enabled
  const zoomEnabled = (isFullscreen || zoomOutsideFullscreen) && !isZoomLocked;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] rounded-xl overflow-hidden ${isFullscreen ? 'bg-background' : ''} ${className}`}
    >
      {/* Canvas Content */}
      {children({ 
        isFullscreen, 
        enableZoom: zoomEnabled,
        controlsRef,
        sceneRef,
        onCameraChange: updateCameraInfo,
        performanceMode,
      })}
      
      {/* Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {/* Performance Mode Toggle */}
        <button
          onClick={togglePerformanceMode}
          className={`p-2 rounded-lg backdrop-blur-sm border transition-colors ${
            performanceMode 
              ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30' 
              : 'bg-background/80 border-glass-border hover:bg-background'
          }`}
          title={performanceMode ? 'Switch to Quality Mode (P)' : 'Switch to Performance Mode (P)'}
        >
          {performanceMode ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </button>
        
        {/* Fit to Scene */}
        <button
          onClick={handleFitToScene}
          className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors"
          title="Fit to Scene"
        >
          <Focus className="w-4 h-4" />
        </button>
        
        {/* Enable Zoom Outside Fullscreen Toggle (only show when not in fullscreen) */}
        {!isFullscreen && (
          <button
            onClick={() => setZoomOutsideFullscreen(!zoomOutsideFullscreen)}
            className={`p-2 rounded-lg backdrop-blur-sm border transition-colors ${
              zoomOutsideFullscreen
                ? 'bg-accent/20 border-accent/50 text-accent-foreground hover:bg-accent/30'
                : 'bg-background/80 border-glass-border hover:bg-background'
            }`}
            title={zoomOutsideFullscreen ? 'Disable Scroll Zoom' : 'Enable Scroll Zoom'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        )}

        {/* Zoom Lock Toggle */}
        <button
          onClick={toggleZoomLock}
          className={`p-2 rounded-lg backdrop-blur-sm border transition-colors ${
            isZoomLocked
              ? 'bg-destructive/20 border-destructive/50 text-destructive hover:bg-destructive/30'
              : 'bg-background/80 border-glass-border hover:bg-background'
          }`}
          title={isZoomLocked ? 'Unlock Zoom' : 'Lock Zoom'}
        >
          {isZoomLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
        
        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors"
          title="Reset View (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors"
          title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
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
            {presets.map((preset, index) => (
              <button
                key={preset.name}
                onClick={() => handlePresetView(preset)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-glass-border hover:bg-background transition-colors text-sm"
                title={`${preset.name} (${index + 1})`}
              >
                {preset.icon}
                <span>{preset.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{index + 1}</span>
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
            <div className="absolute bottom-16 right-3 glass-card px-4 py-3 w-72 z-10">
              <h4 className="font-bold mb-2">Controls</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Drag</strong> — Rotate view</li>
                <li>• <strong>Right-drag</strong> — Pan view</li>
                <li>• <strong>Scroll</strong> — Zoom in/out</li>
              </ul>
              <h4 className="font-bold mt-3 mb-2">Keyboard Shortcuts</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">F</kbd> — Toggle fullscreen</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">R</kbd> — Reset view</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">P</kbd> — Toggle performance mode</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">1-4</kbd> — View presets</li>
                <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> — Exit fullscreen</li>
              </ul>
            </div>
          )}

          {/* Status indicators */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {performanceMode && (
              <div className="glass-card px-3 py-1 text-xs text-primary flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Performance Mode
              </div>
            )}
            <div className={`glass-card px-3 py-1 text-xs ${
              isZoomLocked ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {isZoomLocked ? 'Zoom locked' : 'Scroll to zoom enabled'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Fullscreen3DWrapper;