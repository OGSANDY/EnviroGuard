import { useState } from 'react';
import { 
  Bell, 
  Save, 
  RotateCcw, 
  Settings as SettingsIcon,
  Sliders,
  MapPin,
  Database,
  Navigation,
  CheckCircle2,
  RefreshCw,
  Wifi,
  Thermometer,
  CloudRain,
  Sprout,
  Waves,
  AlertOctagon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSensorData } from '../hooks/useSensorData';
import { DiagnosticPanel } from '../components/settings/DiagnosticPanel';

// Helper component for styled Toggles
const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    className={cn(
      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
      enabled ? "bg-emerald-500" : "bg-gray-200"
    )}
    onClick={() => onChange(!enabled)}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        enabled ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

const defaultThresholds = {
  tempMin: 20,
  tempMax: 35,
  soilMin: 40,
  soilMax: 80,
  rainfallWarning: 10,
  waterWarning: 80
};

const Settings = () => {
  const { isConnected } = useSensorData('NODE-01');

  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [samplingFrequency, setSamplingFrequency] = useState('10');
  
  const [thresholds, setThresholds] = useState(defaultThresholds);
  
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [highAlerts, setHighAlerts] = useState(true);
  const [mediumAlerts, setMediumAlerts] = useState(true);
  const [lowAlerts, setLowAlerts] = useState(true);
  const [dashboardNotif, setDashboardNotif] = useState(true);
  const [browserNotif, setBrowserNotif] = useState(true);

  const [saveMessage, setSaveMessage] = useState('');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date());

  const handleSave = () => {
    setSaveMessage('Settings saved successfully.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleReset = () => {
    setThresholds(defaultThresholds);
    setMonitoringEnabled(true);
    setSamplingFrequency('10');
    setAlertsEnabled(true);
    setHighAlerts(true);
    setMediumAlerts(true);
    setLowAlerts(true);
    setDashboardNotif(true);
    setBrowserNotif(true);
  };

  const handleTestConnection = () => {
    setConnectionMessage('Testing connection...');
    setTimeout(() => {
      if (isConnected) {
        setConnectionMessage('Connection Successful: Supabase responding normally.');
      } else {
        setConnectionMessage('Connection Failed: Unable to reach database.');
      }
      setTimeout(() => setConnectionMessage(''), 4000);
    }, 1500);
  };

  const handleRefreshStatus = () => {
    setLastUpdatedTime(new Date());
  };

  const handleUpdateLocation = () => {
    // Demo interaction
    alert("Location update requested. (Demo interaction)");
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(lastUpdatedTime);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">System Configuration</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-xs font-bold text-gray-500 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm uppercase tracking-wide">
            Last Updated: <span className="text-gray-900 ml-1">{formattedDate}</span>
          </div>
          <button className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm transition-all">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          {/* SECTION 1 — SYSTEM CONFIGURATION */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
              <SettingsIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-base font-bold text-gray-900">System Configuration</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">Monitoring Status</div>
                  <div className="text-xs text-gray-500 mt-0.5">Enable environmental monitoring and sensor data collection.</div>
                </div>
                <Toggle enabled={monitoringEnabled} onChange={setMonitoringEnabled} />
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">Sampling Frequency</div>
                  <div className="text-xs text-gray-500 mt-0.5">How often sensor readings are updated.</div>
                </div>
                <select 
                  value={samplingFrequency} 
                  onChange={(e) => setSamplingFrequency(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-2"
                >
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <div className="text-sm font-bold text-gray-900 mb-3">Monitoring Node</div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Node ID</span>
                    <span className="font-bold text-gray-900">NODE-01</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Connection</span>
                    <span className="font-semibold text-gray-700">Supabase DB</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Status</span>
                    {isConnected ? (
                      <span className="font-bold text-emerald-600 flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                        Online
                      </span>
                    ) : (
                      <span className="font-bold text-red-600 flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — RISK THRESHOLDS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
              <Sliders className="w-5 h-5 text-gray-500" />
              <h2 className="text-base font-bold text-gray-900">Risk Thresholds</h2>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-xs text-gray-500 mb-4">These values determine when EnviroGuard considers a sensor reading abnormal.</p>
              
              <div className="space-y-4">
                {/* Temperature */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Thermometer className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-semibold text-gray-900">Temperature (°C) Normal Range</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="number" value={thresholds.tempMin} onChange={e => setThresholds({...thresholds, tempMin: Number(e.target.value)})} className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 text-center" />
                    <span className="text-gray-400 font-medium">to</span>
                    <input type="number" value={thresholds.tempMax} onChange={e => setThresholds({...thresholds, tempMax: Number(e.target.value)})} className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 text-center" />
                  </div>
                </div>

                {/* Soil Moisture */}
                <div className="pt-3 border-t border-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sprout className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-semibold text-gray-900">Soil Moisture (%) Normal Range</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="number" value={thresholds.soilMin} onChange={e => setThresholds({...thresholds, soilMin: Number(e.target.value)})} className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 text-center" />
                    <span className="text-gray-400 font-medium">to</span>
                    <input type="number" value={thresholds.soilMax} onChange={e => setThresholds({...thresholds, soilMax: Number(e.target.value)})} className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 text-center" />
                  </div>
                </div>

                {/* Rainfall */}
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CloudRain className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-semibold text-gray-900">Rainfall Warning (mm)</label>
                  </div>
                  <input type="number" value={thresholds.rainfallWarning} onChange={e => setThresholds({...thresholds, rainfallWarning: Number(e.target.value)})} className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 text-center" />
                </div>



                {/* Water Level */}
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Waves className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-semibold text-gray-900">Water Level Warning (%)</label>
                  </div>
                  <input type="number" value={thresholds.waterWarning} onChange={e => setThresholds({...thresholds, waterWarning: Number(e.target.value)})} className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 text-center" />
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-700 font-medium">
                Note: Threshold values are currently configured for demonstration purposes.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* SECTION 3 — ALERT SETTINGS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
              <Bell className="w-5 h-5 text-gray-500" />
              <h2 className="text-base font-bold text-gray-900">Alert Settings</h2>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-xs text-gray-500 mb-4">EnviroGuard generates alerts when sensor readings exceed configured thresholds or abnormal conditions are detected.</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-900">Enable Alerts</div>
                <Toggle enabled={alertsEnabled} onChange={setAlertsEnabled} />
              </div>
              
              <div className="space-y-3 pl-4 border-l-2 border-gray-100 ml-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">High Priority Alerts</div>
                  <Toggle enabled={highAlerts} onChange={setHighAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Medium Priority Alerts</div>
                  <Toggle enabled={mediumAlerts} onChange={setMediumAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Low Priority Alerts</div>
                  <Toggle enabled={lowAlerts} onChange={setLowAlerts} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 space-y-4">
                <div className="text-sm font-bold text-gray-900 mb-2">Notification Methods</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Dashboard notification</div>
                  <Toggle enabled={dashboardNotif} onChange={setDashboardNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Browser notification</div>
                  <Toggle enabled={browserNotif} onChange={setBrowserNotif} />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 — LOCATION SETTINGS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h2 className="text-base font-bold text-gray-900">Location Settings</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                <div className="text-gray-500 font-medium">Location Source</div>
                <div className="font-semibold text-gray-900">Browser Geolocation / Supabase</div>
                
                <div className="text-gray-500 font-medium">Current Location</div>
                <div className="font-semibold text-gray-900">EnviroGuard Node</div>
                
                <div className="text-gray-500 font-medium">Node</div>
                <div className="font-semibold text-gray-900">NODE-01</div>
                
                <div className="text-gray-500 font-medium">Coordinates</div>
                <div className="font-mono text-xs font-semibold text-gray-700">From DB/Browser</div>
                
                <div className="text-gray-500 font-medium">Hardware GPS</div>
                <div className="font-bold text-xs text-orange-600 uppercase tracking-wider">Not Installed</div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button onClick={handleUpdateLocation} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 transition-colors flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span>Update Location</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5 — DATA & SYSTEM */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
              <Database className="w-5 h-5 text-gray-500" />
              <h2 className="text-base font-bold text-gray-900">Data & System</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                <div className="text-gray-500 font-medium">Data Source</div>
                <div className="font-semibold text-gray-900">Supabase PostgreSQL</div>
                
                <div className="text-gray-500 font-medium">Connection</div>
                {isConnected ? (
                  <div className="font-bold text-emerald-600">Active (Remote)</div>
                ) : (
                  <div className="font-bold text-red-600">Disconnected</div>
                )}
                
                <div className="text-gray-500 font-medium">Database</div>
                {isConnected ? (
                  <div className="font-bold text-blue-600">Connected</div>
                ) : (
                  <div className="font-bold text-red-400">Error</div>
                )}
                
                <div className="text-gray-500 font-medium">System Version</div>
                <div className="font-mono text-xs font-semibold text-gray-700">EnviroGuard v1.0</div>
              </div>

              {connectionMessage && (
                <div className={cn("p-3 mt-4 border text-xs font-bold rounded-lg flex items-center space-x-2", 
                  connectionMessage.includes('Failed') ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                )}>
                  {connectionMessage.includes('Failed') ? <AlertOctagon className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{connectionMessage}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-50 flex flex-wrap gap-3">
                <button onClick={handleTestConnection} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 transition-colors flex items-center space-x-2">
                  <Wifi className="w-4 h-4" />
                  <span>Test DB Connection</span>
                </button>
                <button onClick={handleRefreshStatus} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 transition-colors flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh System Status</span>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* SECTION 6 — TECHNICAL DIAGNOSTICS PANEL */}
      <DiagnosticPanel />

      {/* SECTION 6 — SAVE SETTINGS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 sticky bottom-6 z-10 shadow-lg shadow-gray-200/50">
        <div className="flex items-center space-x-3">
          {saveMessage && (
            <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-bold">{saveMessage}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <button 
            onClick={handleReset}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Settings;
