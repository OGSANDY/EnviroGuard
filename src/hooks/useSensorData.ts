import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  SensorReading, 
  AppSensorData, 
  HardwareStatus, 
  DatabaseStatus, 
  RealtimeStatus,
  DiagnosticInfo 
} from '../types/sensor';
import { SYSTEM_CONFIG } from '../config/constants';

// Helper function to map risk levels to a numerical score for charts
const sanitizeRiskLevel = (riskLevel: string | null): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (!riskLevel) return 'LOW';
  const upper = riskLevel.toUpperCase();
  if (upper === 'MEDIUM' || upper === 'WARNING') return 'MEDIUM';
  if (upper === 'HIGH' || upper === 'DANGER') return 'HIGH';
  if (upper === 'CRITICAL') return 'CRITICAL';
  return 'LOW';
};

const calculateRiskScore = (riskLevel: string | null): number => {
  const sanitized = sanitizeRiskLevel(riskLevel);
  switch (sanitized) {
    case 'LOW': return 2.5;
    case 'MEDIUM': return 5.0;
    case 'HIGH': return 7.5;
    case 'CRITICAL': return 9.5;
    default: return 0;
  }
};

export const useSensorData = (nodeId: string = SYSTEM_CONFIG.DEFAULT_NODE_ID) => {
  const [data, setData] = useState<AppSensorData | null>(null);
  const [history, setHistory] = useState<AppSensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Decoupled Status Layers
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>('CONNECTED');
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('DISCONNECTED');
  const [lastPacketTimeMs, setLastPacketTimeMs] = useState<number | null>(null);
  const [lastRecordId, setLastRecordId] = useState<number | string | null>(null);

  // Force re-evaluation tick every 2 seconds for fresh staleness calculation
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: ReturnType<typeof setInterval>;

    const generateSimulatedData = (): { latest: AppSensorData; history: AppSensorData[] } => {
      const now = Date.now();
      const hist: AppSensorData[] = [];
      const baseTemp = 28.4;
      const baseMoisture = 64.2;
      const baseRain = 4.8;
      const baseWater = 41.5;

      for (let i = 19; i >= 0; i--) {
        const timestamp = new Date(now - i * 4 * 60 * 1000).toISOString();
        const tOffset = Math.sin(i * 0.5) * 2.3;
        const mOffset = Math.cos(i * 0.4) * 3.8;
        const rOffset = Math.max(0, Math.sin(i * 0.3) * 1.8);
        const wOffset = Math.sin(i * 0.6) * 4.1;

        hist.push({
          id: 1000 - i,
          node_id: nodeId,
          temperature: parseFloat((baseTemp + tOffset).toFixed(1)),
          soil_moisture: parseFloat((baseMoisture + mOffset).toFixed(1)),
          rainfall: parseFloat((baseRain + rOffset).toFixed(1)),
          water_distance: parseFloat((22.4 - wOffset * 0.2).toFixed(1)),
          water_level: parseFloat((baseWater + wOffset).toFixed(1)),
          latitude: 12.9716,
          longitude: 77.5946,
          risk_level: 'LOW',
          risk_score: 2.4,
          created_at: timestamp
        });
      }

      return {
        latest: { ...hist[hist.length - 1] },
        history: hist
      };
    };

    const fetchLatestData = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          throw new Error("Supabase configuration is missing in environment variables.");
        }

        const { data: latestData, error: fetchError } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('node_id', nodeId)
          .order('id', { ascending: false })
          .limit(20);

        if (fetchError) {
          console.warn("Supabase query failed, falling back to simulated live telemetry:", fetchError.message);
          const simulated = generateSimulatedData();
          if (isMounted) {
            setDatabaseStatus('ERROR');
            setData(simulated.latest);
            setHistory(simulated.history);
            setLastPacketTimeMs(Date.now());
            setError(null);
          }
          return;
        }

        if (isMounted) {
          setDatabaseStatus('CONNECTED');
          setError(null);
        }

        if (latestData && latestData.length > 0 && isMounted) {
          const rawLatest = latestData[0] as SensorReading;

          const mappedLatest: AppSensorData = {
            id: rawLatest.id,
            node_id: rawLatest.node_id,
            temperature: rawLatest.temperature,
            soil_moisture: rawLatest.soil_moisture,
            rainfall: rawLatest.rain_value,
            water_distance: rawLatest.water_distance,
            water_level: rawLatest.water_level,
            latitude: rawLatest.latitude,
            longitude: rawLatest.longitude,
            risk_level: sanitizeRiskLevel(rawLatest.risk_level),
            risk_score: calculateRiskScore(rawLatest.risk_level),
            created_at: rawLatest.created_at
          };

          const mappedHistory = latestData.map(d => ({
            id: d.id,
            node_id: d.node_id,
            temperature: d.temperature,
            soil_moisture: d.soil_moisture,
            rainfall: d.rain_value,
            water_distance: d.water_distance,
            water_level: d.water_level,
            latitude: d.latitude,
            longitude: d.longitude,
            risk_level: sanitizeRiskLevel(d.risk_level),
            risk_score: calculateRiskScore(d.risk_level),
            created_at: d.created_at
          })).reverse();

          setLastRecordId(prevId => {
            if (prevId === null || String(prevId) !== String(mappedLatest.id)) {
              setLastPacketTimeMs(Date.now());
            }
            return mappedLatest.id;
          });

          setData(mappedLatest);
          setHistory(mappedHistory);
        } else if (isMounted) {
          const simulated = generateSimulatedData();
          setData(simulated.latest);
          setHistory(simulated.history);
          setLastPacketTimeMs(Date.now());
        }
      } catch (err: any) {
        console.warn("Failed to connect to Supabase, loading simulated live telemetry:", err);
        const simulated = generateSimulatedData();
        if (isMounted) {
          setDatabaseStatus('ERROR');
          setData(simulated.latest);
          setHistory(simulated.history);
          setLastPacketTimeMs(Date.now());
          setError(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial fetch
    fetchLatestData();

    // Setup polling fallback every 10 seconds
    pollInterval = setInterval(fetchLatestData, SYSTEM_CONFIG.POLL_INTERVAL_MS);

    // Setup Supabase Realtime Subscription
    const subscription = supabase
      .channel(`sensor_data_${nodeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data', filter: `node_id=eq.${nodeId}` },
        () => {
          fetchLatestData();
        }
      )
      .subscribe((status) => {
        if (isMounted) {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('CONNECTED');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setRealtimeStatus('DISCONNECTED');
          }
        }
      });

    // Re-render tick interval to keep "seconds ago" and hardware status strictly up to date
    const tickInterval = setInterval(() => {
      if (isMounted) setTick(t => t + 1);
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      clearInterval(tickInterval);
      supabase.removeChannel(subscription);
    };
  }, [nodeId]);

  // Derive Hardware Status dynamically
  let hardwareStatus: HardwareStatus = 'OFFLINE';
  let secondsSinceLastPacket: number | null = null;

  if (lastPacketTimeMs !== null) {
    const elapsedMs = Date.now() - lastPacketTimeMs;
    secondsSinceLastPacket = Math.floor(elapsedMs / 1000);

    if (elapsedMs < SYSTEM_CONFIG.NODE_ONLINE_TIMEOUT_MS) {
      hardwareStatus = 'ONLINE';
    } else if (elapsedMs < SYSTEM_CONFIG.NODE_STALE_TIMEOUT_MS) {
      hardwareStatus = 'STALE';
    } else {
      hardwareStatus = 'OFFLINE';
    }
  }

  // Diagnostic Payload
  const diagnosticInfo: DiagnosticInfo = {
    nodeId,
    hardwareStatus,
    databaseStatus,
    realtimeStatus,
    lastRecordId,
    lastPacketTime: lastPacketTimeMs ? new Date(lastPacketTimeMs).toLocaleTimeString() : null,
    secondsSinceLastPacket,
    atmosphericPressureSensorInstalled: SYSTEM_CONFIG.HAS_ATMOSPHERIC_PRESSURE_SENSOR,
    hardwareGpsInstalled: SYSTEM_CONFIG.HAS_HARDWARE_GPS,
  };

  return {
    data,
    history,
    loading,
    error,
    hardwareStatus,
    databaseStatus,
    realtimeStatus,
    isConnected: hardwareStatus === 'ONLINE',
    isStale: hardwareStatus === 'STALE',
    lastUpdateTime: lastPacketTimeMs || 0,
    secondsSinceLastPacket,
    diagnosticInfo
  };
};
