export interface SensorReading {
  id: number | string;
  node_id: string;
  temperature: number | null;
  soil_moisture: number | null;
  rain_value: number | null;
  water_distance: number | null;
  water_level: number | null;
  latitude: number | null;
  longitude: number | null;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  created_at: string | null;
}

// Helper interface for the frontend to consume
export interface AppSensorData extends Omit<SensorReading, 'rain_value' | 'water_distance'> {
  rainfall: number | null; // Mapped from rain_value
  water_distance: number | null;
  risk_score: number; // Calculated or derived
}

export type HardwareStatus = 'ONLINE' | 'STALE' | 'OFFLINE';
export type DatabaseStatus = 'CONNECTED' | 'ERROR';
export type RealtimeStatus = 'CONNECTED' | 'DISCONNECTED';

export interface DiagnosticInfo {
  nodeId: string;
  hardwareStatus: HardwareStatus;
  databaseStatus: DatabaseStatus;
  realtimeStatus: RealtimeStatus;
  lastRecordId: number | string | null;
  lastPacketTime: string | null;
  secondsSinceLastPacket: number | null;
  atmosphericPressureSensorInstalled: boolean;
  hardwareGpsInstalled: boolean;
}
