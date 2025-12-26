import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Droplets, 
  Lightbulb, 
  Fan, 
  Flame, 
  Snowflake,
  CloudRain,
  Power
} from 'lucide-react';
import { ControlState } from '@/types/greenhouse';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ControlPanelProps {
  controls: ControlState;
  onUpdateControl: (key: keyof ControlState, value: boolean) => void;
}

const controlConfig = [
  { key: 'irrigation' as const, icon: Droplets, label: 'Irrigation', color: 'text-humidity' },
  { key: 'lighting' as const, icon: Lightbulb, label: 'Grow Lights', color: 'text-light' },
  { key: 'ventilation' as const, icon: Fan, label: 'Ventilation', color: 'text-primary' },
  { key: 'heating' as const, icon: Flame, label: 'Heating', color: 'text-temperature' },
  { key: 'cooling' as const, icon: Snowflake, label: 'Cooling', color: 'text-accent' },
  { key: 'misting' as const, icon: CloudRain, label: 'Misting', color: 'text-moisture' },
];

const ControlPanel = ({ controls, onUpdateControl }: ControlPanelProps) => {
  const [targetTemp, setTargetTemp] = useState([24]);
  const [targetHumidity, setTargetHumidity] = useState([65]);
  const [targetMoisture, setTargetMoisture] = useState([70]);

  const activeCount = Object.values(controls).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-display font-bold">Control Center</h3>
          <p className="text-sm text-muted-foreground">
            {activeCount} systems active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            activeCount > 0 ? "bg-success animate-pulse" : "bg-muted"
          )} />
          <span className="text-sm text-muted-foreground">
            {activeCount > 0 ? 'Running' : 'All Off'}
          </span>
        </div>
      </div>

      {/* Control toggles */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {controlConfig.map((control) => {
          const Icon = control.icon;
          const isActive = controls[control.key];
          
          return (
            <motion.div
              key={control.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                isActive 
                  ? "bg-primary/10 border-primary" 
                  : "bg-glass/30 border-glass-border hover:border-primary/50"
              )}
              onClick={() => onUpdateControl(control.key, !isActive)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive ? "bg-primary/20" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? control.color : "text-muted-foreground"
                  )} />
                </div>
                <Switch 
                  checked={isActive}
                  onCheckedChange={(checked) => onUpdateControl(control.key, checked)}
                />
              </div>
              <p className={cn(
                "font-medium text-sm",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {control.label}
              </p>
              
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Target setpoints */}
      <div className="space-y-6 pt-6 border-t border-glass-border">
        <h4 className="font-display font-semibold flex items-center gap-2">
          <Power className="w-4 h-4 text-primary" />
          Target Setpoints
        </h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Temperature</span>
              <span className="font-mono text-temperature">{targetTemp[0]}°C</span>
            </div>
            <Slider
              value={targetTemp}
              onValueChange={setTargetTemp}
              min={15}
              max={35}
              step={0.5}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Humidity</span>
              <span className="font-mono text-humidity">{targetHumidity[0]}%</span>
            </div>
            <Slider
              value={targetHumidity}
              onValueChange={setTargetHumidity}
              min={30}
              max={90}
              step={1}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Soil Moisture</span>
              <span className="font-mono text-moisture">{targetMoisture[0]}%</span>
            </div>
            <Slider
              value={targetMoisture}
              onValueChange={setTargetMoisture}
              min={20}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 pt-6 border-t border-glass-border">
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              controlConfig.forEach(c => onUpdateControl(c.key, true));
            }}
            className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
          >
            All On
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              controlConfig.forEach(c => onUpdateControl(c.key, false));
            }}
            className="flex-1 py-2 px-4 bg-muted text-muted-foreground rounded-lg font-medium text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            All Off
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
