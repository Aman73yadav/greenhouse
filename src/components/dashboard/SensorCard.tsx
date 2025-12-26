import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Leaf, 
  Wind, 
  Sun,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { SensorData } from '@/types/greenhouse';
import { cn } from '@/lib/utils';

interface SensorCardProps {
  sensor: SensorData;
  onClick?: () => void;
}

const sensorIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  moisture: Leaf,
  co2: Wind,
  light: Sun,
};

const sensorColors = {
  temperature: 'text-temperature',
  humidity: 'text-humidity',
  moisture: 'text-moisture',
  co2: 'text-co2',
  light: 'text-light',
};

const sensorBgColors = {
  temperature: 'bg-temperature/10',
  humidity: 'bg-humidity/10',
  moisture: 'bg-moisture/10',
  co2: 'bg-co2/10',
  light: 'bg-light/10',
};

const SensorCard = ({ sensor, onClick }: SensorCardProps) => {
  const Icon = sensorIcons[sensor.type];
  const colorClass = sensorColors[sensor.type];
  const bgClass = sensorBgColors[sensor.type];
  
  const percentage = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
  
  const getStatusColor = () => {
    switch (sensor.status) {
      case 'critical': return 'border-destructive';
      case 'warning': return 'border-warning';
      default: return 'border-glass-border';
    }
  };

  const getStatusIcon = () => {
    switch (sensor.status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "glass-card-hover p-5 cursor-pointer border-2",
        getStatusColor()
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl", bgClass)}>
          <Icon className={cn("w-6 h-6", colorClass)} />
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="space-y-1 mb-4">
        <p className="text-sm text-muted-foreground capitalize">{sensor.type}</p>
        <div className="flex items-baseline gap-1">
          <motion.span 
            key={sensor.value}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("sensor-value", colorClass)}
          >
            {sensor.value.toFixed(1)}
          </motion.span>
          <span className="text-lg text-muted-foreground">{sensor.unit}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full rounded-full", bgClass.replace('/10', ''))}
            style={{ 
              backgroundColor: `hsl(var(--${sensor.type}))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {sensor.threshold.low}{sensor.unit}</span>
          <span>Max: {sensor.threshold.high}{sensor.unit}</span>
        </div>
      </div>
      
      {/* Last updated */}
      <div className="mt-3 pt-3 border-t border-glass-border">
        <p className="text-xs text-muted-foreground">
          Updated {new Date(sensor.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export default SensorCard;
