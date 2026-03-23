import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Accepts the Wokwi ESP32 payload format:
// { "device_id": "uuid", "readings": { "temperature": 24.5, "humidity": 65, "soil_moisture": 72, "light": 850, "co2": 420 } }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndXhpenNiZHFobmlka29qdGZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI1NDc3NSwiZXhwIjoyMDg5ODMwNzc1fQ.PZpiSIWKd5cJP51AY1VWgIoB1KMF6DjgIbwTkAnaWcY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const payload = await req.json();
      console.log('Received Wokwi data:', JSON.stringify(payload));

      if (!payload.device_id || !payload.readings) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: device_id, readings' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { readings, device_id } = payload;

      // Map Wokwi sensor names to our sensor types and units
      const sensorMap: Record<string, { sensor_type: string; unit: string }> = {
        temperature: { sensor_type: 'temperature', unit: '°C' },
        humidity: { sensor_type: 'humidity', unit: '%' },
        soil_moisture: { sensor_type: 'moisture', unit: '%' },
        light: { sensor_type: 'light', unit: '%' },
      };

      // Try to find a matching device, or use a default approach
      const { data: device } = await supabase
        .from('iot_devices')
        .select('id, greenhouse_id, name')
        .eq('device_id', device_id)
        .maybeSingle();

      const now = new Date().toISOString();
      const sensorReadings = [];

      for (const [key, value] of Object.entries(readings)) {
        const mapping = sensorMap[key];
        if (mapping && typeof value === 'number') {
          sensorReadings.push({
            device_id: device?.id || null,
            sensor_type: mapping.sensor_type,
            value: value,
            unit: mapping.unit,
            timestamp: now,
          });
        }
      }

      if (sensorReadings.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid readings found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: inserted, error: insertError } = await supabase
        .from('sensor_readings')
        .insert(sensorReadings)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store readings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update device last_seen if found
      if (device) {
        await supabase
          .from('iot_devices')
          .update({ status: 'online', last_seen: now })
          .eq('id', device.id);
      }

      // Check thresholds and create alerts
      if (device?.greenhouse_id) {
        if (readings.temperature > 35) {
          await supabase.from('alerts').insert({
            greenhouse_id: device.greenhouse_id,
            type: 'critical',
            title: 'High Temperature Alert',
            message: `Temperature reading of ${readings.temperature}°C exceeds safe threshold`,
            sensor_id: device.id,
          });
        }
        if (readings.soil_moisture < 20) {
          await supabase.from('alerts').insert({
            greenhouse_id: device.greenhouse_id,
            type: 'critical',
            title: 'Low Soil Moisture',
            message: `Soil moisture at ${readings.soil_moisture}% - irrigation needed`,
            sensor_id: device.id,
          });
        }
        if (readings.co2 > 1500) {
          await supabase.from('alerts').insert({
            greenhouse_id: device.greenhouse_id,
            type: 'warning',
            title: 'High CO2 Levels',
            message: `CO2 at ${readings.co2}ppm - ventilation recommended`,
            sensor_id: device.id,
          });
        }
      }

      console.log('Stored', inserted?.length, 'readings');

      return new Response(
        JSON.stringify({ success: true, readings_stored: inserted?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: return latest readings
    if (req.method === 'GET') {
      // Get the latest reading for each sensor type
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch readings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
