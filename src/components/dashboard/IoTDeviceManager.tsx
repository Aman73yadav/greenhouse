import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryLow, 
  Signal, 
  Settings,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { IoTDevice } from '@/types/greenhouse';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface IoTDeviceManagerProps {
  devices: IoTDevice[];
}

const IoTDeviceManager = ({ devices }: IoTDeviceManagerProps) => {
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const warningCount = devices.filter(d => d.status === 'warning').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Cpu className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">IoT Devices</h3>
            <p className="text-sm text-muted-foreground">
              {onlineCount} online • {warningCount} warning
            </p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Scan
        </Button>
      </div>

      <div className="space-y-4">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-xl border transition-all",
              device.status === 'online' && "border-success/30 bg-success/5",
              device.status === 'warning' && "border-warning/30 bg-warning/5",
              device.status === 'offline' && "border-destructive/30 bg-destructive/5"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  device.status === 'online' && "bg-success/10",
                  device.status === 'warning' && "bg-warning/10",
                  device.status === 'offline' && "bg-destructive/10"
                )}>
                  {device.status === 'online' ? (
                    <Wifi className="w-4 h-4 text-success" />
                  ) : device.status === 'warning' ? (
                    <WifiOff className="w-4 h-4 text-warning" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-destructive" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{device.name}</h4>
                    <Badge 
                      variant={device.status === 'online' ? 'default' : 'secondary'}
                      className={cn(
                        "text-xs",
                        device.status === 'warning' && "bg-warning text-warning-foreground"
                      )}
                    >
                      {device.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {device.deviceType} • {device.zone}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {device.id} • v{device.firmwareVersion}
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* Battery */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {device.batteryLevel < 30 ? (
                    <BatteryLow className="w-3 h-3 text-warning" />
                  ) : (
                    <Battery className="w-3 h-3" />
                  )}
                  Battery
                </div>
                <Progress 
                  value={device.batteryLevel} 
                  className={cn(
                    "h-2",
                    device.batteryLevel < 30 && "[&>div]:bg-warning"
                  )}
                />
                <p className="text-xs font-medium">{device.batteryLevel}%</p>
              </div>
              
              {/* Signal */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Signal className="w-3 h-3" />
                  Signal
                </div>
                <Progress value={device.signalStrength} className="h-2" />
                <p className="text-xs font-medium">{device.signalStrength}%</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-glass-border">
              <p className="text-xs text-muted-foreground">
                Last seen: {new Date(device.lastSeen).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Device Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="mt-4 w-full p-4 border-2 border-dashed border-glass-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span>
        Add New Device
      </motion.button>
    </motion.div>
  );
};

export default IoTDeviceManager;
