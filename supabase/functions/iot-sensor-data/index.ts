import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-api-key',
}

interface SensorReading {
  sensor_type: 'temperature' | 'humidity' | 'moisture' | 'co2' | 'light';
  value: number;
  unit: string;
}

interface IoTPayload {
  device_id: string;
  api_key: string;
  readings: SensorReading[];
  battery_level?: number;
  signal_strength?: number;
  firmware_version?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const payload: IoTPayload = await req.json();
      
      console.log('Received IoT data:', JSON.stringify(payload));
      
      // Validate required fields
      if (!payload.device_id || !payload.api_key || !payload.readings) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: device_id, api_key, readings' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify device API key
      const { data: device, error: deviceError } = await supabase
        .from('iot_devices')
        .select('id, greenhouse_id, name')
        .eq('device_id', payload.device_id)
        .eq('api_key', payload.api_key)
        .maybeSingle();

      if (deviceError || !device) {
        console.error('Device authentication failed:', deviceError);
        return new Response(
          JSON.stringify({ error: 'Invalid device credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Device authenticated:', device.name);

      // Update device status
      const { error: updateError } = await supabase
        .from('iot_devices')
        .update({
          status: 'online',
          last_seen: new Date().toISOString(),
          battery_level: payload.battery_level ?? 100,
          signal_strength: payload.signal_strength ?? 100,
          firmware_version: payload.firmware_version,
        })
        .eq('id', device.id);

      if (updateError) {
        console.error('Failed to update device status:', updateError);
      }

      // Insert sensor readings
      const readings = payload.readings.map((reading) => ({
        device_id: device.id,
        sensor_type: reading.sensor_type,
        value: reading.value,
        unit: reading.unit,
        timestamp: new Date().toISOString(),
      }));

      const { data: insertedReadings, error: readingsError } = await supabase
        .from('sensor_readings')
        .insert(readings)
        .select();

      if (readingsError) {
        console.error('Failed to insert readings:', readingsError);
        return new Response(
          JSON.stringify({ error: 'Failed to store sensor readings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check thresholds and create alerts
      for (const reading of payload.readings) {
        let alertType: string | null = null;
        let alertTitle = '';
        let alertMessage = '';

        if (reading.sensor_type === 'temperature') {
          if (reading.value > 35) {
            alertType = 'critical';
            alertTitle = 'High Temperature Alert';
            alertMessage = `Temperature reading of ${reading.value}°C exceeds safe threshold`;
          } else if (reading.value < 10) {
            alertType = 'warning';
            alertTitle = 'Low Temperature Warning';
            alertMessage = `Temperature reading of ${reading.value}°C is below optimal range`;
          }
        } else if (reading.sensor_type === 'humidity') {
          if (reading.value > 90 || reading.value < 30) {
            alertType = 'warning';
            alertTitle = 'Humidity Alert';
            alertMessage = `Humidity at ${reading.value}% is outside optimal range (30-90%)`;
          }
        } else if (reading.sensor_type === 'moisture') {
          if (reading.value < 20) {
            alertType = 'critical';
            alertTitle = 'Low Soil Moisture';
            alertMessage = `Soil moisture at ${reading.value}% - irrigation needed`;
          }
        } else if (reading.sensor_type === 'co2') {
          if (reading.value > 1500) {
            alertType = 'warning';
            alertTitle = 'High CO2 Levels';
            alertMessage = `CO2 levels at ${reading.value}ppm - ventilation recommended`;
          }
        }

        if (alertType && device.greenhouse_id) {
          await supabase.from('alerts').insert({
            greenhouse_id: device.greenhouse_id,
            type: alertType,
            title: alertTitle,
            message: alertMessage,
            sensor_id: device.id,
          });
        }
      }

      console.log('Successfully stored', insertedReadings?.length, 'readings');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sensor data received',
          readings_stored: insertedReadings?.length || 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
