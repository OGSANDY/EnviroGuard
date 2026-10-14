import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  status: string;
  statusColor?: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'gray';
  isLive?: boolean;
}

const colorMap = {
  green: 'text-emerald-500 bg-emerald-50',
  yellow: 'text-yellow-500 bg-yellow-50',
  orange: 'text-orange-500 bg-orange-50',
  red: 'text-red-500 bg-red-50',
  blue: 'text-blue-500 bg-blue-50',
  gray: 'text-gray-500 bg-gray-50',
};

const statusTextColorMap = {
  green: 'text-emerald-700',
  yellow: 'text-yellow-700',
  orange: 'text-orange-700',
  red: 'text-red-700',
  blue: 'text-blue-700',
  gray: 'text-gray-700',
};

export const SensorCard: React.FC<SensorCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status, 
  statusColor = 'gray',
  isLive = false
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-gray-200 transition-all cursor-default">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2.5 rounded-xl", colorMap[statusColor])}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold">{title}</h3>
        </div>
        <div className={cn("text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", colorMap[statusColor], statusTextColorMap[statusColor])}>
          {status}
        </div>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <div className="flex items-baseline">
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
          <span className="text-sm font-semibold text-gray-500 ml-1.5">{unit}</span>
        </div>
        {isLive && (
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>
    </div>
  );
};
