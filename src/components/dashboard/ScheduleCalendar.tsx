import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Droplets,
  Lightbulb,
  Fan,
  Flame
} from 'lucide-react';
import { Schedule } from '@/types/greenhouse';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  addDays, 
  startOfWeek, 
  format, 
  isSameDay, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';

interface ScheduleCalendarProps {
  schedules: Schedule[];
}

const scheduleIcons = {
  irrigation: Droplets,
  lighting: Lightbulb,
  ventilation: Fan,
  heating: Flame,
};

const scheduleColors = {
  irrigation: 'bg-humidity text-white',
  lighting: 'bg-light text-black',
  ventilation: 'bg-primary text-primary-foreground',
  heating: 'bg-temperature text-white',
};

const scheduleBgColors = {
  irrigation: 'bg-humidity/20',
  lighting: 'bg-light/20',
  ventilation: 'bg-primary/20',
  heating: 'bg-temperature/20',
};

const ScheduleCalendar = ({ schedules }: ScheduleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getSchedulesForDay = (date: Date) => {
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    const dayShort = dayName.slice(0, 3);
    
    return schedules.filter(schedule => 
      schedule.enabled && schedule.days.includes(dayShort)
    );
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days from previous month
    const startDayOfWeek = getDay(start);
    const paddingBefore = Array.from({ length: startDayOfWeek }, (_, i) => 
      addDays(start, -(startDayOfWeek - i))
    );
    
    // Add padding days for next month
    const endDayOfWeek = getDay(end);
    const paddingAfter = Array.from({ length: 6 - endDayOfWeek }, (_, i) =>
      addDays(end, i + 1)
    );
    
    return [...paddingBefore, ...days, ...paddingAfter];
  }, [currentDate]);

  const navigatePrevious = () => {
    if (view === 'week') {
      setCurrentDate(prev => addDays(prev, -7));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Schedule Calendar</h3>
            <p className="text-sm text-muted-foreground">
              View all scheduled events
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setView('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={navigatePrevious}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h4 className="font-medium text-lg">
          {view === 'week' 
            ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
            : format(currentDate, 'MMMM yyyy')
          }
        </h4>
        
        <Button variant="ghost" size="icon" onClick={navigateNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(scheduleIcons).map(([type, Icon]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn(
              "w-3 h-3 rounded-full",
              scheduleColors[type as keyof typeof scheduleColors]
            )} />
            <span className="text-xs text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <TooltipProvider>
        {view === 'week' ? (
          /* Week View */
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {weekDays.map((day, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {dayNames[day.getDay()]}
                </p>
                <p className={cn(
                  "text-sm font-medium mb-2 w-8 h-8 flex items-center justify-center mx-auto rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
            
            {/* Day Content */}
            {weekDays.map((day, i) => {
              const daySchedules = getSchedulesForDay(day);
              return (
                <div 
                  key={`content-${i}`}
                  className={cn(
                    "min-h-[120px] p-2 rounded-lg border",
                    isToday(day) ? "border-primary/50 bg-primary/5" : "border-glass-border bg-glass/30"
                  )}
                >
                  <div className="space-y-1">
                    {daySchedules.map((schedule) => {
                      const Icon = scheduleIcons[schedule.type];
                      return (
                        <Tooltip key={schedule.id}>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "p-1.5 rounded text-xs cursor-pointer transition-opacity hover:opacity-80",
                              scheduleBgColors[schedule.type]
                            )}>
                              <div className="flex items-center gap-1">
                                <Icon className="w-3 h-3" />
                                <span className="truncate">{schedule.name}</span>
                              </div>
                              <p className="text-[10px] opacity-70 mt-0.5">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-medium">{schedule.name}</p>
                              <p className="text-muted-foreground">{schedule.zone}</p>
                              <p>{schedule.startTime} - {schedule.endTime}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Month View */
          <div>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month Grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, i) => {
                const daySchedules = getSchedulesForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[80px] p-1 rounded-lg border transition-all",
                      !isCurrentMonth && "opacity-40",
                      isToday(day) 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-glass-border bg-glass/20 hover:bg-glass/40"
                    )}
                  >
                    <p className={cn(
                      "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}>
                      {format(day, 'd')}
                    </p>
                    
                    <div className="space-y-0.5">
                      {daySchedules.slice(0, 2).map((schedule) => {
                        const Icon = scheduleIcons[schedule.type];
                        return (
                          <Tooltip key={schedule.id}>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "p-1 rounded text-[10px] cursor-pointer flex items-center gap-1",
                                scheduleBgColors[schedule.type]
                              )}>
                                <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{schedule.name}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <p className="font-medium">{schedule.name}</p>
                                <p className="text-muted-foreground">{schedule.zone}</p>
                                <p>{schedule.startTime} - {schedule.endTime}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                      {daySchedules.length > 2 && (
                        <p className="text-[10px] text-muted-foreground text-center">
                          +{daySchedules.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </TooltipProvider>

      {/* Upcoming Events */}
      <div className="mt-6 pt-4 border-t border-glass-border">
        <h4 className="font-medium mb-3 text-sm">Upcoming Today</h4>
        <div className="space-y-2">
          {schedules
            .filter(s => s.enabled && s.days.includes(dayNames[new Date().getDay()].slice(0, 3)))
            .slice(0, 3)
            .map((schedule) => {
              const Icon = scheduleIcons[schedule.type];
              return (
                <div 
                  key={schedule.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <div className={cn(
                    "p-1.5 rounded",
                    scheduleBgColors[schedule.type]
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{schedule.name}</p>
                    <p className="text-xs text-muted-foreground">{schedule.zone}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {schedule.startTime}
                  </Badge>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleCalendar;
