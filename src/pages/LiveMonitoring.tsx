import { 
  Bell, 
  Thermometer, 
  CloudRain, 
  Sprout, 
  Waves,
  Clock,
  Server,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SensorCard } from '../components/dashboard/SensorCard';
import { useSensorData } from '../hooks/useSensorData';

// Helper to determine status color based on value and thresholds (simplified for demo)
const getStatusAndColor = (type: string, value: number | null): { status: string, color: 'green' | 'yellow' | 'red' | 'gray' } => {
  if (value === null) return { status: 'N/A', color: 'gray' };
  
  switch(type) {
    case 'temp':
      return value > 35 ? { status: 'HIGH', color: 'red' } : value < 20 ? { status: 'LOW', color: 'yellow' } : { status: 'NORMAL', color: 'green' };
    case 'soil_moisture':
      return value > 80 || value < 40 ? { status: 'WARNING', color: 'yellow' } : { status: 'NORMAL', color: 'green' };
    case 'rain':
      return value > 10 ? { status: 'HIGH', color: 'red' } : { status: 'NORMAL', color: 'green' };
    case 'water':
      return value > 80 ? { status: 'HIGH', color: 'red' } : { status: 'NORMAL', color: 'green' };
    default:
      return { status: 'NORMAL', color: 'green' };
  }
};

const sensorStatusList = [
  { id: 1, name: 'Temperature Sensor' },
  { id: 3, name: 'Rain Sensor' },
  { id: 4, name: 'Soil Moisture Sensor' },
  { id: 5, name: 'Water Level Sensor' },
];

