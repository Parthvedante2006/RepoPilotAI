// src/components/Sidebar.jsx
import { LayoutDashboard, FileText, History, CreditCard, HelpCircle, Settings, LogOut, User } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explorer', label: 'Explorer', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'credits', label: 'Credits', icon: CreditCard, disabled: true },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          RepoPilot
        </h1>
      </div>
      <nav className="flex-1 p-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl mb-1 transition-colors ${
              activeTab === item.id 
                ? 'bg-gray-800 text-cyan-400' 
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <item.icon className="mr-3 w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-3">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">Ruturaj</p>
            <p className="text-sm text-gray-500">Pune, IN</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-red-400"
        >
          <LogOut className="mr-3 w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;


