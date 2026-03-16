import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap } from 'lucide-react';
import { SensorData } from '@/types/greenhouse';

interface CircuitDiagramProps {
  sensorData: SensorData[];
}

const CircuitDiagram = ({ sensorData }: CircuitDiagramProps) => {
  const [pulsePhase, setPulsePhase] = useState(0);
  const [ledOn, setLedOn] = useState(false);

  const temp = sensorData.find(s => s.type === 'temperature')?.value ?? 24;
  const hum = sensorData.find(s => s.type === 'humidity')?.value ?? 40;
  const soil = sensorData.find(s => s.type === 'moisture')?.value ?? 100;
  const light = sensorData.find(s => s.type === 'light')?.value ?? 75;

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 100);
      setLedOn(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const line1 = `T:${temp.toFixed(2)}C H:${hum.toFixed(2)}`;
  const line2 = `S:${soil.toFixed(0)}%  L:${light.toFixed(0)}%`;

  // Animated dot along a path
  const DataDot = ({ path, color, delay = 0 }: { path: string; color: string; delay?: number }) => (
    <circle r="3" fill={color} opacity="0.9">
      <animateMotion dur="2s" repeatCount="indefinite" begin={`${delay}s`} path={path} />
    </circle>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold">Wokwi Circuit Simulator</h3>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
          </span>
          <span className="text-xs text-muted-foreground">Running</span>
        </div>
      </div>

      <div className="bg-[#e8e8e8] rounded-xl p-4 border border-border overflow-x-auto">
        <svg viewBox="0 0 900 600" className="w-full h-auto min-w-[700px]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-green">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
            <linearGradient id="boardBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E88C7" />
              <stop offset="100%" stopColor="#1565A0" />
            </linearGradient>
            <linearGradient id="lcdGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8BC34A" />
              <stop offset="100%" stopColor="#689F38" />
            </linearGradient>
          </defs>

          {/* === WIRES (behind components) === */}
          {/* Power rails - Red */}
          <path d="M 310 320 L 310 130 L 195 130" stroke="#E53935" strokeWidth="2.5" fill="none" />
          <path d="M 370 380 L 370 500 L 560 500 L 560 470" stroke="#E53935" strokeWidth="2.5" fill="none" />
          <path d="M 560 500 L 750 500 L 750 180" stroke="#E53935" strokeWidth="2.5" fill="none" />
          
          {/* Ground rails - Black */}
          <path d="M 280 320 L 280 100 L 195 100" stroke="#222" strokeWidth="2.5" fill="none" />
          <path d="M 330 380 L 330 520 L 750 520 L 750 200" stroke="#222" strokeWidth="2.5" fill="none" />

          {/* DHT22 Signal - Green */}
          <path d="M 340 130 L 340 290 L 350 290 L 350 320" stroke="#4CAF50" strokeWidth="2" fill="none" />
          
          {/* Soil Moisture Analog - Green */}
          <path d="M 140 420 L 140 380 L 280 380 L 280 380" stroke="#4CAF50" strokeWidth="2" fill="none" />

          {/* Light Sensor Analog - Green */}
          <path d="M 700 220 L 700 380 L 410 380" stroke="#4CAF50" strokeWidth="2" fill="none" />

          {/* LED Signal - Green */}
          <path d="M 195 170 L 390 170 L 390 320" stroke="#4CAF50" strokeWidth="2" fill="none" />

          {/* LCD I2C SDA - Green */}
          <path d="M 560 440 L 430 440 L 430 380" stroke="#2196F3" strokeWidth="2" fill="none" />
          {/* LCD I2C SCL - Yellow */}
          <path d="M 580 440 L 450 440 L 450 380" stroke="#FF9800" strokeWidth="2" fill="none" />

          {/* Potentiometer to LCD */}
          <path d="M 630 310 L 630 440 L 600 440" stroke="#9C27B0" strokeWidth="2" fill="none" />

          {/* Data flow dots */}
          <DataDot path="M 340 130 L 340 290 L 350 290 L 350 320" color="#4CAF50" delay={0} />
          <DataDot path="M 140 420 L 140 380 L 280 380" color="#4CAF50" delay={0.5} />
          <DataDot path="M 700 220 L 700 380 L 410 380" color="#4CAF50" delay={1} />
          <DataDot path="M 430 380 L 430 440 L 560 440" color="#2196F3" delay={1.5} />

          {/* === ARDUINO UNO === */}
          <g filter="url(#shadow)">
            <rect x="250" y="280" width="220" height="120" rx="6" fill="url(#boardBlue)" />
            <rect x="258" y="288" width="204" height="104" rx="4" fill="none" stroke="#0D47A1" strokeWidth="1" />
            
            {/* USB connector */}
            <rect x="244" y="330" width="20" height="30" rx="2" fill="#888" stroke="#666" strokeWidth="1" />
            
            {/* Power jack */}
            <rect x="244" y="370" width="18" height="20" rx="4" fill="#333" />
            
            {/* IC chip */}
            <rect x="310" y="330" width="60" height="30" rx="2" fill="#1A1A1A" />
            <text x="340" y="350" textAnchor="middle" fill="#ccc" fontSize="7" fontFamily="monospace">ATMEGA</text>
            
            {/* Arduino logo & text */}
            <circle cx="410" cy="340" r="12" fill="none" stroke="#fff" strokeWidth="1.5" />
            <text x="410" y="343" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">∞</text>
            <text x="430" y="350" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">UNO</text>
            
            {/* Label */}
            <text x="300" y="310" fill="#B3E5FC" fontSize="7" fontFamily="sans-serif">ARDUINO</text>
            
            {/* Pin headers - Digital (top) */}
            {Array.from({ length: 14 }).map((_, i) => (
              <rect key={`d${i}`} x={270 + i * 14} y="278" width="8" height="8" rx="1" fill="#333" stroke="#555" strokeWidth="0.5" />
            ))}
            {/* Pin headers - Analog (bottom) */}
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={`a${i}`} x={310 + i * 14} y="394" width="8" height="8" rx="1" fill="#333" stroke="#555" strokeWidth="0.5" />
            ))}
            
            {/* Power pins */}
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={`p${i}`} x={270 + i * 14} y="394" width="8" height="8" rx="1" fill="#333" stroke="#555" strokeWidth="0.5" />
            ))}

            {/* LEDs on board */}
            <circle cx="290" cy="315" r="3" fill={ledOn ? '#4CAF50' : '#1B5E20'} />
            <text x="290" y="328" textAnchor="middle" fill="#B3E5FC" fontSize="5">L</text>
            <circle cx="425" cy="370" r="3" fill="#4CAF50" />
            <text x="425" y="383" textAnchor="middle" fill="#B3E5FC" fontSize="5">ON</text>
          </g>

          {/* === DHT22 SENSOR === */}
          <g filter="url(#shadow)">
            <rect x="295" y="70" width="80" height="60" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1" />
            <rect x="305" y="78" width="60" height="30" rx="2" fill="#E3F2FD" />
            {/* Grid pattern */}
            {Array.from({ length: 4 }).map((_, i) => (
              <line key={`dg${i}`} x1={315 + i * 12} y1="78" x2={315 + i * 12} y2="108" stroke="#90CAF9" strokeWidth="0.5" />
            ))}
            <text x="335" y="122" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">DHT22</text>
            {/* Pins */}
            <rect x="310" y="128" width="6" height="10" rx="1" fill="#888" />
            <rect x="325" y="128" width="6" height="10" rx="1" fill="#888" />
            <rect x="340" y="128" width="6" height="10" rx="1" fill="#888" />
            {/* Value */}
            <text x="335" y="95" textAnchor="middle" fill="#1565C0" fontSize="7" fontFamily="monospace">
              {temp.toFixed(1)}°C
            </text>
            <text x="335" y="105" textAnchor="middle" fill="#1565C0" fontSize="7" fontFamily="monospace">
              {hum.toFixed(0)}%
            </text>
          </g>

          {/* === RED LED === */}
          <g filter="url(#shadow)">
            <ellipse cx="180" cy="170" rx="10" ry="14" fill={ledOn ? '#FF1744' : '#880E4F'} filter={ledOn ? 'url(#glow-red)' : ''} />
            <rect x="176" y="182" width="3" height="15" fill="#888" />
            <rect x="183" y="182" width="3" height="15" fill="#888" />
            <text x="180" y="210" textAnchor="middle" fill="#666" fontSize="7">LED</text>
            {/* Resistor */}
            <rect x="168" y="120" width="24" height="8" rx="2" fill="#D4A574" stroke="#8B6914" strokeWidth="0.5" />
            {[0, 1, 2, 3].map(i => (
              <line key={`r${i}`} x1={172 + i * 5} y1="120" x2={172 + i * 5} y2="128" stroke={['#A52A2A', '#000', '#F00', '#FFD700'][i]} strokeWidth="1.5" />
            ))}
          </g>

          {/* === SOIL MOISTURE SENSOR === */}
          <g filter="url(#shadow)">
            <rect x="60" y="360" width="70" height="90" rx="4" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1" />
            {/* Prongs */}
            <rect x="70" y="450" width="8" height="40" rx="1" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.5" />
            <rect x="110" y="450" width="8" height="40" rx="1" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.5" />
            {/* Connector */}
            <rect x="75" y="358" width="40" height="12" rx="2" fill="#333" />
            <text x="95" y="400" textAnchor="middle" fill="#C8E6C9" fontSize="7" fontWeight="bold">SOIL</text>
            <text x="95" y="412" textAnchor="middle" fill="#C8E6C9" fontSize="7">MOISTURE</text>
            <text x="95" y="430" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace">{soil.toFixed(0)}%</text>
          </g>

          {/* === LIGHT SENSOR MODULE === */}
          <g filter="url(#shadow)">
            <rect x="680" y="100" width="90" height="120" rx="4" fill="#1565C0" stroke="#0D47A1" strokeWidth="1" />
            {/* LDR */}
            <circle cx="725" cy="150" r="18" fill="#263238" stroke="#37474F" strokeWidth="1" />
            <path d="M 715 140 Q 725 155 735 140" stroke="#FFD54F" strokeWidth="1.5" fill="none" />
            <path d="M 715 155 Q 725 170 735 155" stroke="#FFD54F" strokeWidth="1.5" fill="none" />
            {/* Pins */}
            <text x="690" y="195" fill="#B3E5FC" fontSize="6">VCC</text>
            <text x="710" y="195" fill="#B3E5FC" fontSize="6">GND</text>
            <text x="730" y="195" fill="#B3E5FC" fontSize="6">DO</text>
            <text x="750" y="195" fill="#B3E5FC" fontSize="6">AO</text>
            {Array.from({ length: 4 }).map((_, i) => (
              <rect key={`lp${i}`} x={693 + i * 20} y="198" width="6" height="10" rx="1" fill="#FFD54F" />
            ))}
            <text x="725" y="125" textAnchor="middle" fill="#B3E5FC" fontSize="7" fontWeight="bold">LIGHT</text>
            <text x="725" y="134" textAnchor="middle" fill="#B3E5FC" fontSize="7">SENSOR</text>
            {/* LED on module */}
            <circle cx="700" cy="115" r="3" fill={ledOn ? '#F44336' : '#5D0000'} />
            <text x="725" y="175" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace">{light.toFixed(0)}%</text>
          </g>

          {/* === POTENTIOMETER === */}
          <g filter="url(#shadow)">
            <circle cx="630" cy="280" r="25" fill="#2196F3" stroke="#1565C0" strokeWidth="2" />
            <circle cx="630" cy="280" r="18" fill="#BBDEFB" />
            <line x1="630" y1="280" x2="640" y2="265" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            <circle cx="630" cy="280" r="4" fill="#333" />
            {/* Pins */}
            {[-1, 0, 1].map(i => (
              <rect key={`pot${i}`} x={622 + i * 10} y="305" width="6" height="10" rx="1" fill="#888" />
            ))}
            <text x="630" y="325" textAnchor="middle" fill="#666" fontSize="7">POT</text>
          </g>

          {/* === 16x2 LCD DISPLAY === */}
          <g filter="url(#shadow)">
            {/* PCB */}
            <rect x="530" y="420" width="220" height="100" rx="4" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1.5" />
            {/* Screen bezel */}
            <rect x="545" y="435" width="190" height="65" rx="3" fill="#333" />
            {/* Screen */}
            <rect x="550" y="440" width="180" height="55" rx="2" fill="url(#lcdGreen)" />
            
            {/* LCD Text - Line 1 */}
            <text x="560" y="462" fill="#1B5E20" fontSize="14" fontFamily="'Courier New', monospace" fontWeight="bold">
              {line1}
            </text>
            {/* LCD Text - Line 2 */}
            <text x="560" y="484" fill="#1B5E20" fontSize="14" fontFamily="'Courier New', monospace" fontWeight="bold">
              {line2}
            </text>

            {/* I2C Pins */}
            <text x="545" y="432" fill="#C8E6C9" fontSize="5">GND</text>
            <text x="565" y="432" fill="#C8E6C9" fontSize="5">VCC</text>
            <text x="585" y="432" fill="#C8E6C9" fontSize="5">SDA</text>
            <text x="605" y="432" fill="#C8E6C9" fontSize="5">SCL</text>
            {Array.from({ length: 4 }).map((_, i) => (
              <rect key={`lcd${i}`} x={548 + i * 20} y="422" width="6" height="8" rx="1" fill="#FFD54F" />
            ))}

            {/* Trimpot on LCD module */}
            <circle cx="720" cy="430" r="5" fill="#1565C0" />
            <line x1="720" y1="430" x2="722" y2="426" stroke="#fff" strokeWidth="1" />
          </g>

          {/* === LABELS & ANNOTATIONS === */}
          <text x="360" y="55" textAnchor="middle" fill="#666" fontSize="9" fontStyle="italic">
            Arduino UNO Smart Greenhouse Circuit
          </text>

          {/* Pin labels on Arduino */}
          <text x="350" y="276" fill="#B3E5FC" fontSize="5">D8</text>
          <text x="390" y="276" fill="#B3E5FC" fontSize="5">D13</text>
          <text x="315" y="410" fill="#B3E5FC" fontSize="5">A0</text>
          <text x="395" y="410" fill="#B3E5FC" fontSize="5">A4 A5</text>

          {/* Wire labels */}
          <g fontSize="6" fill="#888" fontFamily="monospace">
            <text x="340" y="210">DHT_PIN</text>
            <text x="200" y="375">SOIL_AO</text>
            <text x="540" y="435">I2C</text>
          </g>
        </svg>
      </div>

      {/* Serial Monitor */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs text-muted-foreground font-mono">Serial Monitor (9600 baud)</p>
        </div>
        <div
          className="rounded-lg p-3 font-mono text-xs border border-border space-y-0.5 max-h-32 overflow-y-auto"
          style={{ background: '#1a1a2e' }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="text-[#7fff7f]">
              Temperature: {temp.toFixed(2)} °C | Humidity: {hum.toFixed(2)}% | Soil: {soil.toFixed(0)}% | Light: {light.toFixed(0)}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CircuitDiagram;
