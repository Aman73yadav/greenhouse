export interface SensorData {
  id: string;
  type: 'temperature' | 'humidity' | 'moisture' | 'light';
  value: number;
  unit: string;
  min: number;
  max: number;
  threshold: { low: number; high: number };
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface Plant {
  id: string;
  name: string;
  type: 'vegetable' | 'fruit' | 'herb';
  variety: string;
  zone: string;
  plantedDate: Date;
  expectedHarvest: Date;
  growthStage: number; // 0-100
  health: 'excellent' | 'good' | 'fair' | 'poor';
  image: string;
  wateringSchedule: string;
  lightRequirement: string;
  temperatureRange: { min: number; max: number };
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'controller';
  deviceType: string;
  zone: string;
  status: 'online' | 'offline' | 'warning';
  batteryLevel: number;
  lastSeen: Date;
  firmwareVersion: string;
  signalStrength: number;
}

export interface Schedule {
  id: string;
  name: string;
  type: 'irrigation' | 'lighting' | 'ventilation' | 'heating';
  zone: string;
  startTime: string;
  endTime: string;
  days: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ControlState {
  irrigation: boolean;
  lighting: boolean;
  ventilation: boolean;
  heating: boolean;
  cooling: boolean;
  misting: boolean;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  sensorId?: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface GrowthStage {
  week: number;
  name: string;
  description: string;
  heightPercentage: number;
}

export interface HistoricalData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  moisture: number;
  co2: number;
  light: number;
}
