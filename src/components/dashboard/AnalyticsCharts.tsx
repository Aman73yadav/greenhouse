import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { HistoricalData } from '@/types/greenhouse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart3,
  Activity
} from 'lucide-react';

interface AnalyticsChartsProps {
  data: HistoricalData[];
}

const AnalyticsCharts = ({ data }: AnalyticsChartsProps) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    return data
      .filter(d => now - new Date(d.timestamp).getTime() < ranges[timeRange])
      .map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        date: new Date(d.timestamp).toLocaleDateString([], {
          month: 'short',
          day: 'numeric'
        }),
        temperature: Number(d.temperature.toFixed(1)),
        humidity: Number(d.humidity.toFixed(0)),
        moisture: Number(d.moisture.toFixed(0)),
        light: Number(d.light.toFixed(0)),
        light: Number(d.light.toFixed(0)),
      }));
  }, [data, timeRange]);

  const dailyAverages = useMemo(() => {
    const grouped: Record<string, { temps: number[]; hums: number[]; moist: number[] }> = {};
    
    data.forEach(d => {
      const day = new Date(d.timestamp).toLocaleDateString([], { weekday: 'short' });
      if (!grouped[day]) {
        grouped[day] = { temps: [], hums: [], moist: [] };
      }
      grouped[day].temps.push(d.temperature);
      grouped[day].hums.push(d.humidity);
      grouped[day].moist.push(d.moisture);
    });
    
    return Object.entries(grouped).map(([day, values]) => ({
      day,
      temperature: values.temps.reduce((a, b) => a + b, 0) / values.temps.length,
      humidity: values.hums.reduce((a, b) => a + b, 0) / values.hums.length,
      moisture: values.moist.reduce((a, b) => a + b, 0) / values.moist.length,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="glass-card p-3 border border-glass-border">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p 
            key={index} 
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}{entry.name === 'Temperature' ? '°C' : entry.name === 'CO2' ? ' ppm' : entry.name === 'Light' ? ' lux' : '%'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Analytics Dashboard</h3>
            <p className="text-sm text-muted-foreground">Real-time trends & predictions</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                timeRange === range 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="soil" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Soil Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {/* Temperature & Humidity Chart */}
          <div className="h-[300px]">
            <p className="text-sm font-medium mb-4">Temperature & Humidity</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData.slice(-24)}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="temp"
                  stroke="hsl(var(--temperature))"
                  fontSize={12}
                  domain={[15, 35]}
                />
                <YAxis 
                  yAxisId="humidity"
                  orientation="right"
                  stroke="hsl(var(--humidity))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="hsl(var(--temperature))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="humidity"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  stroke="hsl(var(--humidity))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Soil Moisture Chart */}
          <div className="h-[250px]">
            <p className="text-sm font-medium mb-4">Soil Moisture Over Time</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData.slice(-24)}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--moisture))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--moisture))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--moisture))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="moisture"
                  name="Moisture"
                  stroke="hsl(var(--moisture))"
                  fill="url(#moistureGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="h-[400px]">
          <p className="text-sm font-medium mb-4">Daily Averages Comparison</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyAverages}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="temperature" 
                name="Temperature"
                fill="hsl(var(--temperature))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="humidity" 
                name="Humidity"
                fill="hsl(var(--humidity))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="moisture" 
                name="Moisture"
                fill="hsl(var(--moisture))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="soil" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 border border-moisture/30">
              <p className="text-sm text-muted-foreground">Avg Moisture</p>
              <p className="text-3xl font-bold text-moisture">
                {(data.reduce((a, b) => a + b.moisture, 0) / data.length).toFixed(1)}%
              </p>
            </div>
            <div className="glass-card p-4 border border-primary/30">
              <p className="text-sm text-muted-foreground">Optimal Range</p>
              <p className="text-3xl font-bold text-primary">40-85%</p>
            </div>
            <div className="glass-card p-4 border border-success/30">
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p className="text-3xl font-bold text-success">94%</p>
            </div>
          </div>
          
          <div className="h-[250px]">
            <p className="text-sm font-medium mb-4">CO2 & Light Levels</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData.slice(-24)}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="co2"
                  stroke="hsl(var(--co2))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="light"
                  orientation="right"
                  stroke="hsl(var(--light))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="co2"
                  type="monotone"
                  dataKey="co2"
                  name="CO2"
                  stroke="hsl(var(--co2))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="light"
                  type="monotone"
                  dataKey="light"
                  name="Light"
                  stroke="hsl(var(--light))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AnalyticsCharts;
