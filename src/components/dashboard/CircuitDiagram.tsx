import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, RotateCcw, Play, Pause, Square, Thermometer, Droplets, Leaf, Sun, TreePine, Waves, Mountain, Flower2, ClipboardList, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SensorData } from '@/types/greenhouse';

interface CircuitDiagramProps {
  sensorData: SensorData[];
  onSensorUpdate?: (type: string, value: number) => void;
}

type SimState = 'running' | 'paused' | 'stopped';

interface LogEntry {
  id: number;
  timestamp: Date;
  sensor: string;
  oldValue: number;
  newValue: number;
  source: 'manual' | 'preset';
  preset?: string;
}

const PRESETS = {
  tropical: { label: '🌴 Tropical', temp: 32, hum: 85, soil: 75, light: 70, desc: 'Hot & humid rainforest' },
  arid: { label: '🏜️ Arid', temp: 40, hum: 15, soil: 10, light: 95, desc: 'Dry desert conditions' },
  temperate: { label: '🌿 Temperate', temp: 22, hum: 55, soil: 50, light: 60, desc: 'Mild balanced climate' },
  arctic: { label: '❄️ Arctic', temp: 5, hum: 70, soil: 30, light: 20, desc: 'Cold low-light conditions' },
  greenhouse: { label: '🏡 Greenhouse', temp: 26, hum: 65, soil: 60, light: 80, desc: 'Optimal growing environment' },
};

