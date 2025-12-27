-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create greenhouses table
CREATE TABLE public.greenhouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.greenhouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own greenhouses" ON public.greenhouses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own greenhouses" ON public.greenhouses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own greenhouses" ON public.greenhouses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own greenhouses" ON public.greenhouses FOR DELETE USING (auth.uid() = user_id);

-- Create IoT devices table
CREATE TABLE public.iot_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  zone TEXT,
  api_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline',
  battery_level INTEGER DEFAULT 100,
  firmware_version TEXT,
  signal_strength INTEGER DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view devices in their greenhouses" ON public.iot_devices 
FOR SELECT USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create devices in their greenhouses" ON public.iot_devices 
FOR INSERT WITH CHECK (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update devices in their greenhouses" ON public.iot_devices 
FOR UPDATE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete devices in their greenhouses" ON public.iot_devices 
FOR DELETE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);

-- Create sensor readings table
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.iot_devices(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view readings from their devices" ON public.sensor_readings 
FOR SELECT USING (
  device_id IN (
    SELECT d.id FROM public.iot_devices d 
    JOIN public.greenhouses g ON d.greenhouse_id = g.id 
    WHERE g.user_id = auth.uid()
  )
);

-- Allow public insert for IoT API (authenticated via API key in edge function)
CREATE POLICY "Allow insert via API" ON public.sensor_readings FOR INSERT WITH CHECK (true);

-- Create plants table
CREATE TABLE public.plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  variety TEXT,
  zone TEXT,
  planted_date DATE,
  expected_harvest DATE,
  growth_stage INTEGER DEFAULT 0,
  health TEXT DEFAULT 'good',
  image_url TEXT,
  watering_schedule TEXT,
  light_requirement TEXT,
  temp_min DECIMAL,
  temp_max DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view plants in their greenhouses" ON public.plants 
FOR SELECT USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create plants in their greenhouses" ON public.plants 
FOR INSERT WITH CHECK (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update plants in their greenhouses" ON public.plants 
FOR UPDATE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete plants in their greenhouses" ON public.plants 
FOR DELETE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  zone TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules in their greenhouses" ON public.schedules 
FOR SELECT USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create schedules" ON public.schedules 
FOR INSERT WITH CHECK (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update schedules" ON public.schedules 
FOR UPDATE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete schedules" ON public.schedules 
FOR DELETE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);

-- Create control states table
CREATE TABLE public.control_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE CASCADE UNIQUE,
  irrigation BOOLEAN DEFAULT false,
  lighting BOOLEAN DEFAULT false,
  ventilation BOOLEAN DEFAULT false,
  heating BOOLEAN DEFAULT false,
  cooling BOOLEAN DEFAULT false,
  misting BOOLEAN DEFAULT false,
  target_temperature DECIMAL DEFAULT 24,
  target_humidity DECIMAL DEFAULT 65,
  target_moisture DECIMAL DEFAULT 45,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.control_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their control states" ON public.control_states 
FOR SELECT USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update their control states" ON public.control_states 
FOR UPDATE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert control states" ON public.control_states 
FOR INSERT WITH CHECK (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sensor_id UUID REFERENCES public.iot_devices(id),
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their alerts" ON public.alerts 
FOR SELECT USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update their alerts" ON public.alerts 
FOR UPDATE USING (
  greenhouse_id IN (SELECT id FROM public.greenhouses WHERE user_id = auth.uid())
);
CREATE POLICY "Allow insert via API" ON public.alerts FOR INSERT WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_greenhouses_updated_at BEFORE UPDATE ON public.greenhouses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON public.plants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_control_states_updated_at BEFORE UPDATE ON public.control_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for sensor readings
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;