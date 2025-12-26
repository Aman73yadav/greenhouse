import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Check,
  X,
  Clock
} from 'lucide-react';
import { Alert as AlertType } from '@/types/greenhouse';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AlertsPanelProps {
  alerts: AlertType[];
  onAcknowledge: (id: string) => void;
}

const alertIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const alertColors = {
  info: 'border-accent/50 bg-accent/10',
  warning: 'border-warning/50 bg-warning/10',
  critical: 'border-destructive/50 bg-destructive/10',
};

const alertIconColors = {
  info: 'text-accent',
  warning: 'text-warning',
  critical: 'text-destructive',
};

const AlertsPanel = ({ alerts, onAcknowledge }: AlertsPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const unreadCount = alerts.filter(a => !a.acknowledged).length;
  const filteredAlerts = filter === 'unread' 
    ? alerts.filter(a => !a.acknowledged)
    : alerts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Alerts</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread alerts
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const Icon = alertIcons[alert.type];
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  alertColors[alert.type],
                  alert.acknowledged && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    alert.type === 'info' && "bg-accent/20",
                    alert.type === 'warning' && "bg-warning/20",
                    alert.type === 'critical' && "bg-destructive/20"
                  )}>
                    <Icon className={cn("w-4 h-4", alertIconColors[alert.type])} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{alert.title}</h4>
                      {!alert.acknowledged && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  {!alert.acknowledged && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {alerts.some(a => !a.acknowledged) && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => alerts.forEach(a => !a.acknowledged && onAcknowledge(a.id))}
        >
          Mark All as Read
        </Button>
      )}
    </motion.div>
  );
};

export default AlertsPanel;
