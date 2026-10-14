import { useMemo } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  AlertOctagon,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSensorData } from '../hooks/useSensorData';
import type { AppSensorData } from '../types/sensor';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  time: string;
  action: string;
  status: 'Active' | 'Resolved';
}

const generateAlerts = (history: AppSensorData[]): Alert[] => {
  if (!history || history.length === 0) return [];
  
  const alerts: Alert[] = [];
  
  // history is oldest to newest, we want to know if the latest is active
  const latestIndex = history.length - 1;

  history.forEach((reading, index) => {
    const timeFormatted = reading.created_at ? new Intl.DateTimeFormat('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(new Date(reading.created_at)) : 'N/A';

    if (reading.risk_level === 'CRITICAL') {
      alerts.push({
        id: `ALT-${reading.id}`,
        title: 'Critical Risk Level Detected',
        description: `Risk score reached ${reading.risk_score.toFixed(1)}/10. Immediate attention required.`,
        severity: 'HIGH',
        time: timeFormatted,
        action: 'Evacuate area and deploy emergency protocols.',
        status: index === latestIndex ? 'Active' : 'Resolved'
      });
    } else if (reading.risk_level === 'HIGH') {
      alerts.push({
        id: `ALT-${reading.id}`,
        title: 'High Risk Warning',
        description: `Elevated environmental risk detected (Score: ${reading.risk_score.toFixed(1)}).`,
        severity: 'MEDIUM',
        time: timeFormatted,
        action: 'Monitor situation closely and prepare for potential action.',
        status: index === latestIndex ? 'Active' : 'Resolved'
      });
    } else if (reading.risk_level === 'MEDIUM') {
      alerts.push({
        id: `ALT-${reading.id}`,
        title: 'Moderate Risk Advisory',
        description: `Some sensor readings are above normal ranges.`,
        severity: 'LOW',
        time: timeFormatted,
        action: 'Continue monitoring for further deterioration.',
        status: index === latestIndex ? 'Active' : 'Resolved'
      });
    }
  });

  // If no risk-based alerts, add a standard info alert
  if (alerts.length === 0) {
    const latest = history[latestIndex];
    alerts.push({
      id: `ALT-SYS-${latest.id}`,
      title: 'System Check Complete',
      description: 'All connected sensors are functioning within normal parameters.',
      severity: 'INFO',
      time: latest.created_at ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(latest.created_at)) : 'N/A',
      action: 'No action required.',
      status: 'Resolved'
    });
  }

  // Reverse so newest is first
  return alerts.reverse();
};

const Alerts = () => {
  const { data, history, loading, error, lastUpdateTime } = useSensorData('NODE-01');

  const alerts = useMemo(() => generateAlerts(history), [history]);

  const lastUpdatedDate = data?.created_at ? new Date(data.created_at) : new Date(lastUpdateTime);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdatedDate);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'LOW':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'INFO':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <AlertOctagon className="w-5 h-5 text-red-500" />;
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'LOW': return <Activity className="w-5 h-5 text-emerald-500" />;
      case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Calculate summary counts
  const activeAlerts = alerts.filter(a => a.status === 'Active').length;
  const highPriority = alerts.filter(a => a.status === 'Active' && a.severity === 'HIGH').length;
  const mediumPriority = alerts.filter(a => a.status === 'Active' && a.severity === 'MEDIUM').length;
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-semibold flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading Alerts...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center max-w-md text-center">
          <AlertOctagon className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">{error ? 'Database Connection Error' : 'No Sensor Data'}</h2>
          <p className="text-sm text-gray-600 font-medium">{error || 'No sensor readings are currently available.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Alerts</h1>
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">Active Alerts and Warnings</p>
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

      {/* 2. MAIN ALERT SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{activeAlerts}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">Active Alerts</div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{highPriority}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">High Priority</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{mediumPriority}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">Medium Priority</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{resolvedAlerts}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">Resolved</div>
          </div>
        </div>
      </div>

      {/* 3. MAIN ALERT TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">System Alerts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Alert</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Recommended Action</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {alerts.length > 0 ? alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 mb-0.5">{alert.title}</div>
                        <div className="text-xs font-medium text-gray-500">{alert.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", getSeverityBadge(alert.severity))}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-semibold text-gray-700">{alert.time}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start space-x-2">
                      <ShieldAlert className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-gray-700 leading-relaxed">{alert.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    {alert.status === 'Active' ? (
                      <span className="inline-flex items-center space-x-1.5 bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Resolved</span>
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">
                    No alerts in recent history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. EXPLANATORY CARD */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h3 className="text-sm font-bold text-gray-900">How Alerts Work</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl">
            Environmental sensor readings are continuously monitored. When readings exceed configured risk thresholds or abnormal patterns are detected, EnviroGuard generates an alert and recommends an appropriate action based on data received from Supabase.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Alerts;
