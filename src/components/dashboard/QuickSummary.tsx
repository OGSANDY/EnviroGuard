import { cn } from '../../lib/utils';

export interface SummaryItem {
  id: string;
  name: string;
  value: string;
  status: string;
  statusColor?: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'gray';
}

interface QuickSummaryProps {
  items: SummaryItem[];
}

const statusColorMap = {
  green: 'text-emerald-700 bg-emerald-50',
  yellow: 'text-yellow-700 bg-yellow-50',
  orange: 'text-orange-700 bg-orange-50',
  red: 'text-red-700 bg-red-50',
  blue: 'text-blue-700 bg-blue-50',
  gray: 'text-gray-700 bg-gray-50',
};

export const QuickSummary: React.FC<QuickSummaryProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      <div className="px-6 py-5 border-b border-gray-50">
        <h3 className="text-base font-bold text-gray-900">Quick Summary</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <div key={item.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <span className="text-sm font-semibold text-gray-600">{item.name}</span>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-extrabold text-gray-900 w-20 text-right">{item.value}</span>
              <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider w-16 text-center", statusColorMap[item.statusColor || 'gray'])}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
