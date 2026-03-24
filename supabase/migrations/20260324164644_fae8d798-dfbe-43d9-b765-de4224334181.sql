CREATE POLICY "Users can view test readings with null device" 
ON public.sensor_readings 
FOR SELECT 
TO authenticated 
USING (device_id IS NULL);