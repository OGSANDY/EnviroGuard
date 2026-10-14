import { ShieldCheck, AlertOctagon, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SystemStatusCardProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

const statusConfig = {
  LOW: { 
    icon: ShieldCheck, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    borderLeftColor: 'border-l-emerald-500',
    label: 'LOW RISK'
  },
  MEDIUM: { 
    icon: AlertOctagon, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    borderLeftColor: 'border-l-yellow-500',
    label: 'MEDIUM RISK'
  },
  HIGH: { 
    icon: AlertOctagon, 
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    borderLeftColor: 'border-l-orange-500',
    label: 'HIGH RISK'
  },
  CRITICAL: { 
    icon: ShieldAlert, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    borderLeftColor: 'border-l-red-500',
    label: 'CRITICAL RISK'
  },
};

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ level, description }) => {
  const config = statusConfig[level] || statusConfig['LOW'];
  const Icon = config.icon;

  return (
    <div className={cn("w-full p-6 rounded-2xl border-l-4 flex items-center shadow-sm bg-white border border-gray-100", config.borderLeftColor)}>
      <div className={cn("p-3.5 rounded-full mr-5", config.bg, config.color)}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Current Environment Status</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={cn("text-2xl font-black tracking-tight", config.color)}>
            {config.label}
          </span>
          <span className="hidden sm:inline-block text-gray-300 mx-1">•</span>
          <span className="text-gray-600 font-medium text-base">{description}</span>
        </div>
      </div>
    </div>
  );
};
