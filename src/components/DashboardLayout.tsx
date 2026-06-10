import React, { useState } from 'react';
import { useIoT } from '../context/IoTContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  Menu, X, Cpu, LogOut, Radio, Mic, Thermometer, Droplets, 
  Settings, History, Server, Signal, SignalHigh, HelpCircle, UserCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivePage } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { 
    user, 
    activePage, 
    setActivePage, 
    connectionStatus, 
    addLog,
    configs
  } = useIoT();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      addLog('info', 'Auth System', 'Proses logout akun...');
      await signOut(auth);
    } catch (err: any) {
      console.error(err);
      addLog('error', 'Auth System', `Logout gagal: ${err.message}`);
    }
  };

  const menuItems = [
    {
      section: 'DASHBOARD',
      items: [
        { id: 'voice', name: 'Voice Command', icon: Mic },
        { id: 'suhu', name: 'Suhu Sensor', icon: Thermometer },
        { id: 'kelembapan', name: 'Kelembapan Sensor', icon: Droplets }
      ]
    },
    {
      section: 'KONTROL',
      items: [
        { id: 'kontrol-relay', name: 'Kontrol Relay', icon: Server }
      ]
    },
    {
      section: 'DATA SUMMARY (STATIC)',
      items: [
        { id: 'data-suhu', name: 'Data Riwayat Suhu', icon: History },
        { id: 'data-kelembapan', name: 'Data Riwayat Lembap', icon: History },
        { id: 'log-mqtt', name: 'Log Aktivitas MQTT', icon: Radio }
      ]
    },
    {
      section: 'SETTINGS',
      items: [
        { id: 'mqtt-config', name: 'Konfigurasi Broker', icon: Settings }
      ]
    }
  ];

  // Connection Indicator visual styling
  const getConnectionBullet = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => {
    switch (status) {
      case 'connected':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />;
      case 'connecting':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />;
      case 'error':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />;
    }
  };

  const getStatusLabelText = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => {
    switch (status) {
      case 'connected': return 'Terhubung';
      case 'connecting': return 'Menghubungkan';
      case 'error': return 'Error';
      default: return 'Offline';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOPBAR - Responsive navigation strip */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 h-16 px-4 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
            id="toggle_sidebar_btn"
            title="Buka/Tutup Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
            <span className="font-bold text-sm tracking-wide uppercase bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent hidden sm:inline-block">
              IoT MULTI-BROKER ESP32
            </span>
          </div>
        </div>

        {/* MQTT Quick Broker Connection Panel */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-5 text-xs bg-slate-950/60 border border-slate-800/50 py-1.5 px-3 rounded-lg font-mono">
            <div className="flex items-center gap-2" title="Cedalo">
              <span>Cedalo:</span>
              {getConnectionBullet(connectionStatus.Cedalo)}
            </div>
            <div className="flex items-center gap-2" title="Flespi">
              <span>Flespi:</span>
              {getConnectionBullet(connectionStatus.CrystalMQ)}
            </div>
            <div className="flex items-center gap-2" title="Shiftr">
              <span>Shiftr:</span>
              {getConnectionBullet(connectionStatus.MyQttHub)}
            </div>
          </div>

          {/* Connected User Profile Indicator */}
          <div className="flex items-center gap-2.5 text-xs font-mono bg-slate-800/40 py-1.5 px-3 rounded-lg border border-slate-800">
            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="max-w-[120px] sm:max-w-[180px] truncate text-slate-300" title={user?.email || ''}>
              {user?.email?.split('@')[0]}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* 2. COLLAPSIBLE SIDEBAR */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -260, width: 0, opacity: 0 }}
              animate={{ x: 0, width: 260, opacity: 1 }}
              exit={{ x: -260, width: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="bg-slate-900 border-r border-slate-800/80 shrink-0 z-20 overflow-y-auto flex flex-col justify-between absolute lg:relative h-[calc(100vh-4rem)] left-0 top-0 text-sm"
              id="sidebar_nav"
            >
              <div className="p-4 py-6 space-y-6">
                {/* Embedded Account Box */}
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/60 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-950/80 border border-blue-800/50 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-sm text-blue-400 uppercase">
                      {user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">MEMBER AKTIF</p>
                    <p className="text-xs font-mono text-slate-200 truncate" title={user?.email || ''}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Navigation Menus grouped by Sections */}
                <nav className="space-y-6">
                  {menuItems.map((sec) => (
                    <div key={sec.section} className="space-y-1.5">
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest pl-3 mb-1.5">{sec.section}</p>
                      <div className="space-y-1">
                        {sec.items.map((item) => {
                          const Icon = item.icon;
                          const isSelected = activePage === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActivePage(item.id as ActivePage);
                                // On mobile, auto-close sidebar on item select
                                if (window.innerWidth < 1024) {
                                  setIsSidebarOpen(false);
                                }
                              }}
                              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left font-mono text-xs transition-all cursor-pointer focus:outline-none ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-950 to-slate-900 border-l-2 border-blue-500 text-blue-400 font-medium' 
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                              }`}
                              id={`menu_item_${item.id}`}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Sidebar bottom segment - Broker list & Logout */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 space-y-4">
                {/* Mobile Connection Status Widget (only visible inside sidebar on smaller screens) */}
                <div className="lg:hidden bg-slate-900 p-3 rounded-lg border border-slate-800/60 font-mono text-[10px] space-y-2">
                  <p className="text-slate-500 tracking-wider">MQTT STAND STATUS</p>
                  <div className="flex justify-between items-center bg-slate-950/50 p-1.5 px-2 rounded">
                    <span>Cedalo:</span>
                    <span className="flex items-center gap-1.5 font-bold">
                      {getConnectionBullet(connectionStatus.Cedalo)}
                      {getStatusLabelText(connectionStatus.Cedalo)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/50 p-1.5 px-2 rounded">
                    <span>Flespi:</span>
                    <span className="flex items-center gap-1.5 font-bold">
                      {getConnectionBullet(connectionStatus.CrystalMQ)}
                      {getStatusLabelText(connectionStatus.CrystalMQ)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/50 p-1.5 px-2 rounded">
                    <span>Shiftr:</span>
                    <span className="flex items-center gap-1.5 font-bold">
                      {getConnectionBullet(connectionStatus.MyQttHub)}
                      {getStatusLabelText(connectionStatus.MyQttHub)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-mono text-xs py-2.5 px-4 rounded-lg border border-rose-900/30 transition-all cursor-pointer focus:outline-none"
                  id="logout_sidebar_btn"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>KELUAR AKUN</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 3. CORE CONTENT WORKSPACE AREA */}
        <main className="flex-1 bg-slate-950 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full">
          {children}
        </main>

      </div>
    </div>
  );
}
