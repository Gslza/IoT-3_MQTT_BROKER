import React from 'react';
import { IoTProvider, useIoT } from './context/IoTContext';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import VoiceView from './components/VoiceView';
import SuhuView from './components/SuhuView';
import KelembapanView from './components/KelembapanView';
import SettingsView from './components/SettingsView';
import HistoryView from './components/HistoryView';
import RelayControlView from './components/RelayControlView';
import { Cpu } from 'lucide-react';

function DashboardContent() {
  const { user, authLoading, activePage } = useIoT();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-400 font-mono">
        <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-cyan-400 animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest animate-pulse">Menghubungkan Sesi...</span>
      </div>
    );
  }

  // Not authenticated? Show Login Page
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated? Render Active Page inside DashboardLayout shell
  return (
    <DashboardLayout>
      {activePage === 'voice' && <VoiceView />}
      {activePage === 'suhu' && <SuhuView />}
      {activePage === 'kelembapan' && <KelembapanView />}
      {activePage === 'mqtt-config' && <SettingsView />}
      {activePage === 'data-suhu' && <HistoryView initialTab="suhu" />}
      {activePage === 'data-kelembapan' && <HistoryView initialTab="kelembapan" />}
      {activePage === 'log-mqtt' && <HistoryView initialTab="logs" />}
      {activePage === 'kontrol-relay' && <RelayControlView />}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <IoTProvider>
      <DashboardContent />
    </IoTProvider>
  );
}
