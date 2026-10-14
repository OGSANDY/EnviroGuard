import { useState, useEffect } from 'react';
import { 
  Bell, 
  MapPin, 
  Server, 
  Info, 
  Thermometer, 
  CloudRain, 
  Sprout, 
  Waves,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../lib/utils';
import { useSensorData } from '../hooks/useSensorData';

// Helper component to center map when coordinates change
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

interface MonitoringNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number | string;

  rainfall: number | string;
  soilMoisture: number | string;
  waterLevel: number | string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Online' | 'Offline' | 'Warning';
  locationSource: string;
  locationStatus: 'loading' | 'success' | 'error' | 'denied';
  lastUpdated: string;
}

const fallbackLat = 12.9716; // Bangalore fallback
const fallbackLng = 77.5946;

// Helper to create styled Leaflet markers based on risk level
const createNodeIcon = (level: string) => {
  let colorHex = '#10b981'; // emerald-500
  if (level === 'MEDIUM') colorHex = '#eab308'; // yellow-500
  if (level === 'HIGH') colorHex = '#f97316'; // orange-500
  if (level === 'CRITICAL') colorHex = '#ef4444'; // red-500

  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="width: 24px; height: 24px; background-color: ${colorHex}; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'LOW': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const MapView = () => {
  const { data, loading, error, hardwareStatus, lastUpdateTime } = useSensorData('NODE-01');
  const isOnline = hardwareStatus === 'ONLINE';
  const isStale = hardwareStatus === 'STALE';

  const [geoLoc, setGeoLoc] = useState<{ lat: number, lng: number, status: 'loading'|'success'|'error'|'denied', source: string, errorMsg: string|null }>({
    lat: fallbackLat,
    lng: fallbackLng,
    status: 'loading',
    source: 'Configured Fallback Coordinate',
    errorMsg: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoLoc(prev => ({ ...prev, status: 'error', source: 'Browser Geolocation Unavailable', errorMsg: 'Geolocation is not supported by your browser.' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          status: 'success',
          source: 'Laptop Browser Geolocation',
          errorMsg: null
        });
      },
      (error) => {
        let errorMsg = 'Unable to retrieve your location.';
        let status: 'denied' | 'error' = 'error';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Enable browser location access to display the current demo location.';
          status = 'denied';
        }
        setGeoLoc({ 
          lat: fallbackLat, 
          lng: fallbackLng, 
          status: status, 
          source: 'Configured Fallback Coordinate', 
          errorMsg 
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-semibold flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading Map data...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
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

  const isDummyCoords = data.latitude === 13.1369 && data.longitude === 80.2042;
  const useSupabaseCoords = data.latitude !== null && data.longitude !== null && !isDummyCoords;
  const finalLat = useSupabaseCoords ? data.latitude! : geoLoc.lat;
  const finalLng = useSupabaseCoords ? data.longitude! : geoLoc.lng;
  const finalLocationSource = useSupabaseCoords ? 'Hardware GPS (Supabase)' : geoLoc.source;
  const finalLocationStatus = useSupabaseCoords ? 'success' : geoLoc.status;

  const nodeData: MonitoringNode = {
    id: data.node_id,
    name: useSupabaseCoords ? 'Remote Sensor Node' : (finalLocationStatus === 'success' ? 'EnviroGuard Demo Location' : 'Fallback Demo Location'),
    latitude: finalLat,
    longitude: finalLng,
    temperature: data.temperature !== null ? data.temperature : 'N/A',
    rainfall: data.rainfall !== null ? data.rainfall : 'N/A',
    soilMoisture: data.soil_moisture !== null ? data.soil_moisture : 'N/A',
    waterLevel: data.water_level !== null ? data.water_level : 'N/A',
    riskScore: data.risk_score,
    riskLevel: isOnline ? (data.risk_level || 'LOW') : isStale ? 'MEDIUM' : 'LOW',
    status: isOnline ? 'Online' : isStale ? 'Warning' : 'Offline',
    locationSource: finalLocationSource,
    locationStatus: finalLocationStatus,
    lastUpdated: data.created_at || (lastUpdateTime > 0 ? new Date(lastUpdateTime).toISOString() : new Date().toISOString())
  };

  const formattedDate = nodeData.lastUpdated ? new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(nodeData.lastUpdated)) : 'N/A';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Map</h1>
              {!useSupabaseCoords && (
                <div className="flex items-center bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">DEMO LOCATION</span>
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">Sensor Locations & Risk Levels</p>
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

      {!useSupabaseCoords && geoLoc.errorMsg && (
        <div className="w-full p-4 rounded-xl border-l-4 border-l-orange-500 flex items-center shadow-sm bg-orange-50/50 border border-orange-100">
          <div className="p-2 rounded-full bg-orange-100 mr-4 text-orange-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-orange-800 text-sm font-bold uppercase tracking-wider">Location Error</h2>
            <p className="text-orange-700 font-medium text-sm mt-0.5">{geoLoc.errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: MAP AREA */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 h-[650px] relative overflow-hidden flex flex-col z-0">
            {/* DEMO NOTICE OVERLAY */}
            {!useSupabaseCoords && (
              <div className="absolute top-4 left-16 z-[400] pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {nodeData.locationStatus === 'success' 
                      ? 'DEMO MODE — Browser Geolocation' 
                      : 'DEMO MODE — Fallback Coordinate'}
                  </span>
                </div>
              </div>
            )}
            
            <MapContainer 
              center={[nodeData.latitude, nodeData.longitude]} 
              zoom={13} 
              scrollWheelZoom={false} 
              className="w-full h-full rounded-xl z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={[nodeData.latitude, nodeData.longitude]} />
              
              <Marker 
                position={[nodeData.latitude, nodeData.longitude]} 
                icon={createNodeIcon(nodeData.riskLevel)}
              >
                <Popup className="rounded-xl font-sans min-w-[200px]">
                  <div className="p-1">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                      <span className="font-bold text-gray-900">{nodeData.id}</span>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", getRiskColor(nodeData.riskLevel))}>
                        {nodeData.riskLevel}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-800 mb-0.5">{nodeData.name}</div>
                    {!useSupabaseCoords && <div className="text-[10px] text-gray-500 italic mb-2">Current monitoring demonstration</div>}
                    
                    <div className={cn("flex items-center text-xs font-semibold mb-3", isOnline ? "text-emerald-600" : isStale ? "text-yellow-600" : "text-red-600")}>
                      <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", isOnline ? "bg-emerald-500" : isStale ? "bg-yellow-500" : "bg-red-500")}></span>
                      {nodeData.status}
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between"><span className="text-gray-400">Temp:</span> <span className="font-semibold">{nodeData.temperature} °C</span></div>

                      <div className="flex justify-between"><span className="text-gray-400">Rainfall:</span> <span className="font-semibold">{nodeData.rainfall} mm</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Soil:</span> <span className="font-semibold">{nodeData.soilMoisture} %</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Water:</span> <span className="font-semibold">{nodeData.waterLevel} %</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* MAP LEGEND */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></span>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">LOW</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600"></span>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">MEDIUM</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-600"></span>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">HIGH</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></span>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">CRITICAL</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-6">
              <span className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-sm ring-1 ring-gray-200"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monitoring Node</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INFO CARDS */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          
          {/* SENSOR / NODE INFORMATION PANEL */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Sensor / Node Information</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Node Details */}
              <div className="grid grid-cols-[100px_1fr] gap-y-4 gap-x-2 text-sm">
                <div className="text-gray-500 font-medium">Node ID</div>
                <div className="text-gray-900 font-bold">{nodeData.id}</div>
                
                <div className="text-gray-500 font-medium">Location</div>
                <div className="text-gray-900 font-semibold">{nodeData.name}</div>
                
                <div className="text-gray-500 font-medium">Connection</div>
                <div className="text-gray-900 font-semibold">Supabase (Remote)</div>
                
                <div className="text-gray-500 font-medium">Status</div>
                <div className={cn("font-bold flex items-center", isOnline ? "text-emerald-600" : isStale ? "text-yellow-600" : "text-red-600")}>
                  <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", isOnline ? "bg-emerald-500" : isStale ? "bg-yellow-500" : "bg-red-500")}></span>
                  {nodeData.status}
                </div>
                
                <div className="text-gray-500 font-medium">Risk Level</div>
                <div className="flex">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", getRiskColor(nodeData.riskLevel))}>
                    {nodeData.riskLevel}
                  </span>
                </div>
                
                <div className="text-gray-500 font-medium pt-3 border-t border-gray-100">Coordinates</div>
                <div className="text-gray-900 font-mono text-xs font-semibold pt-3 border-t border-gray-100">
                  {nodeData.locationStatus === 'loading' ? (
                    <span className="text-gray-400 italic">Detecting...</span>
                  ) : (
                    `${nodeData.latitude.toFixed(4)}, ${nodeData.longitude.toFixed(4)}`
                  )}
                </div>
                
                <div className="text-gray-500 font-medium">Location Source</div>
                <div className="flex items-center space-x-1.5">
                  <Navigation className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-700 italic text-xs">{nodeData.locationSource}</span>
                </div>

                <div className="text-gray-500 font-medium">Hardware GPS</div>
                <div className={cn("font-bold text-xs uppercase tracking-wider", useSupabaseCoords ? "text-emerald-600" : "text-orange-600")}>
                  {useSupabaseCoords ? 'Active' : 'Not Installed'}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Sensor Readings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Thermometer className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">Temperature</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{nodeData.temperature} {nodeData.temperature !== 'N/A' && '°C'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">Rainfall</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{nodeData.rainfall} {nodeData.rainfall !== 'N/A' && 'mm'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Sprout className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold">Soil Moisture</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{nodeData.soilMoisture} {nodeData.soilMoisture !== 'N/A' && '%'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Waves className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold">Water Level</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{nodeData.waterLevel} {nodeData.waterLevel !== 'N/A' && '%'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAP EXPLANATION */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900">Current Prototype</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">
              Sensor data is received from the Supabase backend. If GPS coordinates are not provided by the hardware, location falls back to the demonstration laptop browser geolocation.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="text-gray-500 font-semibold">Location Status:</span>
                <span className="text-gray-900 font-bold text-right">{useSupabaseCoords ? 'GPS Active' : 'Fallback Mode'}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* 5. CURRENT MONITORING LOCATION */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">Current Monitoring Location</h3>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-extrabold text-gray-900">{nodeData.id}</span>
                <span className={cn("h-1.5 w-1.5 rounded-full", isOnline ? "bg-emerald-500" : isStale ? "bg-yellow-500" : "bg-red-500")}></span>
                <span className={cn("text-xs font-bold", isOnline ? "text-emerald-600" : isStale ? "text-yellow-600" : "text-red-600")}>
                  {isOnline ? 'Monitoring Active' : isStale ? 'Monitoring Delayed' : 'Monitoring Offline'}
                </span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">{nodeData.name}</h4>
              <p className="text-xs font-medium text-gray-500 italic">Location Source: {nodeData.locationSource}</p>
            </div>
          </div>
          
          <div className={cn("p-4 rounded-xl border flex items-center space-x-8 md:w-auto w-full justify-between", getRiskColor(nodeData.riskLevel))}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Risk Status</span>
              <span className="text-sm font-bold tracking-wide">{nodeData.riskLevel} RISK</span>
            </div>
            <div className="h-8 w-px bg-current opacity-20"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">Score</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black tracking-tight">{nodeData.riskScore.toFixed(1)}</span>
                <span className="text-xs font-bold opacity-70">/ 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MapView;
