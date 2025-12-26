import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Droplets, 
  Lightbulb, 
  Fan, 
  Flame,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import { Schedule } from '@/types/greenhouse';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ScheduleManagerProps {
  schedules: Schedule[];
  onToggleSchedule: (id: string) => void;
}

const scheduleIcons = {
  irrigation: Droplets,
  lighting: Lightbulb,
  ventilation: Fan,
  heating: Flame,
};

const scheduleColors = {
  irrigation: 'text-humidity',
  lighting: 'text-light',
  ventilation: 'text-primary',
  heating: 'text-temperature',
};

const ScheduleManager = ({ schedules, onToggleSchedule }: ScheduleManagerProps) => {
  const activeSchedules = schedules.filter(s => s.enabled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Schedules</h3>
            <p className="text-sm text-muted-foreground">
              {activeSchedules} active schedules
            </p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-lg">+</span>
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule, index) => {
          const Icon = scheduleIcons[schedule.type];
          const colorClass = scheduleColors[schedule.type];
          
          return (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                schedule.enabled 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-glass-border bg-glass/30"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    schedule.enabled ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      schedule.enabled ? colorClass : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{schedule.name}</h4>
                      {schedule.enabled ? (
                        <Badge variant="default" className="bg-success text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Paused
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {schedule.zone} • {schedule.type}
                    </p>
                  </div>
                </div>
                
                <Switch 
                  checked={schedule.enabled}
                  onCheckedChange={() => onToggleSchedule(schedule.id)}
                />
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{schedule.startTime} - {schedule.endTime}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span
                      key={day}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        schedule.days.includes(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {day[0]}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-glass-border flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {schedule.nextRun && (
                    <span>
                      Next run: {new Date(schedule.nextRun).toLocaleString([], {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onToggleSchedule(schedule.id)}
                  >
                    {schedule.enabled ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Calendar View Preview */}
      <div className="mt-6 pt-6 border-t border-glass-border">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          This Week
        </h4>
        
        <div className="grid grid-cols-7 gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-muted-foreground mb-2">{day}</p>
              <div className={cn(
                "h-12 rounded-lg flex items-center justify-center text-xs",
                i < 5 ? "bg-primary/20" : "bg-muted"
              )}>
                {i < 5 ? (
                  <div className="space-y-0.5">
                    <div className="w-2 h-2 bg-humidity rounded-full mx-auto" />
                    <div className="w-2 h-2 bg-light rounded-full mx-auto" />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleManager;
