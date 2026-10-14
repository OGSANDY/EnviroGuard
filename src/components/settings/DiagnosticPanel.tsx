import React from 'react';
import { useSensorData } from '../../hooks/useSensorData';
import { 
  Activity, 
  Database, 
  Radio, 
  Cpu, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const DiagnosticPanel: React.FC = () => {
  const { 
    data, 
    hardwareStatus, 
    databaseStatus, 
    realtimeStatus, 
    secondsSinceLastPacket, 
    diagnosticInfo 
  } = useSensorData('NODE-01');

  const getHardwareBadge = () => {
    switch (hardwareStatus) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            ONLINE
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            STALE (Delayed)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            OFFLINE
          </span>
        );
    }
  };

  const getDbBadge = () => {
    if (databaseStatus === 'CONNECTED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          CONNECTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
        <XCircle className="w-3.5 h-3.5 mr-1" />
        ERROR
      </span>
    );
  };

  const getRealtimeBadge = () => {
    if (realtimeStatus === 'CONNECTED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Radio className="w-3.5 h-3.5 mr-1 animate-pulse text-purple-600" />
          SYNCED (Live)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
        <Radio className="w-3.5 h-3.5 mr-1 text-orange-500" />
        POLLING FALLBACK
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <Cpu className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-gray-900">System Technical Diagnostics</h2>
        </div>
        <span className="text-xs font-mono font-bold text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
          Node: {diagnosticInfo.nodeId}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Decoupled Multi-Layer Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ESP32 Hardware</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div>{getHardwareBadge()}</div>
            <div className="text-[11px] text-gray-500 mt-2 font-medium">
              {secondsSinceLastPacket !== null 
                ? `Last packet received ${secondsSinceLastPacket}s ago` 
                : 'No packets received yet'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supabase REST DB</span>
              <Database className="w-4 h-4 text-gray-400" />
            </div>
            <div>{getDbBadge()}</div>
            <div className="text-[11px] text-gray-500 mt-2 font-medium">
              Latest Record ID: {diagnosticInfo.lastRecordId || 'N/A'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Realtime Subscription</span>
              <Radio className="w-4 h-4 text-gray-400" />
            </div>
            <div>{getRealtimeBadge()}</div>
            <div className="text-[11px] text-gray-500 mt-2 font-medium">
              {realtimeStatus === 'CONNECTED' 
                ? 'WebSocket sync active' 
                : 'Falling back to 10s DB polling'}
            </div>
          </div>
        </div>

        {/* Diagnostic Metadata & Capabilities Table */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Hardware & Sensor Capabilities Audit</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Atmospheric Pressure Sensor</span>
              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Not Installed
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Hardware GPS Module</span>
              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Not Installed (Browser Demo)
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Edge AI Decision Engine</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                ESP32 Decision Tree (`model.h`)
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Ultrasonic Water Level Formula</span>
              <span className="font-mono text-[11px] text-gray-700 font-semibold">
                ((30cm - D) / 30cm) × 100
              </span>
            </div>
          </div>
        </div>

        {/* Latest Raw Database Values */}
        {data && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Latest Live Database Payload</h3>
              <span className="text-[11px] font-mono text-gray-500">Record #{data.id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <div className="text-gray-400 text-[10px] uppercase font-sans">Temp</div>
                <div className="font-bold text-gray-900">{data.temperature ?? 'N/A'} °C</div>
              </div>

              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <div className="text-gray-400 text-[10px] uppercase font-sans">Soil</div>
                <div className="font-bold text-gray-900">{data.soil_moisture ?? 'N/A'} %</div>
              </div>

              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <div className="text-gray-400 text-[10px] uppercase font-sans">Rain Index</div>
                <div className="font-bold text-gray-900">{data.rainfall ?? 'N/A'} %</div>
              </div>

              <div className="p-2 bg-gray-50 rounded border border-gray-100">
                <div className="text-gray-400 text-[10px] uppercase font-sans">Water Level</div>
                <div className="font-bold text-gray-900">{data.water_level ?? 'N/A'} %</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
