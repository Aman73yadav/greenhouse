import { motion } from 'framer-motion';
import { Monitor } from 'lucide-react';
import { SensorData } from '@/types/greenhouse';

interface VirtualLCDProps {
  sensorData: SensorData[];
}

const VirtualLCD = ({ sensorData }: VirtualLCDProps) => {
  const temp = sensorData.find(s => s.type === 'temperature')?.value ?? 0;
  const hum = sensorData.find(s => s.type === 'humidity')?.value ?? 0;
  const soil = sensorData.find(s => s.type === 'moisture')?.value ?? 0;
  const light = sensorData.find(s => s.type === 'light')?.value ?? 0;

  // Format exactly like the Wokwi LCD: 16 chars per line
  // Line 1: "T:24.5C H:65%  "
  // Line 2: "S:72% L:85%"
  const line1 = `T:${temp.toFixed(1)}C H:${hum.toFixed(0)}%`;
  const line2 = `S:${soil.toFixed(0)}% L:${light.toFixed(0)}%`;

  // Pad to 16 characters
  const padLine = (line: string) => line.padEnd(16, ' ').slice(0, 16);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold">Wokwi LCD Display</h3>
        <span className="text-xs text-muted-foreground ml-auto">16×2 I2C LCD</span>
      </div>

      {/* LCD Frame */}
      <div className="bg-[#1a1a2e] rounded-xl p-4 border-2 border-[#2a2a4a] shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
        {/* PCB green border */}
        <div className="bg-[#0d3b0d] rounded-lg p-3 border border-[#1a5c1a]">
          {/* LCD screen */}
          <div
            className="rounded-md p-4 font-mono relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #2a4a2a 0%, #1e3a1e 50%, #2a4a2a 100%)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4), 0 0 20px rgba(50,200,50,0.05)',
            }}
          >
            {/* Scanline effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              }}
            />

            {/* LCD characters */}
            <div className="relative z-10 space-y-1">
              <motion.div
                key={line1}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                className="text-[#7fff7f] text-xl tracking-[0.25em] drop-shadow-[0_0_6px_rgba(100,255,100,0.5)]"
                style={{ fontFamily: "'Courier New', monospace", textShadow: '0 0 8px rgba(100,255,100,0.4)' }}
              >
                {padLine(line1)}
              </motion.div>
              <motion.div
                key={line2}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                className="text-[#7fff7f] text-xl tracking-[0.25em] drop-shadow-[0_0_6px_rgba(100,255,100,0.5)]"
                style={{ fontFamily: "'Courier New', monospace", textShadow: '0 0 8px rgba(100,255,100,0.4)' }}
              >
                {padLine(line2)}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Serial Monitor Output */}
      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2 font-mono">Serial Monitor (9600 baud):</p>
        <div
          className="rounded-lg p-3 font-mono text-xs border border-glass-border overflow-x-auto"
          style={{ background: 'hsl(var(--card))' }}
        >
          <span className="text-muted-foreground">
            Temperature: <span className="text-foreground">{temp.toFixed(1)}</span> °C | 
            Humidity: <span className="text-foreground">{hum.toFixed(0)}</span>% | 
            Soil: <span className="text-foreground">{soil.toFixed(0)}</span>% | 
            Light: <span className="text-foreground">{light.toFixed(0)}</span>%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default VirtualLCD;
