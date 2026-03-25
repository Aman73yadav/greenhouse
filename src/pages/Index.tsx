import React, { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  LayoutDashboard, 
  Cpu, 
  Calendar, 
  BarChart3,
  Settings,
  Bell,
  Sprout,
  LogOut,
  User
} from 'lucide-react';
import { useGreenhouseData } from '@/hooks/useGreenhouseData';
import { useAuth } from '@/hooks/useAuth';
import SensorCard from '@/components/dashboard/SensorCard';
import ControlPanel from '@/components/dashboard/ControlPanel';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import IoTDeviceManager from '@/components/dashboard/IoTDeviceManager';
import ScheduleManager from '@/components/dashboard/ScheduleManager';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import DataExport from '@/components/dashboard/DataExport';
import ScheduleCalendar from '@/components/dashboard/ScheduleCalendar';
import DeviceRegistration from '@/components/dashboard/DeviceRegistration';
import WokwiEmbed from '@/components/dashboard/WokwiEmbed';
import PlantCard from '@/components/dashboard/PlantCard';
import VirtualLCD from '@/components/dashboard/VirtualLCD';
import CircuitDiagram from '@/components/dashboard/CircuitDiagram';
import SendTestData from '@/components/dashboard/SendTestData';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import greenhouseHero from '@/assets/greenhouse-hero.jpg';


const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'plants', label: 'Plants', icon: Sprout },
  
  { id: 'devices', label: 'IoT Devices', icon: Cpu },
  { id: 'schedules', label: 'Schedules', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, signOut } = useAuth();
  const {
    sensorData,
    plants,
    devices,
    schedules,
    controls,
    alerts,
    historicalData,
    updateControl,
    acknowledgeAlert,
    toggleSchedule,
    updateSensorValue,
  } = useGreenhouseData();

  const tempSensor = sensorData.find(s => s.type === 'temperature');
  const humiditySensor = sensorData.find(s => s.type === 'humidity');
  const moistureSensor = sensorData.find(s => s.type === 'moisture');

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-hero grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-glass-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gradient-primary">
                  Smart Greenhouse
                </h1>
                <p className="text-xs text-muted-foreground">Cloud-Based Monitoring System</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Bell className="w-5 h-5" />
                {alerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground text-sm">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-64 rounded-2xl overflow-hidden mb-8"
          >
            <img 
              src={greenhouseHero} 
              alt="Smart Greenhouse" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
            <div className="absolute inset-0 flex items-center p-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                  Welcome to Your <span className="text-gradient-primary">Smart Greenhouse</span>
                </h2>
                <p className="text-muted-foreground max-w-lg">
                  Real-time monitoring and control of your greenhouse environment with IoT sensors and AI-powered insights.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Sensor Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-bold">Live Sensors</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {sensorData.map((sensor) => (
                  <SensorCard key={sensor.id} sensor={sensor} />
                ))}
              </div>
            </section>

            <SendTestData />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ControlPanel controls={controls} onUpdateControl={updateControl} />
              </div>
              <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
            </div>

            {/* Circuit Diagram */}
            <CircuitDiagram sensorData={sensorData} onSensorUpdate={updateSensorValue} />

            {/* Virtual LCD Display */}
            <VirtualLCD sensorData={sensorData} />

            <AnalyticsCharts data={historicalData} />
          </div>
        )}

        {/* Plants Tab */}
        {activeTab === 'plants' && (
          <div className="space-y-8">
            <h3 className="text-xl font-display font-bold">Plant Management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          </div>
        )}


        {/* IoT Devices Tab */}
        {activeTab === 'devices' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <IoTDeviceManager devices={devices} />
              <DataExport data={historicalData} />
            </div>
            <WokwiEmbed />
            <DeviceRegistration onDeviceRegistered={(device) => {
              console.log('Device registered:', device);
            }} />
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScheduleManager schedules={schedules} onToggleSchedule={toggleSchedule} />
            <ScheduleCalendar schedules={schedules} />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts data={historicalData} />
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-glass-border p-2">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
