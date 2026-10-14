import { 
  Bell, 
  BrainCircuit, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Thermometer,
  CloudRain,
  Sprout,
  Waves,
  ArrowRight,
  CheckCircle2,
  ShieldAlert
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
import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';

interface RiskFactor {
  id: string;
  name: string;
  value: string;
  status: string;
  icon: LucideIcon;
  statusColor: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'gray';
}

const colorMap = {
  green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  yellow: 'text-yellow-600 bg-yellow-50 border-yellow-100',
  orange: 'text-orange-600 bg-orange-50 border-orange-100',
  red: 'text-red-600 bg-red-50 border-red-100',
  blue: 'text-blue-600 bg-blue-50 border-blue-100',
  gray: 'text-gray-600 bg-gray-50 border-gray-100',
};

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

const RiskAI = () => {
  const { data, history, loading, error, lastUpdateTime } = useSensorData('NODE-01');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-semibold flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading Risk & AI data...
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
            {error || 'No live sensor readings are currently available for Risk Analysis.'}
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

  // Dynamic analysis text based on risk_score
  const isHighRisk = data.risk_score >= 7.5;
  const isMedRisk = data.risk_score >= 5.0 && data.risk_score < 7.5;
  
  const getTriggeredExplanation = () => {
    const r = data.rainfall ?? 0;
    const s = data.soil_moisture ?? 0;
    const t = data.temperature ?? 0;
    const level = data.risk_level || 'LOW';

    if (level === 'CRITICAL' || (r > 75 && s > 85)) {
      return {
        rule: 'Rain > 75% AND Soil Moisture > 85%',
        reason: 'Ground is completely saturated and heavy rain continues. Flash flood / landslide risk is critical.',
        assessment: 'CRITICAL (High Severity)'
      };
    }
    if (level === 'HIGH' || (r > 55 && s > 65)) {
      return {
        rule: 'Rain > 55% AND Soil Moisture > 65%',
        reason: 'Ground is becoming saturated while moderate to heavy rain continues.',
        assessment: 'HIGH (Elevated Severity)'
      };
    }
    if (t > 40 && s < 20) {
      return {
        rule: 'Temperature > 40°C AND Soil Moisture < 20%',
        reason: 'Extreme heat combined with dry soil indicates severe drought/wildfire conditions.',
        assessment: 'HIGH (Wildfire / Drought Risk)'
      };
    }
    return {
      rule: 'Normal Threshold Bounds',
      reason: 'Environmental parameters are stable and within standard safe operating limits.',
      assessment: 'LOW (Stable Conditions)'
    };
  };

  const explanation = getTriggeredExplanation();

  const mockRiskData = {
    score: data.risk_score,
    maxScore: 10,
    level: data.risk_level || 'LOW',
    hazard: isHighRisk ? 'Critical Hazard Detected' : isMedRisk ? 'Elevated Risk Detected' : 'No Major Hazard',
    hazardDescription: explanation.reason,
    anomalyResult: isHighRisk || isMedRisk ? 'Anomalies Detected' : 'No Anomalies Detected',
    anomalyDescription: isHighRisk || isMedRisk 
      ? 'Sensor correlations indicate a potential emerging hazard. The risk engine has flagged these patterns.' 
      : 'All monitored sensor parameters are currently within expected ranges. Analysis considers relationships between environmental parameters rather than relying only on individual thresholds.',
    recommendation: isHighRisk ? 'Immediate Action Required' : isMedRisk ? 'Increased Monitoring Advised' : 'No Immediate Action Required',
    recommendationDetail: isHighRisk 
      ? 'Trigger physical alerts and evacuate if necessary. System parameters have breached critical thresholds.'
      : isMedRisk 
      ? 'Monitor the situation closely. Prepare to trigger alerts if trends continue upward.'
      : 'Continue monitoring environmental conditions. Trigger an alert if water level, rainfall, soil moisture, or temperature crosses configured risk thresholds.',
  };

  const tempStatus = getStatusAndColor('temp', data.temperature);
  const soilStatus = getStatusAndColor('soil_moisture', data.soil_moisture);
  const rainStatus = getStatusAndColor('rain', data.rainfall);
  const waterStatus = getStatusAndColor('water', data.water_level);

  const riskFactors: RiskFactor[] = [
    { id: '1', name: 'Rainfall Index', value: data.rainfall !== null ? `${data.rainfall}%` : 'N/A', status: rainStatus.status, icon: CloudRain, statusColor: rainStatus.color },
    { id: '2', name: 'Soil Moisture', value: data.soil_moisture !== null ? `${data.soil_moisture}%` : 'N/A', status: soilStatus.status, icon: Sprout, statusColor: soilStatus.color },
    { id: '3', name: 'Water Level', value: data.water_level !== null ? `${data.water_level}%` : 'N/A', status: waterStatus.status, icon: Waves, statusColor: waterStatus.color },
    { id: '4', name: 'Temperature', value: data.temperature !== null ? `${data.temperature} °C` : 'N/A', status: tempStatus.status, icon: Thermometer, statusColor: tempStatus.color },
  ];

  // Format chart data for trend
  const trendData = history.map(h => {
    const date = h.created_at ? new Date(h.created_at) : new Date(lastUpdateTime);
    return {
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      score: h.risk_score || 0
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Risk & AI</h1>
              <div className="flex items-center bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">EDGE AI DECISION TREE</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">Risk Analysis and Environmental Intelligence</p>
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

      {/* 2. AI ANALYSIS STATUS BANNER */}
      <div className="w-full p-5 rounded-2xl border-l-4 border-l-emerald-500 flex items-center shadow-sm bg-white border border-gray-100">
        <div className="p-3.5 rounded-xl bg-emerald-50 mr-5 text-emerald-600">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-gray-900 text-sm font-bold uppercase tracking-wider">EDGE AI DECISION ENGINE ACTIVE</h2>
            <div className="flex items-center bg-emerald-50 px-2 py-0.5 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">MODEL: ESP32 model.h</span>
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm">
            Predictions are evaluated locally on the ESP32 hardware using Decision Tree rules before transmitting to Supabase.
          </p>
        </div>
      </div>

      {/* ROW: RISK SCORE & DETECTED HAZARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 3. RISK SCORE CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <h3 className="text-base font-bold text-gray-900 mb-6">Overall Risk Score</h3>
          <div className="flex items-end space-x-4 mb-6">
            <div className="flex items-baseline">
              <span className="text-6xl font-black text-gray-900 tracking-tighter">{mockRiskData.score.toFixed(1)}</span>
              <span className="text-xl font-bold text-gray-400 ml-1.5">/ {mockRiskData.maxScore}</span>
            </div>
            <div className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider mb-2",
              mockRiskData.level === 'HIGH' || mockRiskData.level === 'CRITICAL' ? 'bg-red-50 text-red-600' :
              mockRiskData.level === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'
            )}>
              {mockRiskData.level} RISK
            </div>
          </div>
          
          {/* Horizontal Risk Scale */}
          <div className="mt-auto">
            <div className="relative w-full h-2 bg-gray-100 rounded-full mb-2">
              <div className="absolute top-0 left-0 h-full w-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 opacity-20"></div>
              {/* Score Marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-emerald-500 rounded-full shadow-md"
                style={{ left: `${Math.min(100, Math.max(0, (mockRiskData.score / mockRiskData.maxScore) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>0 (Low)</span>
              <span>2.5</span>
              <span>5.0 (Med)</span>
              <span>7.5</span>
              <span>10 (Crit)</span>
            </div>
          </div>
        </div>

        {/* 4. DETECTED HAZARD CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-base font-bold text-gray-900">Hazard Evaluation & Rule Trigger</h3>
            <div className="bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              LIVE ESP32 RULE
            </div>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className={cn(
              "p-4 rounded-2xl",
              isHighRisk ? "bg-red-50 text-red-500" : isMedRisk ? "bg-yellow-50 text-yellow-500" : "bg-emerald-50 text-emerald-500"
            )}>
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">{mockRiskData.hazard}</div>
              <div className={cn("text-xs font-bold mt-1 uppercase tracking-wider", isHighRisk ? "text-red-600" : isMedRisk ? "text-yellow-600" : "text-emerald-600")}>
                RISK ASSESSMENT: {explanation.assessment}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3 text-xs space-y-1">
            <div className="font-bold text-gray-700">Triggered Rule Condition:</div>
            <div className="font-mono text-emerald-700 font-bold">{explanation.rule}</div>
          </div>

          <p className="text-xs text-gray-500 font-medium leading-relaxed mt-auto">
            {mockRiskData.hazardDescription}
          </p>

          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400 font-medium flex justify-between">
            <span>Atmospheric Pressure: <strong className="text-gray-500">Not Installed</strong></span>
            <span>Decision Engine: <strong className="text-gray-500">Hardware Edge</strong></span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* 5. SENSOR FACTORS CONTRIBUTING TO RISK */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-900">Factors Contributing to Risk</h3>
            </div>
            <div className="divide-y divide-gray-50 flex-1">
              {riskFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={cn("p-2 rounded-lg border", colorMap[factor.statusColor as keyof typeof colorMap])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{factor.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-extrabold text-gray-900 w-16 text-right">{factor.value}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider w-16 text-center", colorMap[factor.statusColor as keyof typeof colorMap])}>
                        {factor.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6. RISK TREND CHART & AI RESULTS */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Risk Trend</h3>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Recent Sensor Syncs</p>
              </div>
              <div className="bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                SUPABASE DATA
              </div>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }}
                    domain={[0, 10]}
                    ticks={[0, 2.5, 5, 7.5, 10]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Risk Score"
                    stroke="#10b981" 
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 3, stroke: '#10b981', fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 7. AI / ANOMALY RESULT */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-3">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                <h3 className="text-sm font-bold text-gray-900">AI / Anomaly Result</h3>
                <div className="ml-auto bg-gray-50 text-gray-500 border border-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  DEMO ANALYSIS
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className={cn("w-4 h-4", isHighRisk || isMedRisk ? "text-yellow-500" : "text-emerald-500")} />
                <span className={cn("text-sm font-bold", isHighRisk || isMedRisk ? "text-yellow-600" : "text-emerald-600")}>
                  {mockRiskData.anomalyResult}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-3">
                {mockRiskData.anomalyDescription}
              </p>
            </div>

            {/* 8. RISK RECOMMENDATION */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900">Recommended Action</h3>
              </div>
              <div className="text-sm font-bold text-gray-900 mb-2">
                {mockRiskData.recommendation}
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-3">
                {mockRiskData.recommendationDetail}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* 9. ANALYSIS PIPELINE VISUAL */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 relative">
          
          <div className="flex flex-col items-center z-10">
            <div className="bg-blue-50 text-blue-600 border border-blue-100 p-3 rounded-xl mb-2 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sensor Data</span>
          </div>
          
          <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />
          
          <div className="flex flex-col items-center z-10">
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl mb-2 shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Risk Analysis</span>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />

          <div className="flex flex-col items-center z-10">
            <div className="bg-purple-50 text-purple-600 border border-purple-100 p-3 rounded-xl mb-2 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Anomaly Detection</span>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />

          <div className="flex flex-col items-center z-10">
            <div className="bg-orange-50 text-orange-600 border border-orange-100 p-3 rounded-xl mb-2 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hazard Classification</span>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />

          <div className="flex flex-col items-center z-10">
            <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl mb-2 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Alert / Action</span>
          </div>

          {/* Background connector line for desktop */}
          <div className="hidden md:block absolute top-[30%] left-0 w-full h-[2px] bg-gray-100 -z-0"></div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-semibold text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Current stage: <span className="text-gray-900">Demo risk engine on Supabase data</span></span>
          </div>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
            <span>Future stage: Edge AI inference</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RiskAI;
