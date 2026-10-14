import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RiskScoreCardProps {
  score: number;
  maxScore?: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const levelConfig = {
  LOW: { color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'LOW RISK' },
  MEDIUM: { color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'MEDIUM RISK' },
  HIGH: { color: 'text-orange-500', bg: 'bg-orange-50', label: 'HIGH RISK' },
  CRITICAL: { color: 'text-red-500', bg: 'bg-red-50', label: 'CRITICAL RISK' },
};

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ 
  score, 
  maxScore = 10, 
  level 
}) => {
  const config = levelConfig[level] || levelConfig.LOW;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md hover:border-gray-200 transition-all cursor-default">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2.5 rounded-xl", config.bg, config.color)}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold">Overall Risk Score</h3>
        </div>
        <div className={cn("text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", config.bg, config.color)}>
          {config.label}
        </div>
      </div>
      <div className="mt-1 flex items-baseline">
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{score.toFixed(1)}</span>
        <span className="text-sm font-semibold text-gray-500 ml-1.5">/ {maxScore}</span>
      </div>
    </div>
  );
};
