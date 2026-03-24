import { useState } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PRESETS = [
  { label: '🌡️ Normal', readings: { temperature: 24.5, humidity: 60, soil_moisture: 55, light: 70 } },
  { label: '🔥 Hot & Dry', readings: { temperature: 38, humidity: 20, soil_moisture: 12, light: 95 } },
  { label: '🌧️ Cool & Wet', readings: { temperature: 16, humidity: 88, soil_moisture: 85, light: 30 } },
  { label: '🌴 Tropical', readings: { temperature: 32, humidity: 85, soil_moisture: 75, light: 70 } },
];

const SendTestData = () => {
  const [sending, setSending] = useState<string | null>(null);

  const sendData = async (label: string, readings: Record<string, number>) => {
    setSending(label);
    try {
      const { data, error } = await supabase.functions.invoke('sensor-data', {
        method: 'POST',
        body: {
          device_id: 'test-dashboard-device',
          readings,
        },
      });

      if (error) throw error;

      toast.success(`Test data sent! ${data?.readings_stored || 0} readings stored.`);
    } catch (err: any) {
      toast.error(`Failed to send: ${err.message || 'Unknown error'}`);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-display font-bold">Send Test Data</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={sending !== null}
            onClick={() => sendData(p.label, p.readings)}
          >
            {sending === p.label ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Send className="w-3 h-3 mr-1" />
            )}
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SendTestData;
