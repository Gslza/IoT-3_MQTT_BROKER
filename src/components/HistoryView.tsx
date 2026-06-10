import React, { useState } from 'react';
import { useIoT } from '../context/IoTContext';
import { History, Radio, Trash2, ArrowUpDown, Server, Search, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryViewProps {
  initialTab?: 'suhu' | 'kelembapan' | 'logs';
}

export default function HistoryView({ initialTab = 'suhu' }: HistoryViewProps) {
  const { 
    tempHistory, 
    humidityHistory, 
    logs, 
    clearLogs, 
    clearTempHistory, 
    clearHumidityHistory 
  } = useIoT();

  const [activeTab, setActiveTab] = useState<'suhu' | 'kelembapan' | 'logs'>(initialTab);

  // Styling for log types
  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">SUCCESS</span>;
      case 'warning':
        return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">WARNING</span>;
      case 'error':
        return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">ERROR</span>;
      case 'publish':
        return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">PUBLISH</span>;
      case 'subscribe':
        return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">SUBSCRIBE</span>;
      default:
        return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">INFO</span>;
    }
  };

  const getLogTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400/90';
      case 'warning': return 'text-amber-400/95';
      case 'error': return 'text-rose-400/95';
      case 'publish': return 'text-blue-300';
      case 'subscribe': return 'text-cyan-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          Data Summary & Log Aktivitas
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Pantau riwayat pembacaan sensor DHT fisik dan seluruh log operasional komunikasi multi-broker MQTT.
        </p>
      </div>

      {/* Modern Tabs control strip */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-slate-900/60 p-2 border border-slate-800/80 rounded-xl backdrop-blur-md gap-4 shadow-md">
        
        <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800/60 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('suhu')}
            className={`flex-1 sm:flex-none text-xs font-mono px-4 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'suhu' 
                ? 'bg-slate-800 border border-slate-700 font-semibold text-cyan-400' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab_data_suhu_btn"
          >
            DATA SUHU ({tempHistory.length})
          </button>
          
          <button
            onClick={() => setActiveTab('kelembapan')}
            className={`flex-1 sm:flex-none text-xs font-mono px-4 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'kelembapan' 
                ? 'bg-slate-800 border border-slate-700 font-semibold text-cyan-400' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab_data_hum_btn"
          >
            DATA LEBMAP ({humidityHistory.length})
          </button>
          
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 sm:flex-none text-xs font-mono px-4 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'logs' 
                ? 'bg-slate-800 border border-slate-700 font-semibold text-indigo-400' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab_log_mqtt_btn"
          >
            LOG MQTT ({logs.length})
          </button>
        </div>

        {/* Dynamic Wipe button */}
        {activeTab === 'suhu' && tempHistory.length > 0 && (
          <button
            onClick={clearTempHistory}
            className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:text-rose-300 font-mono text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none"
            id="clear_temp_history_btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>HAPUS DATA SUHU</span>
          </button>
        )}

        {activeTab === 'kelembapan' && humidityHistory.length > 0 && (
          <button
            onClick={clearHumidityHistory}
            className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:text-rose-300 font-mono text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none"
            id="clear_hum_history_btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>HAPUS DATA LEMBAP</span>
          </button>
        )}

        {activeTab === 'logs' && logs.length > 0 && (
          <button
            onClick={clearLogs}
            className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:text-rose-300 font-mono text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none"
            id="clear_mqtt_logs_btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>BERSIHKAN LOG</span>
          </button>
        )}

      </div>

      {/* Table Containers */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md overflow-hidden">
        
        {/* TAB 1: TEMPERATURE HISTORY TABLE */}
        {activeTab === 'suhu' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider pb-3">
                    <th className="py-3 px-4 font-semibold">Waktu Diterima</th>
                    <th className="py-3 px-4 font-semibold">Broker Pengirim</th>
                    <th className="py-3 px-4 font-semibold">Device Client</th>
                    <th className="py-3 px-4 font-semibold text-right">Nilai Pembacaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tempHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 px-4 text-center text-slate-500">
                        Belum ada riwayat perekaman suhu masuk. Hubungkan broker atau kirim data simulasi.
                      </td>
                    </tr>
                  ) : (
                    tempHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 text-slate-300 transition-colors">
                        <td className="py-3 px-4 text-slate-400">{item.timestamp}</td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{item.broker}</td>
                        <td className="py-3 px-4 text-slate-500">{item.device_id}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-white font-bold text-sm">{item.temperature}</span>
                          <span className="text-rose-500 ml-1">°C</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 text-right leading-normal font-mono">
              * Menampilkan batas penyimpanan hingga 100 data riwayat sensor suhu.
            </p>
          </div>
        )}

        {/* TAB 2: HUMIDITY HISTORY TABLE */}
        {activeTab === 'kelembapan' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider pb-3">
                    <th className="py-3 px-4 font-semibold">Waktu Diterima</th>
                    <th className="py-3 px-4 font-semibold">Broker Pengirim</th>
                    <th className="py-3 px-4 font-semibold">Device Client</th>
                    <th className="py-3 px-4 font-semibold text-right">Nilai Pembacaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {humidityHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 px-4 text-center text-slate-500">
                        Belum ada riwayat perekaman kelembapan masuk. Hubungkan broker atau kirim data simulasi.
                      </td>
                    </tr>
                  ) : (
                    humidityHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 text-slate-300 transition-colors">
                        <td className="py-3 px-4 text-slate-400">{item.timestamp}</td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{item.broker}</td>
                        <td className="py-3 px-4 text-slate-500">{item.device_id}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-white font-bold text-sm">{item.humidity}</span>
                          <span className="text-cyan-400 ml-1">% RH</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 text-right leading-normal font-mono">
              * Menampilkan batas penyimpanan hingga 100 data riwayat sensor kelembapan.
            </p>
          </div>
        )}

        {/* TAB 3: LIVE OPERATIONAL MQTT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Live Session Interactive Terminal</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-[450px] overflow-y-auto space-y-2 select-text font-mono text-xs leading-relaxed">
              {logs.length === 0 ? (
                <p className="text-slate-600 text-center py-10">Terminal kosong. Log akan diisikan saat client MQTT and Voice memulai aktivitas.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 hover:bg-slate-900/60 p-1.5 rounded transition-all">
                    
                    {/* Timestamp & Type Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      {getLogTypeBadge(log.type)}
                    </div>

                    {/* Broker Name Column */}
                    <div className="text-[10px] text-cyan-400 font-bold shrink-0 min-w-[100px] max-w-[150px] truncate" title={log.broker}>
                      {log.broker}
                    </div>

                    {/* Core Message details */}
                    <div className={`flex-1 break-all ${getLogTextColor(log.type)}`}>
                      {log.message}
                    </div>

                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>* Logging disimpan secara lokal di client browser.</span>
              <span>Jumlah Log: <strong>{logs.length}</strong></span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