const LiveMonitoring = () => {
  const { 
    data, 
    history, 
    loading, 
    error, 
    hardwareStatus, 
    databaseStatus, 
    realtimeStatus,
    secondsSinceLastPacket, 
    lastUpdateTime 
  } = useSensorData('NODE-01');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-semibold flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading live sensor data...
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
            {error || 'No live sensor readings are currently available for this node.'}
          </p>
        </div>
      </div>
    );
  }

  const lastUpdatedDate = lastUpdateTime > 0 ? new Date(lastUpdateTime) : (data.created_at ? new Date(data.created_at) : new Date());
  
  const formattedFullDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(lastUpdatedDate);

  const timeOnly = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(lastUpdatedDate).replace(/ AM| PM/, '');

  const ampm = lastUpdatedDate.getHours() >= 12 ? 'PM' : 'AM';

  const tempStatus = getStatusAndColor('temp', data.temperature);
  const soilStatus = getStatusAndColor('soil_moisture', data.soil_moisture);
  const rainStatus = getStatusAndColor('rain', data.rainfall);
  const waterStatus = getStatusAndColor('water', data.water_level);

  const isOnline = hardwareStatus === 'ONLINE';
  const isStale = hardwareStatus === 'STALE';

  // Format chart data
  const chartData = history.map(h => {
    const date = h.created_at ? new Date(h.created_at) : new Date();
    return {
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`,
      temp: Number(h.temperature) || 0,
      soil_moisture: Number(h.soil_moisture) || 0
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Live Monitoring</h1>
              {/* STATUS BADGE */}
              <div className={cn(
                "flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                isStale ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                "bg-red-50 text-red-700 border-red-100"
              )}>
                <span className="relative flex h-2 w-2 mr-2">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isOnline ? "bg-emerald-400" : isStale ? "bg-yellow-400" : "bg-red-400")}></span>
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", isOnline ? "bg-emerald-500" : isStale ? "bg-yellow-500" : "bg-red-500")}></span>
                </span>
                <span>{hardwareStatus}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">Real-time Sensor Readings</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-xs font-bold text-gray-500 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm uppercase tracking-wide">
            Last Packet: <span className="text-gray-900 ml-1">{secondsSinceLastPacket !== null ? `${secondsSinceLastPacket}s ago` : formattedFullDate}</span>
          </div>
          <button className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm transition-all">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. ENVIRONMENTAL MONITORING STATUS BANNER */}
      <div className={cn(
        "w-full p-4 rounded-xl border-l-4 flex items-center shadow-sm border",
        isOnline ? "border-l-emerald-500 bg-emerald-50/50 border-emerald-100" :
        isStale ? "border-l-yellow-500 bg-yellow-50/50 border-yellow-100" :
        "border-l-red-500 bg-red-50/50 border-red-100"
      )}>
        <div className={cn("p-2 rounded-full mr-4", isOnline ? "bg-emerald-100 text-emerald-600" : isStale ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600")}>
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h2 className={cn("text-sm font-bold uppercase tracking-wider", isOnline ? "text-emerald-800" : isStale ? "text-yellow-800" : "text-red-800")}>
            {isOnline ? 'Environmental monitoring active' : isStale ? 'Sensor telemetry delayed' : 'Hardware offline'}
          </h2>
          <p className={cn("font-medium text-sm mt-0.5", isOnline ? "text-emerald-700" : isStale ? "text-yellow-700" : "text-red-700")}>
            {isOnline 
              ? 'ESP32 is transmitting fresh sensor packets directly to Supabase.' 
              : isStale 
              ? 'Last ESP32 packet was received over 60s ago. Showing last known state.' 
              : 'ESP32 has not sent data in over 120s. Check hardware power & Wi-Fi.'}
          </p>
        </div>
      </div>

      {/* 3. INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Node Information */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Server className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Sensor Node</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium mr-4">Node ID:</span>
                <span className="text-gray-900 font-semibold">{data.node_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium mr-4">Database:</span>
                <span className={databaseStatus === 'CONNECTED' ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                  {databaseStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium mr-4">Hardware:</span>
                <span className={isOnline ? "text-emerald-600 font-semibold" : isStale ? "text-yellow-600 font-semibold" : "text-red-600 font-semibold"}>
                  {hardwareStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sampling Frequency */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Sync Layer</h3>
            <div className="text-2xl font-black text-gray-900 tracking-tight my-1">
              {realtimeStatus === 'CONNECTED' ? 'Realtime' : 'Polling'}
              <span className="text-sm font-semibold text-gray-500 tracking-normal ml-1">
                ({realtimeStatus === 'CONNECTED' ? 'Push' : '10s'})
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {realtimeStatus === 'CONNECTED' ? 'Instant push notifications enabled.' : 'Fallback periodic query active.'}
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Last Packet</h3>
            <div className="text-2xl font-black text-gray-900 tracking-tight my-1">{timeOnly} <span className="text-sm font-semibold text-gray-500 tracking-normal">{ampm}</span></div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {secondsSinceLastPacket !== null ? `${secondsSinceLastPacket} seconds ago` : 'Waiting for packet'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME SENSOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <SensorCard 
          title="Temperature" 
          value={data.temperature !== null ? data.temperature : 'N/A'} 
          unit="°C" 
          icon={Thermometer} 
          status={isOnline ? tempStatus.status : hardwareStatus} 
          statusColor={isOnline ? tempStatus.color : isStale ? 'yellow' : 'gray'}
          isLive={isOnline}
        />
        <SensorCard 
          title="Soil Moisture" 
          value={data.soil_moisture !== null ? data.soil_moisture : 'N/A'} 
          unit="%" 
          icon={Sprout} 
          status={isOnline ? soilStatus.status : hardwareStatus} 
          statusColor={isOnline ? soilStatus.color : isStale ? 'yellow' : 'gray'}
          isLive={isOnline}
        />
        <SensorCard 
          title="Rainfall Index" 
          value={data.rainfall !== null ? data.rainfall : 'N/A'} 
          unit="%" 
          icon={CloudRain} 
          status={isOnline ? rainStatus.status : hardwareStatus} 
          statusColor={isOnline ? rainStatus.color : isStale ? 'yellow' : 'gray'}
          isLive={isOnline}
        />

        <SensorCard 
          title="Water Level" 
          value={data.water_level !== null ? data.water_level : 'N/A'} 
          unit="%" 
          icon={Waves} 
          status={isOnline ? waterStatus.status : hardwareStatus} 
          statusColor={isOnline ? waterStatus.color : isStale ? 'yellow' : 'gray'}
          isLive={isOnline}
        />
      </div>

      {/* 5. SPLIT SECTION: CHARTS & STATUS TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Live Sensor Trends */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-gray-900">Live Sensor Trends</h3>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
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
                    domain={['auto', 'auto']}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                    dx={10}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
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

        {/* Sensor Status Table */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center space-x-2">
              <Server className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-bold text-gray-900">Sensor Status</h3>
            </div>
            <div className="divide-y divide-gray-50 flex-1">
              <div className="px-6 py-3 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Sensor</span>
                <div className="flex space-x-8">
                  <span className="w-16">Status</span>
                  <span className="w-20 text-right">Update</span>
                </div>
              </div>
              {sensorStatusList.map((sensor) => {
                // Infer individual sensor status if no value available
                let sStatus = isOnline ? 'Online' : isStale ? 'Stale' : 'Offline';
                if (sensor.name === 'Soil Moisture Sensor' && data.soil_moisture === null) sStatus = 'Offline';
                if (sensor.name === 'Rain Sensor' && data.rainfall === null) sStatus = 'Offline';
                if (sensor.name === 'Water Level Sensor' && data.water_level === null) sStatus = 'Offline';

                return (
                  <div key={sensor.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <span className="text-sm font-semibold text-gray-700">{sensor.name}</span>
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center w-16">
                        <span className={cn("h-2 w-2 rounded-full mr-2", sStatus === 'Online' ? "bg-emerald-500" : sStatus === 'Stale' ? "bg-yellow-500" : "bg-red-500")}></span>
                        <span className={cn("text-sm font-bold", sStatus === 'Online' ? "text-emerald-600" : sStatus === 'Stale' ? "text-yellow-600" : "text-red-600")}>{sStatus}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500 w-20 text-right">{timeOnly}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Add cn helper since it's used inside the sensorStatusList map
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default LiveMonitoring;