const CircuitDiagram = ({ sensorData, onSensorUpdate }: CircuitDiagramProps) => {
  const [simState, setSimState] = useState<SimState>('running');
  const [elapsed, setElapsed] = useState(0);
  const [ledOn, setLedOn] = useState(false);
  const [simValues, setSimValues] = useState({ temp: 24, hum: 40, soil: 100, light: 75 });
  const [manualMode, setManualMode] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const temp = simState !== 'stopped' ? simValues.temp : (sensorData.find(s => s.type === 'temperature')?.value ?? 24);
  const hum = simState !== 'stopped' ? simValues.hum : (sensorData.find(s => s.type === 'humidity')?.value ?? 40);
  const soil = simState !== 'stopped' ? simValues.soil : (sensorData.find(s => s.type === 'moisture')?.value ?? 100);
  const light = simState !== 'stopped' ? simValues.light : (sensorData.find(s => s.type === 'light')?.value ?? 75);

  const line1 = `T:${temp.toFixed(2)}C H:${hum.toFixed(2)}`;
  const line2 = `S:${soil.toFixed(0)}%  L:${light.toFixed(0)}%`;

  const pushValues = useCallback((vals: typeof simValues) => {
    if (onSensorUpdate) {
      onSensorUpdate('temperature', vals.temp);
      onSensorUpdate('humidity', vals.hum);
      onSensorUpdate('moisture', vals.soil);
      onSensorUpdate('light', vals.light);
    }
  }, [onSensorUpdate]);

  const addLogEntry = useCallback((sensor: string, oldVal: number, newVal: number, source: 'manual' | 'preset', preset?: string) => {
    logIdRef.current += 1;
    setLog(prev => [{ id: logIdRef.current, timestamp: new Date(), sensor, oldValue: oldVal, newValue: newVal, source, preset }, ...prev].slice(0, 200));
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (simState === 'running' && !manualMode) {
      intervalRef.current = setInterval(() => {
        setElapsed(p => p + 500);
        setLedOn(p => !p);
        setSimValues(prev => {
          const vals = {
            temp: Math.max(10, Math.min(45, prev.temp + (Math.random() - 0.48) * 0.3)),
            hum: Math.max(20, Math.min(95, prev.hum + (Math.random() - 0.48) * 0.5)),
            soil: Math.max(0, Math.min(100, prev.soil + (Math.random() - 0.52) * 0.4)),
            light: Math.max(0, Math.min(100, prev.light + (Math.random() - 0.5) * 0.6)),
          };
          pushValues(vals);
          return vals;
        });
      }, 500);
    } else if (simState === 'running' && manualMode) {
      intervalRef.current = setInterval(() => {
        setElapsed(p => p + 500);
        setLedOn(p => !p);
      }, 500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [simState, manualMode, pushValues]);

  const handleSliderChange = useCallback((key: string, label: string, value: number) => {
    setSimValues(prev => {
      addLogEntry(label, prev[key as keyof typeof prev], value, 'manual');
      const updated = { ...prev, [key]: value };
      pushValues(updated);
      return updated;
    });
  }, [pushValues, addLogEntry]);

  const applyPreset = useCallback((name: string) => {
    const p = PRESETS[name as keyof typeof PRESETS];
    if (!p) return;
    setSimValues(prev => {
      if (prev.temp !== p.temp) addLogEntry('Temperature', prev.temp, p.temp, 'preset', p.label);
      if (prev.hum !== p.hum) addLogEntry('Humidity', prev.hum, p.hum, 'preset', p.label);
      if (prev.soil !== p.soil) addLogEntry('Soil Moisture', prev.soil, p.soil, 'preset', p.label);
      if (prev.light !== p.light) addLogEntry('Light', prev.light, p.light, 'preset', p.label);
      const vals = { temp: p.temp, hum: p.hum, soil: p.soil, light: p.light };
      pushValues(vals);
      return vals;
    });
    if (simState === 'stopped') setSimState('running');
    setManualMode(true);
  }, [pushValues, addLogEntry, simState]);

  const exportLog = useCallback(() => {
    const csv = ['Timestamp,Sensor,Old Value,New Value,Source,Preset',
      ...log.map(e => `${e.timestamp.toISOString()},${e.sensor},${e.oldValue.toFixed(2)},${e.newValue.toFixed(2)},${e.source},${e.preset || ''}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sensor-log-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [log]);

  const handleRestart = useCallback(() => { setElapsed(0); setSimValues({ temp: 24, hum: 40, soil: 100, light: 75 }); setSimState('running'); }, []);
  const handlePause = useCallback(() => { setSimState(s => s === 'paused' ? 'running' : 'paused'); }, []);
  const handleStop = useCallback(() => { setSimState('stopped'); setLedOn(false); }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const sec = (totalSec % 60).toString().padStart(3, '0');
    const millis = (ms % 1000).toString().padStart(3, '0');
    return `${min}:${sec}.${millis}`;
  };

  const DataDot = ({ path, color, delay = 0 }: { path: string; color: string; delay?: number }) => (
    simState === 'running' ? (
      <circle r="3.5" fill={color} opacity="0.9">
        <animateMotion dur="2s" repeatCount="indefinite" begin={`${delay}s`} path={path} />
      </circle>
    ) : null
  );

  const sliders = [
    { key: 'temp', label: 'Temperature', icon: Thermometer, unit: '°C', min: 0, max: 50, step: 0.1, color: 'text-temperature', value: simValues.temp },
    { key: 'hum', label: 'Humidity', icon: Droplets, unit: '%', min: 0, max: 100, step: 1, color: 'text-humidity', value: simValues.hum },
    { key: 'soil', label: 'Soil Moisture', icon: Leaf, unit: '%', min: 0, max: 100, step: 1, color: 'text-moisture', value: simValues.soil },
    { key: 'light', label: 'Light', icon: Sun, unit: '%', min: 0, max: 100, step: 1, color: 'text-light', value: simValues.light },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold">Wokwi Circuit Simulator</h3>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between mb-4 bg-muted/50 rounded-lg px-3 py-2 border border-border flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground mr-2 border border-border rounded px-2 py-0.5 bg-background">Simulation</span>
          <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-full ${simState === 'running' ? 'bg-success/20 text-success' : 'text-muted-foreground'}`} onClick={handleRestart} title="Restart"><RotateCcw className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground" onClick={handleStop} title="Stop"><Square className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground" onClick={handlePause} title={simState === 'paused' ? 'Resume' : 'Pause'}>
            {simState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <div className="h-5 w-px bg-border mx-1" />
          <Button variant={manualMode ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setManualMode(m => !m)}>
            {manualMode ? '🎛 Manual' : '🔄 Auto'}
          </Button>
          <Button variant={showLog ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setShowLog(s => !s)}>
            <ClipboardList className="w-3 h-3 mr-1" /> Log {log.length > 0 && `(${log.length})`}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {simState === 'running' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${simState === 'running' ? 'bg-success' : simState === 'paused' ? 'bg-warning' : 'bg-muted-foreground'}`} />
            </span>
            <span className="text-xs text-muted-foreground capitalize">{simState}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">⏱ {formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Environment Presets */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Environment Presets</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, p]) => (
            <Button key={key} variant="outline" size="sm" className="h-8 text-xs hover:bg-primary/10 transition-all" onClick={() => applyPreset(key)} title={p.desc}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Interactive Sensor Sliders */}
      <AnimatePresence>
        {manualMode && simState !== 'stopped' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sliders.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="bg-muted/30 rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${s.color}`} />
                      <span className="text-xs font-medium">{s.label}</span>
                    </div>
                    <span className="text-sm font-mono font-bold">{s.value.toFixed(s.step < 1 ? 1 : 0)}{s.unit}</span>
                  </div>
                  <Slider min={s.min} max={s.max} step={s.step} value={[s.value]} onValueChange={([v]) => handleSliderChange(s.key, s.label, v)} />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Logging Panel */}
      <AnimatePresence>
        {showLog && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
            <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium">📋 Experiment Log</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={exportLog} disabled={log.length === 0}>
                    <Download className="w-3 h-3 mr-1" /> CSV
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => setLog([])} disabled={log.length === 0}>
                    <Trash2 className="w-3 h-3 mr-1" /> Clear
                  </Button>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {log.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">No changes recorded yet. Adjust sliders or apply a preset.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/80">
                      <tr className="border-b border-border">
                        <th className="text-left px-2 py-1 font-medium">Time</th>
                        <th className="text-left px-2 py-1 font-medium">Sensor</th>
                        <th className="text-right px-2 py-1 font-medium">Old</th>
                        <th className="text-right px-2 py-1 font-medium">New</th>
                        <th className="text-left px-2 py-1 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {log.map(e => (
                        <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-2 py-1 font-mono text-muted-foreground">{e.timestamp.toLocaleTimeString()}</td>
                          <td className="px-2 py-1">{e.sensor}</td>
                          <td className="px-2 py-1 text-right font-mono">{e.oldValue.toFixed(1)}</td>
                          <td className="px-2 py-1 text-right font-mono font-bold">{e.newValue.toFixed(1)}</td>
                          <td className="px-2 py-1">
                            {e.source === 'preset' ? (
                              <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5">{e.preset}</span>
                            ) : (
                              <span className="text-muted-foreground">Manual</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circuit SVG */}
      <div className="rounded-xl p-4 border border-border overflow-x-auto" style={{ background: '#d4d4d4' }}>
        <svg viewBox="0 0 960 620" className="w-full h-auto min-w-[700px]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow-red"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="shadow"><feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" /></filter>
            <linearGradient id="boardBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2196F3" /><stop offset="100%" stopColor="#1565C0" /></linearGradient>
            <linearGradient id="lcdGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a8d84a" /><stop offset="100%" stopColor="#7bb832" /></linearGradient>
            <linearGradient id="lcdBezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a6b30" /><stop offset="100%" stopColor="#0e4a1e" /></linearGradient>
          </defs>

          {/* WIRES */}
          <path d="M 140 520 L 140 545 L 40 545 L 40 200 L 175 200" stroke="#E53935" strokeWidth="2.5" fill="none" />
          <path d="M 40 200 L 40 60 L 520 60 L 520 90" stroke="#E53935" strokeWidth="2.5" fill="none" />
          <path d="M 520 60 L 860 60 L 860 380 L 680 380" stroke="#E53935" strokeWidth="2.5" fill="none" />
          <path d="M 860 380 L 860 285 L 620 285" stroke="#E53935" strokeWidth="2.5" fill="none" />
          <path d="M 160 520 L 160 560 L 25 560 L 25 185 L 155 185" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
          <path d="M 25 185 L 25 45 L 490 45 L 490 90" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
          <path d="M 490 45 L 890 45 L 890 400 L 640 400" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
          <path d="M 205 230 L 205 280 L 280 280 L 280 330" stroke="#4CAF50" strokeWidth="2" fill="none" />
          <path d="M 80 165 L 80 100 L 210 100 L 210 330" stroke="#4CAF50" strokeWidth="2" fill="none" />
          <path d="M 440 460 L 440 540 L 270 540 L 270 520" stroke="#4CAF50" strokeWidth="2" fill="none" />
          <path d="M 570 210 L 570 555 L 290 555 L 290 520" stroke="#4CAF50" strokeWidth="2" fill="none" />
          <path d="M 330 520 L 330 570 L 650 570 L 650 400" stroke="#2196F3" strokeWidth="2" fill="none" />
          <path d="M 350 520 L 350 585 L 670 585 L 670 400" stroke="#FF9800" strokeWidth="2" fill="none" />
          <path d="M 590 260 L 590 360 L 660 360 L 660 380" stroke="#9C27B0" strokeWidth="1.5" fill="none" />

          <DataDot path="M 205 230 L 205 280 L 280 280 L 280 330" color="#4CAF50" delay={0} />
          <DataDot path="M 440 460 L 440 540 L 270 540 L 270 520" color="#4CAF50" delay={0.5} />
          <DataDot path="M 570 210 L 570 555 L 290 555 L 290 520" color="#4CAF50" delay={1} />
          <DataDot path="M 330 520 L 330 570 L 650 570 L 650 400" color="#2196F3" delay={1.5} />

          {/* LED + Resistor */}
          <g filter="url(#shadow)">
            <rect x="60" y="110" width="40" height="10" rx="2" fill="#D4B896" stroke="#8B6914" strokeWidth="0.5" />
            {[0,1,2,3].map(i => <line key={`rb${i}`} x1={68+i*8} y1="110" x2={68+i*8} y2="120" stroke={['#A52A2A','#000','#F00','#FFD700'][i]} strokeWidth="2" />)}
            <ellipse cx="80" cy="145" rx="10" ry="16" fill={ledOn ? '#FF1744' : '#880E4F'} filter={ledOn ? 'url(#glow-red)' : ''} />
            <ellipse cx="80" cy="140" rx="6" ry="4" fill="rgba(255,255,255,0.3)" />
            <line x1="76" y1="161" x2="76" y2="175" stroke="#888" strokeWidth="1.5" />
            <line x1="84" y1="161" x2="84" y2="175" stroke="#888" strokeWidth="1.5" />
            <text x="80" y="192" textAnchor="middle" fill="#555" fontSize="7" fontWeight="bold">LED</text>
          </g>

          {/* DHT22 */}
          <g filter="url(#shadow)">
            <rect x="150" y="155" width="70" height="75" rx="4" fill="#fff" stroke="#ccc" strokeWidth="1" />
            <rect x="160" y="163" width="50" height="35" rx="2" fill="#E8F5E9" />
            {Array.from({length:5}).map((_,i)=><line key={`dg${i}`} x1={165+i*10} y1="163" x2={165+i*10} y2="198" stroke="#A5D6A7" strokeWidth="0.5"/>)}
            {Array.from({length:3}).map((_,i)=><line key={`dh${i}`} x1="160" y1={173+i*10} x2="210" y2={173+i*10} stroke="#A5D6A7" strokeWidth="0.5"/>)}
            <text x="185" y="218" textAnchor="middle" fill="#333" fontSize="9" fontWeight="bold">DHT22</text>
            {[0,1,2].map(i=><rect key={`dp${i}`} x={170+i*15} y="228" width="5" height="12" rx="1" fill="#999"/>)}
            <text x="185" y="180" textAnchor="middle" fill="#1565C0" fontSize="8" fontFamily="monospace">{temp.toFixed(1)}°C</text>
            <text x="185" y="193" textAnchor="middle" fill="#1565C0" fontSize="8" fontFamily="monospace">{hum.toFixed(0)}%RH</text>
          </g>

          {/* Arduino UNO */}
          <g filter="url(#shadow)">
            <rect x="100" y="310" width="280" height="210" rx="6" fill="url(#boardBlue)" />
            <rect x="108" y="318" width="264" height="194" rx="4" fill="none" stroke="#0D47A1" strokeWidth="0.8" opacity="0.5" />
            <rect x="90" y="355" width="25" height="40" rx="3" fill="#aaa" stroke="#888" strokeWidth="1" />
            <rect x="93" y="360" width="19" height="30" rx="2" fill="#777" />
            <rect x="90" y="435" width="22" height="28" rx="5" fill="#222" />
            <circle cx="101" cy="449" r="5" fill="#333" />
            <rect x="200" y="390" width="80" height="40" rx="3" fill="#111" />
            {Array.from({length:14}).map((_,i)=><rect key={`ic1${i}`} x={205+i*5} y="385" width="2" height="5" fill="#aaa"/>)}
            {Array.from({length:14}).map((_,i)=><rect key={`ic2${i}`} x={205+i*5} y="430" width="2" height="5" fill="#aaa"/>)}
            <text x="240" y="414" textAnchor="middle" fill="#888" fontSize="7" fontFamily="monospace">ATMEGA328P</text>
            <circle cx="310" cy="370" r="16" fill="none" stroke="#fff" strokeWidth="1.5" />
            <text x="310" y="374" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">∞</text>
            <text x="340" y="368" fill="#fff" fontSize="9" fontWeight="bold">UNO</text>
            <text x="340" y="380" fill="#B3E5FC" fontSize="7">ARDUINO</text>
            <circle cx="345" cy="395" r="3" fill="#4CAF50" />
            <text x="345" y="407" textAnchor="middle" fill="#B3E5FC" fontSize="5">ON</text>
            <circle cx="330" cy="395" r="3" fill={ledOn?'#FFD54F':'#5D4900'} />
            <text x="330" y="407" textAnchor="middle" fill="#B3E5FC" fontSize="5">L</text>
            <text x="170" y="328" fill="#B3E5FC" fontSize="5">DIGITAL (PWM~)</text>
            {Array.from({length:14}).map((_,i)=><rect key={`dpin${i}`} x={135+i*17} y="332" width="10" height="8" rx="1" fill="#333" stroke="#555" strokeWidth="0.3"/>)}
            <text x="213" y="329" fill="#B3E5FC" fontSize="4">~8</text>
            <text x="350" y="329" fill="#B3E5FC" fontSize="4">13</text>
            <text x="240" y="510" fill="#B3E5FC" fontSize="5">ANALOG IN</text>
            {Array.from({length:6}).map((_,i)=><rect key={`apin${i}`} x={260+i*17} y="515" width="10" height="8" rx="1" fill="#333" stroke="#555" strokeWidth="0.3"/>)}
            {['A0','A1','A2','A3','A4','A5'].map((l,i)=><text key={l} x={265+i*17} y="530" textAnchor="middle" fill="#B3E5FC" fontSize="4">{l}</text>)}
            <text x="120" y="510" fill="#B3E5FC" fontSize="5">POWER</text>
            {Array.from({length:6}).map((_,i)=><rect key={`ppin${i}`} x={120+i*17} y="515" width="10" height="8" rx="1" fill="#333" stroke="#555" strokeWidth="0.3"/>)}
            {['IOREF','RST','3.3V','5V','GND','GND'].map((l,i)=><text key={`pl${i}`} x={125+i*17} y="530" textAnchor="middle" fill="#B3E5FC" fontSize="3.5">{l}</text>)}
            <rect x="170" y="440" width="16" height="8" rx="2" fill="#C0C0C0" stroke="#999" strokeWidth="0.5" />
            <circle cx="150" cy="345" r="6" fill="#C0392B" />
            <text x="150" y="360" textAnchor="middle" fill="#B3E5FC" fontSize="4">RST</text>
          </g>

          {/* Soil Moisture */}
          <g filter="url(#shadow)">
            <rect x="410" y="350" width="90" height="110" rx="4" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1" />
            <rect x="425" y="460" width="10" height="50" rx="1" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.5" />
            <rect x="475" y="460" width="10" height="50" rx="1" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.5" />
            {[0,1,2,3,4,5].map(i=><line key={`sp${i}`} x1="435" y1={468+i*7} x2="475" y2={468+i*7} stroke="#FFD54F" strokeWidth="1"/>)}
            <rect x="430" y="345" width="40" height="10" rx="2" fill="#333" />
            <text x="455" y="390" textAnchor="middle" fill="#C8E6C9" fontSize="8" fontWeight="bold">SOIL</text>
            <text x="455" y="402" textAnchor="middle" fill="#C8E6C9" fontSize="7">MOISTURE</text>
            <text x="455" y="438" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="bold">{soil.toFixed(0)}%</text>
            <circle cx="425" cy="370" r="3" fill={ledOn?'#F44336':'#5D0000'} />
          </g>

          {/* Light Sensor */}
          <g filter="url(#shadow)">
            <rect x="470" y="80" width="120" height="140" rx="4" fill="#1565C0" stroke="#0D47A1" strokeWidth="1" />
            <circle cx="530" cy="140" r="22" fill="#1a2a3a" stroke="#37474F" strokeWidth="1.5" />
            <path d="M 518 130 Q 530 148 542 130" stroke="#FFD54F" strokeWidth="1.5" fill="none" />
            <path d="M 518 148 Q 530 166 542 148" stroke="#FFD54F" strokeWidth="1.5" fill="none" />
            <rect x="555" y="100" width="20" height="14" rx="2" fill="#1E88E5" />
            <line x1="565" y1="100" x2="565" y2="114" stroke="#fff" strokeWidth="1" />
            <circle cx="490" cy="100" r="3" fill={ledOn?'#F44336':'#5D0000'} />
            <circle cx="500" cy="100" r="3" fill={ledOn?'#4CAF50':'#1B5E20'} />
            {['GND','DO','AO','VCC'].map((l,i)=>(
              <g key={l}><text x={485+i*25} y="205" fill="#B3E5FC" fontSize="6">{l}</text><rect x={488+i*25} y="208" width="6" height="12" rx="1" fill="#FFD54F"/></g>
            ))}
            <text x="530" y="185" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">{light.toFixed(0)}%</text>
          </g>

          {/* Potentiometer */}
          <g filter="url(#shadow)">
            <rect x="560" y="235" width="60" height="60" rx="4" fill="#1E88E5" stroke="#1565C0" strokeWidth="1" />
            <circle cx="590" cy="265" r="20" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1" />
            <circle cx="590" cy="265" r="14" fill="#BBDEFB" />
            <line x1="590" y1="265" x2="600" y2="252" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="590" cy="265" r="4" fill="#555" />
            {[-1,0,1].map(i=><rect key={`pot${i}`} x={582+i*12} y="295" width="6" height="10" rx="1" fill="#999"/>)}
            <text x="590" y="312" textAnchor="middle" fill="#555" fontSize="6">GND  SIG  VCC</text>
          </g>

          {/* LCD */}
          <g filter="url(#shadow)">
            <rect x="520" y="370" width="280" height="140" rx="5" fill="url(#lcdBezel)" stroke="#0a3d14" strokeWidth="1.5" />
            {['GND','VCC','SDA','SCL'].map((l,i)=>(
              <g key={l}><rect x={535+i*18} y="375" width="8" height="10" rx="1" fill="#FFD54F"/><text x={539+i*18} y="372" textAnchor="middle" fill="#8BC34A" fontSize="5">{l}</text></g>
            ))}
            <circle cx="650" cy="385" r="6" fill="#1565C0" stroke="#0D47A1" strokeWidth="1" />
            <line x1="650" y1="385" x2="653" y2="381" stroke="#fff" strokeWidth="1" />
            <rect x="540" y="400" width="248" height="95" rx="4" fill="#222" />
            <rect x="548" y="408" width="232" height="79" rx="3" fill="url(#lcdGreen)" />
            <text x="565" y="440" fill="#2E5018" fontSize="22" fontFamily="'Courier New', monospace" fontWeight="bold" letterSpacing="3">{line1}</text>
            <text x="565" y="475" fill="#2E5018" fontSize="22" fontFamily="'Courier New', monospace" fontWeight="bold" letterSpacing="3">{line2}</text>
          </g>

          <text x="480" y="30" textAnchor="middle" fill="#666" fontSize="10" fontStyle="italic">Arduino UNO Smart Greenhouse — Wokwi Simulation</text>
          <g fontSize="6" fill="#777" fontFamily="monospace">
            <text x="245" y="270">D8 (DHT)</text>
            <text x="155" y="95">D13 (LED)</text>
            <text x="380" y="550">A0 (SOIL)</text>
            <text x="490" y="568">A1 (LIGHT)</text>
            <text x="480" y="578">A4 (SDA)</text>
            <text x="530" y="590">A5 (SCL)</text>
          </g>
        </svg>
      </div>

      {/* Serial Monitor */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs text-muted-foreground font-mono">Serial Monitor (9600 baud)</p>
          <span className="text-xs text-muted-foreground ml-auto font-mono">
            {simState === 'running' ? '● Receiving' : simState === 'paused' ? '◉ Paused' : '○ Stopped'}
          </span>
        </div>
        <div className="rounded-lg p-3 font-mono text-xs border border-border space-y-0.5 max-h-36 overflow-y-auto" style={{ background: '#0d1117' }}>
          {simState !== 'stopped' ? (
            Array.from({ length: 8 }).map((_, i) => {
              const jitter = (base: number, range: number) => (base + (Math.sin(elapsed / 1000 + i) * range)).toFixed(2);
              return (
                <div key={i} className="text-[#58a6ff]">
                  <span className="text-[#484f58]">[{formatTime(Math.max(0, elapsed - i * 500))}]</span>{' '}
                  Temperature: <span className="text-[#7ee787]">{jitter(temp, 0.1)}</span> °C | 
                  Humidity: <span className="text-[#7ee787]">{jitter(hum, 0.2)}</span>% | 
                  Soil: <span className="text-[#7ee787]">{soil.toFixed(0)}</span>% | 
                  Light: <span className="text-[#7ee787]">{light.toFixed(0)}</span>%
                </div>
              );
            })
          ) : (
            <div className="text-[#484f58]">Simulation stopped. Press ↻ to restart.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CircuitDiagram;
