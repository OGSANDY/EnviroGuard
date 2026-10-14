import { supabase } from '../lib/supabase';
import type { SensorReading } from '../types/sensor';

export const sensorService = {
  async getLatestReadings(): Promise<SensorReading[]> {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching sensor readings:', error);
      return [];
    }

    return data as SensorReading[];
  }
};
