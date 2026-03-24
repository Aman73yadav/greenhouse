import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check, Cpu, Wifi, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const WOKWI_PROJECT_URL = 'https://wokwi.com/projects/444855832358838273';
const WOKWI_EMBED_URL = 'https://wokwi.com/projects/444855832358838273';

const WokwiEmbed = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const endpointUrl = `https://ssvjpkddrdkjwofjqmih.supabase.co/functions/v1/sensor-data`;

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const arduinoCode = `#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// API endpoint
const char* endpoint = "${endpointUrl}";
const char* device_id = "YOUR_DEVICE_ID";

#define DHTPIN 2
#define DHTTYPE DHT22
#define LDR_PIN A0
#define SOIL_PIN A1

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected!");
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int soilPercent = map(analogRead(SOIL_PIN), 1023, 0, 0, 100);
  int lightPercent = map(analogRead(LDR_PIN), 1023, 0, 0, 100);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["device_id"] = device_id;
    JsonObject readings = doc.createNestedObject("readings");
    readings["temperature"] = temp;
    readings["humidity"] = hum;
    readings["soil_moisture"] = soilPercent;
    readings["light"] = lightPercent;

    String json;
    serializeJson(doc, json);
    int code = http.POST(json);
    Serial.printf("POST %d: %s\\n", code, http.getString().c_str());
    http.end();
  }
  delay(5000);
}`;

  const curlExample = `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "YOUR_DEVICE_ID",
    "readings": {
      "temperature": 25.5,
      "humidity": 60,
      "soil_moisture": 45,
      "light": 70
    }
  }'`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Wokwi Simulator</h3>
            <p className="text-sm text-muted-foreground">Smart Greenhouse Circuit</p>
          </div>
        </div>
        <a href={WOKWI_PROJECT_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open in Wokwi
          </Button>
        </a>
      </div>

      {/* Wokwi Embed */}
      <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
        <iframe
          src={WOKWI_EMBED_URL}
          className="w-full border-0"
          style={{ height: '500px' }}
          allow="fullscreen"
          title="Wokwi Smart Greenhouse Simulator"
        />
      </div>

      {/* Connection Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* API Endpoint */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">API Endpoint</span>
            <Badge variant="secondary" className="text-xs">POST</Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-background px-3 py-2 rounded-lg border border-border flex-1 overflow-x-auto font-mono">
              {endpointUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => handleCopy(endpointUrl, 'Endpoint')}
            >
              {copied === 'Endpoint' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            <p>Send sensor data via POST with <code className="bg-muted px-1 rounded">device_id</code> and <code className="bg-muted px-1 rounded">readings</code> object.</p>
          </div>
        </div>

        {/* Payload Format */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <span className="text-sm font-medium">Expected Payload</span>
          <pre className="text-xs bg-background p-3 rounded-lg border border-border overflow-x-auto font-mono">
{`{
  "device_id": "your-device-id",
  "readings": {
    "temperature": 25.5,
    "humidity": 60,
    "soil_moisture": 45,
    "light": 70
  }
}`}
          </pre>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Quick Test (cURL)</h4>
        <div className="relative">
          <pre className="text-xs bg-muted/30 p-4 rounded-xl border border-border overflow-x-auto font-mono max-h-32">
            <code>{curlExample}</code>
          </pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => handleCopy(curlExample, 'cURL')}
          >
            {copied === 'cURL' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">ESP32 Arduino Code (WiFi-enabled)</h4>
          <Button variant="ghost" size="sm" onClick={() => handleCopy(arduinoCode, 'Arduino')}>
            {copied === 'Arduino' ? <Check className="w-3 h-3 mr-1 text-success" /> : <Copy className="w-3 h-3 mr-1" />}
            Copy
          </Button>
        </div>
        <pre className="text-xs bg-muted/30 p-4 rounded-xl border border-border overflow-x-auto font-mono max-h-48 overflow-y-auto">
          <code>{arduinoCode}</code>
        </pre>
        <p className="text-xs text-muted-foreground">
          💡 Note: Your current Wokwi project uses Arduino UNO (no WiFi). To send data to the cloud, switch to an ESP32 board in Wokwi, or use the circuit simulator on this page to test locally.
        </p>
      </div>
    </motion.div>
  );
};

export default WokwiEmbed;
