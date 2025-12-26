import { useState, useEffect, useCallback } from 'react';
import { 
  SensorData, 
  Plant, 
  IoTDevice, 
  Schedule, 
  ControlState, 
  Alert,
  HistoricalData 
} from '@/types/greenhouse';

// Simulated real-time sensor data generation
const generateSensorValue = (base: number, variance: number): number => {
  return Math.round((base + (Math.random() - 0.5) * variance) * 10) / 10;
};

const getSensorStatus = (
  value: number, 
  threshold: { low: number; high: number }
): 'normal' | 'warning' | 'critical' => {
  if (value < threshold.low * 0.8 || value > threshold.high * 1.2) return 'critical';
  if (value < threshold.low || value > threshold.high) return 'warning';
  return 'normal';
};

export const useGreenhouseData = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([
    {
      id: 'temp-1',
      type: 'temperature',
      value: 24.5,
      unit: '°C',
      min: 15,
      max: 35,
      threshold: { low: 18, high: 28 },
      status: 'normal',
      lastUpdated: new Date(),
    },
    {
      id: 'humidity-1',
      type: 'humidity',
      value: 65,
      unit: '%',
      min: 0,
      max: 100,
      threshold: { low: 50, high: 80 },
      status: 'normal',
      lastUpdated: new Date(),
    },
    {
      id: 'moisture-1',
      type: 'moisture',
      value: 72,
      unit: '%',
      min: 0,
      max: 100,
      threshold: { low: 40, high: 85 },
      status: 'normal',
      lastUpdated: new Date(),
    },
    {
      id: 'co2-1',
      type: 'co2',
      value: 420,
      unit: 'ppm',
      min: 300,
      max: 2000,
      threshold: { low: 350, high: 1000 },
      status: 'normal',
      lastUpdated: new Date(),
    },
    {
      id: 'light-1',
      type: 'light',
      value: 850,
      unit: 'lux',
      min: 0,
      max: 2000,
      threshold: { low: 400, high: 1500 },
      status: 'normal',
      lastUpdated: new Date(),
    },
  ]);

  const [plants] = useState<Plant[]>([
    {
      id: 'plant-1',
      name: 'Cherry Tomatoes',
      type: 'vegetable',
      variety: 'Roma',
      zone: 'Zone A',
      plantedDate: new Date('2024-10-15'),
      expectedHarvest: new Date('2025-02-15'),
      growthStage: 68,
      health: 'excellent',
      image: '/vegetables',
      wateringSchedule: 'Daily at 6:00 AM',
      lightRequirement: '6-8 hours',
      temperatureRange: { min: 18, max: 29 },
    },
    {
      id: 'plant-2',
      name: 'Strawberries',
      type: 'fruit',
      variety: 'Albion',
      zone: 'Zone B',
      plantedDate: new Date('2024-11-01'),
      expectedHarvest: new Date('2025-03-01'),
      growthStage: 45,
      health: 'good',
      image: '/fruits',
      wateringSchedule: 'Every 2 days',
      lightRequirement: '8-10 hours',
      temperatureRange: { min: 15, max: 26 },
    },
    {
      id: 'plant-3',
      name: 'Basil',
      type: 'herb',
      variety: 'Sweet Genovese',
      zone: 'Zone C',
      plantedDate: new Date('2024-12-01'),
      expectedHarvest: new Date('2025-01-15'),
      growthStage: 82,
      health: 'excellent',
      image: '/herbs',
      wateringSchedule: 'Daily at 7:00 AM',
      lightRequirement: '6-8 hours',
      temperatureRange: { min: 20, max: 30 },
    },
    {
      id: 'plant-4',
      name: 'Bell Peppers',
      type: 'vegetable',
      variety: 'California Wonder',
      zone: 'Zone A',
      plantedDate: new Date('2024-10-20'),
      expectedHarvest: new Date('2025-02-20'),
      growthStage: 55,
      health: 'good',
      image: '/peppers',
      wateringSchedule: 'Every 2 days',
      lightRequirement: '6-8 hours',
      temperatureRange: { min: 18, max: 32 },
    },
  ]);

  const [devices] = useState<IoTDevice[]>([
    {
      id: 'dev-001',
      name: 'Temperature Sensor A1',
      type: 'sensor',
      deviceType: 'DHT22',
      zone: 'Zone A',
      status: 'online',
      batteryLevel: 85,
      lastSeen: new Date(),
      firmwareVersion: '2.1.4',
      signalStrength: 92,
    },
    {
      id: 'dev-002',
      name: 'Soil Moisture Sensor A1',
      type: 'sensor',
      deviceType: 'Capacitive',
      zone: 'Zone A',
      status: 'online',
      batteryLevel: 72,
      lastSeen: new Date(),
      firmwareVersion: '1.8.2',
      signalStrength: 88,
    },
    {
      id: 'dev-003',
      name: 'CO2 Sensor B1',
      type: 'sensor',
      deviceType: 'MH-Z19',
      zone: 'Zone B',
      status: 'online',
      batteryLevel: 95,
      lastSeen: new Date(),
      firmwareVersion: '3.0.1',
      signalStrength: 95,
    },
    {
      id: 'dev-004',
      name: 'Water Pump Controller',
      type: 'actuator',
      deviceType: 'Relay Module',
      zone: 'Zone A',
      status: 'online',
      batteryLevel: 100,
      lastSeen: new Date(),
      firmwareVersion: '2.0.0',
      signalStrength: 90,
    },
    {
      id: 'dev-005',
      name: 'LED Grow Light Controller',
      type: 'actuator',
      deviceType: 'PWM Controller',
      zone: 'Zone B',
      status: 'warning',
      batteryLevel: 23,
      lastSeen: new Date(Date.now() - 300000),
      firmwareVersion: '1.5.0',
      signalStrength: 65,
    },
    {
      id: 'dev-006',
      name: 'Ventilation Fan Controller',
      type: 'actuator',
      deviceType: 'Variable Speed',
      zone: 'Zone C',
      status: 'online',
      batteryLevel: 100,
      lastSeen: new Date(),
      firmwareVersion: '2.2.1',
      signalStrength: 91,
    },
  ]);

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 'sch-1',
      name: 'Morning Irrigation',
      type: 'irrigation',
      zone: 'Zone A',
      startTime: '06:00',
      endTime: '06:30',
      days: ['Mon', 'Wed', 'Fri'],
      enabled: true,
      lastRun: new Date(Date.now() - 86400000),
      nextRun: new Date(Date.now() + 43200000),
    },
    {
      id: 'sch-2',
      name: 'Grow Lights',
      type: 'lighting',
      zone: 'Zone B',
      startTime: '05:00',
      endTime: '19:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: true,
      lastRun: new Date(),
      nextRun: new Date(Date.now() + 28800000),
    },
    {
      id: 'sch-3',
      name: 'Evening Ventilation',
      type: 'ventilation',
      zone: 'All Zones',
      startTime: '18:00',
      endTime: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: true,
      lastRun: new Date(Date.now() - 21600000),
      nextRun: new Date(Date.now() + 64800000),
    },
  ]);

  const [controls, setControls] = useState<ControlState>({
    irrigation: false,
    lighting: true,
    ventilation: true,
    heating: false,
    cooling: true,
    misting: false,
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-1',
      type: 'warning',
      title: 'Low Battery',
      message: 'LED Grow Light Controller battery at 23%',
      sensorId: 'dev-005',
      timestamp: new Date(Date.now() - 3600000),
      acknowledged: false,
    },
    {
      id: 'alert-2',
      type: 'info',
      title: 'Scheduled Irrigation Complete',
      message: 'Morning irrigation completed successfully for Zone A',
      timestamp: new Date(Date.now() - 43200000),
      acknowledged: true,
    },
  ]);

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  // Generate historical data on mount
  useEffect(() => {
    const data: HistoricalData[] = [];
    const now = Date.now();
    
    for (let i = 168; i >= 0; i--) { // Last 7 days, hourly
      const timestamp = new Date(now - i * 3600000);
      const hourOfDay = timestamp.getHours();
      
      // Simulate day/night temperature variation
      const tempVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 5;
      
      data.push({
        timestamp,
        temperature: 22 + tempVariation + (Math.random() - 0.5) * 2,
        humidity: 65 + (Math.random() - 0.5) * 10,
        moisture: 70 + (Math.random() - 0.5) * 15,
        co2: 450 + (Math.random() - 0.5) * 100,
        light: hourOfDay >= 6 && hourOfDay <= 18 
          ? 800 + (Math.random() - 0.5) * 400 
          : 50 + Math.random() * 50,
      });
    }
    
    setHistoricalData(data);
  }, []);

  // Real-time sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => prev.map(sensor => {
        let newValue: number;
        const now = new Date();
        
        switch (sensor.type) {
          case 'temperature':
            newValue = generateSensorValue(24, 2);
            break;
          case 'humidity':
            newValue = generateSensorValue(65, 5);
            break;
          case 'moisture':
            newValue = generateSensorValue(72, 8);
            break;
          case 'co2':
            newValue = generateSensorValue(420, 50);
            break;
          case 'light':
            newValue = generateSensorValue(850, 100);
            break;
          default:
            newValue = sensor.value;
        }
        
        return {
          ...sensor,
          value: newValue,
          status: getSensorStatus(newValue, sensor.threshold),
          lastUpdated: now,
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const updateControl = useCallback((key: keyof ControlState, value: boolean) => {
    setControls(prev => ({ ...prev, [key]: value }));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const toggleSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.map(schedule =>
      schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
    ));
  }, []);

  return {
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
  };
};
