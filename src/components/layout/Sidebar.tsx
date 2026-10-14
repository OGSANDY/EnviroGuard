import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, BrainCircuit, Map as MapIcon, Bell, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Live Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Risk & AI', href: '/risk-ai', icon: BrainCircuit },
  { name: 'Map', href: '/map', icon: MapIcon },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export const Sidebar = () => {
  return (
    <div className="flex h-full w-64 flex-col bg-[#0B1120] text-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-black text-emerald-400 tracking-wider uppercase">EnviroGuard</h1>
      </div>
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all",
                isActive 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                  : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-100"
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0 transition-colors" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 bg-gray-900/30">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <span className="text-emerald-400 text-sm font-bold">EG</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold text-white">Admin</p>
            <p className="text-xs font-medium text-gray-400">Control Center</p>
          </div>
        </div>
      </div>
    </div>
  );
};
