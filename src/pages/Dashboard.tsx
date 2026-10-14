import { 
  Bell, 
  Thermometer, 
  CloudRain, 
  Sprout, 
  Waves,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SensorCard } from '../components/dashboard/SensorCard';
import { RiskScoreCard } from '../components/dashboard/RiskScoreCard';
import { SystemStatusCard } from '../components/dashboard/SystemStatusCard';
import { QuickSummary } from '../components/dashboard/QuickSummary';
import type { SummaryItem } from '../components/dashboard/QuickSummary';
import { useSensorData } from '../hooks/useSensorData';

// Helper to determine status color based on value and thresholds (simplified for demo)
const getStatusAndColor = (type: string, value: number | null): { status: string, color: 'green' | 'yellow' | 'red' | 'gray' } => {
  if (value === null) return { status: 'N/A', color: 'gray' };
  
  switch(type) {
    case 'temp':
      return value > 35 ? { status: 'High', color: 'red' } : value < 20 ? { status: 'Low', color: 'yellow' } : { status: 'Normal', color: 'green' };
    case 'soil_moisture':
      return value > 80 || value < 40 ? { status: 'Warning', color: 'yellow' } : { status: 'Normal', color: 'green' };
    case 'rain':
      return value > 10 ? { status: 'High', color: 'red' } : { status: 'Normal', color: 'green' };
    case 'water':
      return value > 80 ? { status: 'High', color: 'red' } : { status: 'Normal', color: 'green' };
    default:
      return { status: 'Normal', color: 'green' };
  }
};

const Dashboard = () => {
  const { data, history, loading, error, lastUpdateTime } = useSensorData('NODE-01');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-semibold flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading sensor data...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {error ? 'Database Connection Error' : 'No Sensor Data'}
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            {error || 'No sensor readings are currently available for this node.'}
          </p>
        </div>
      </div>
    );
  }

  const lastUpdatedDate = data.created_at ? new Date(data.created_at) : new Date(lastUpdateTime);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdatedDate);

  // Determine statuses dynamically
  const tempStatus = getStatusAndColor('temp', data.temperature);
  const soilStatus = getStatusAndColor('soil_moisture', data.soil_moisture);
  const rainStatus = getStatusAndColor('rain', data.rainfall);
  const waterStatus = getStatusAndColor('water', data.water_level);

  const quickSummaryItems: SummaryItem[] = [
    { id: '1', name: 'Temperature', value: data.temperature !== null ? `${data.temperature} °C` : 'N/A', status: tempStatus.status, statusColor: tempStatus.color },
    { id: '2', name: 'Soil Moisture', value: data.soil_moisture !== null ? `${data.soil_moisture} %` : 'N/A', status: soilStatus.status, statusColor: soilStatus.color },
    { id: '3', name: 'Rainfall', value: data.rainfall !== null ? `${data.rainfall} mm` : 'N/A', status: rainStatus.status, statusColor: rainStatus.color },
    { id: '5', name: 'Water Level', value: data.water_level !== null ? `${data.water_level} %` : 'N/A', status: waterStatus.status, statusColor: waterStatus.color },
  ];

  // Format chart data
  const chartData = history.map(h => {
    const date = h.created_at ? new Date(h.created_at) : new Date();
    return {
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      temp: Number(h.temperature) || 0,
      soil_moisture: Number(h.soil_moisture) || 0
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">System Overview</p>
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

      {/* 2. SENSOR SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SensorCard 
          title="Temperature" 
          value={data.temperature !== null ? data.temperature : 'N/A'} 
          unit="°C" 
          icon={Thermometer} 
          status={tempStatus.status} 
          statusColor={tempStatus.color}
        />
        <SensorCard 
          title="Soil Moisture" 
          value={data.soil_moisture !== null ? data.soil_moisture : 'N/A'} 
          unit="%" 
          icon={Sprout} 
          status={soilStatus.status} 
          statusColor={soilStatus.color}
        />
        <SensorCard 
          title="Rainfall" 
          value={data.rainfall !== null ? data.rainfall : 'N/A'} 
          unit="mm" 
          icon={CloudRain} 
          status={rainStatus.status} 
          statusColor={rainStatus.color}
        />

        <SensorCard 
          title="Water Level" 
          value={data.water_level !== null ? data.water_level : 'N/A'} 
          unit="%" 
          icon={Waves} 
          status={waterStatus.status} 
          statusColor={waterStatus.color}
        />
        <RiskScoreCard 
          score={data.risk_score} 
          level={data.risk_level || 'LOW'} 
        />
      </div>

      {/* 3. CURRENT SYSTEM STATUS CARD */}
      <SystemStatusCard 
        level={data.risk_level || 'LOW'}
        description={
          data.risk_level === 'HIGH' || data.risk_level === 'CRITICAL' 
            ? "Warning: Environmental parameters are outside normal thresholds."
            : "All parameters are within acceptable ranges."
        }
      />

      {/* 4. QUICK SUMMARY & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1">
          <QuickSummary items={quickSummaryItems} />
        </div>
        <div className="lg:col-span-2">
          {/* DETAILED ANALYTICS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-gray-900">Sensor Trends (Recent)</h3>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                    dx={-10}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                    dx={10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temp" 
                    name="Temperature (°C)"
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="soil_moisture" 
                    name="Soil Moisture (%)"
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
