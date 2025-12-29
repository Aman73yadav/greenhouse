import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Cpu, 
  Key, 
  Copy, 
  Check,
  Wifi,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface DeviceRegistrationProps {
  onDeviceRegistered?: (device: NewDevice) => void;
}

interface NewDevice {
  name: string;
  deviceType: string;
  zone: string;
  apiKey: string;
  deviceId: string;
}

const deviceTypes = [
  { value: 'DHT22', label: 'DHT22 Temperature/Humidity', icon: Thermometer },
  { value: 'Soil-Capacitive', label: 'Capacitive Soil Moisture', icon: Droplets },
  { value: 'MH-Z19', label: 'MH-Z19 CO2 Sensor', icon: Wind },
  { value: 'BMP280', label: 'BMP280 Pressure Sensor', icon: Wifi },
  { value: 'TSL2561', label: 'TSL2561 Light Sensor', icon: Cpu },
  { value: 'Relay-Module', label: 'Relay Control Module', icon: Cpu },
];

const zones = ['Zone A', 'Zone B', 'Zone C', 'All Zones'];

const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = '';
    for (let i = 0; i < 8; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return `sgk_${segments.join('_')}`;
};

const generateDeviceId = (): string => {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `dev-${hex()}${hex()}-${hex()}${hex()}-${hex()}${hex()}`;
};

const DeviceRegistration = ({ onDeviceRegistered }: DeviceRegistrationProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [copied, setCopied] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    deviceType: '',
    zone: '',
  });
  
  const [generatedDevice, setGeneratedDevice] = useState<NewDevice | null>(null);

  const handleSubmit = () => {
    if (!formData.name || !formData.deviceType || !formData.zone) {
      toast.error('Please fill in all fields');
      return;
    }

    const newDevice: NewDevice = {
      ...formData,
      apiKey: generateApiKey(),
      deviceId: generateDeviceId(),
    };

    setGeneratedDevice(newDevice);
    setStep('success');
    onDeviceRegistered?.(newDevice);
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('form');
      setFormData({ name: '', deviceType: '', zone: '' });
      setGeneratedDevice(null);
    }, 200);
  };

  const pythonCode = generatedDevice ? `
import requests
import time
from dht import DHT22
from machine import Pin

# Device Configuration
API_ENDPOINT = "${window.location.origin}/api/iot-sensor-data"
API_KEY = "${generatedDevice.apiKey}"
DEVICE_ID = "${generatedDevice.deviceId}"

# Sensor setup
sensor = DHT22(Pin(4))

def send_reading(sensor_type, value, unit):
    data = {
        "device_id": DEVICE_ID,
        "sensor_type": sensor_type,
        "value": value,
        "unit": unit
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(API_ENDPOINT, json=data, headers=headers)
        print(f"Sent {sensor_type}: {value}{unit} - Status: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

while True:
    sensor.measure()
    send_reading("temperature", sensor.temperature(), "°C")
    send_reading("humidity", sensor.humidity(), "%")
    time.sleep(60)  # Send every minute
`.trim() : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full p-4 border-2 border-dashed border-glass-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Register New Device
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Register IoT Device
              </DialogTitle>
              <DialogDescription>
                Add a new IoT device to your greenhouse. An API key will be automatically generated.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  placeholder="e.g., Temperature Sensor A1"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device-type">Device Type</Label>
                <Select
                  value={formData.deviceType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, deviceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Select
                  value={formData.zone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, zone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Generate API Key
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-success">
                <Check className="w-5 h-5" />
                Device Registered Successfully
              </DialogTitle>
              <DialogDescription>
                Save these credentials securely. The API key will not be shown again.
              </DialogDescription>
            </DialogHeader>
            
            {generatedDevice && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Device ID</p>
                      <p className="font-mono text-sm">{generatedDevice.deviceId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(generatedDevice.deviceId, 'Device ID')}
                    >
                      {copied === 'Device ID' ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">API Key</p>
                      <p className="font-mono text-sm break-all">{generatedDevice.apiKey}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => handleCopy(generatedDevice.apiKey, 'API Key')}
                    >
                      {copied === 'API Key' ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Raspberry Pi Example Code</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(pythonCode, 'Code')}
                    >
                      {copied === 'Code' ? (
                        <Check className="w-4 h-4 mr-1 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <div className="relative">
                    <pre className="p-3 rounded-lg bg-muted/50 text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                      <code>{pythonCode}</code>
                    </pre>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-warning mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-warning">Important</p>
                      <p className="text-muted-foreground">
                        Store this API key securely. You won't be able to see it again after closing this dialog.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeviceRegistration;
