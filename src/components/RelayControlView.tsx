import React from 'react';
import { useIoT } from '../context/IoTContext';
import { Power, Radio, Zap, Sparkles, AlertCircle, ToggleLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function RelayControlView() {
  const { 
    relayState, 
    publishRelay, 
    publishAllRelays, 
    publishMode, 
    connectionStatus 
  } = useIoT();

  const relays = [
    { id: 1, key: 'relay1', name: 'Relay Beban 1', desc: 'Sistem Penerangan Ruang Utama' },
    { id: 2, key: 'relay2', name: 'Relay Beban 2', desc: 'Modul Air Conditioner / Kipas' },
    { id: 3, key: 'relay3', name: 'Relay Beban 3', desc: 'Pompa Irigasi Hidroponik' },
    { id: 4, key: 'relay4', name: 'Relay Beban 4', desc: 'Stop Kontak Selang Sekunder' },
  ] as const;

  const totalConnected = Object.values(connectionStatus).filter(s => s === 'connected').length;

  return (
    <div className="space-y-6">
      
      {/* Title segments */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Pusat Kontrol Actuator Relay
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Kendalikan saklar beban listrik fisik secara langsung. Komando dipublish serentak ke 3 broker MQTT terkonfigurasi.
          </p>
        </div>

        {totalConnected === 0 && (
          <div className="bg-amber-950/40 border border-amber-900/50 py-1.5 px-3.5 rounded-lg text-[10px] font-mono text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Semua Broker Offline. Aksi akan diproses secara simulasi lokal.</span>
          </div>
        )}
      </div>

      {/* Quick Global Action Board and Variations */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between gap-5 items-stretch md:items-center">
        
        <div className="space-y-1">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Aksi Global Serentak</p>
          <p className="text-[10px] text-slate-500 font-sans">Mengirim perintah simultan ke seluruh 4 relay sekaligus.</p>
        </div>

        {/* Global toggles and Variations buttons */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            onClick={() => publishAllRelays('ON')}
            className="bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 text-emerald-400 hover:text-emerald-300 font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer focus:outline-none select-none"
            id="all_on_relay_btn"
          >
            <Power className="w-3.5 h-3.5" />
            <span>AKTIFKAN SEMUA</span>
          </button>

          <button
            onClick={() => publishAllRelays('OFF')}
            className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-401 text-rose-400 hover:text-rose-300 font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer focus:outline-none select-none"
            id="all_off_relay_btn"
          >
            <Power className="w-3.5 h-3.5" />
            <span>MATIKAN SEMUA</span>
          </button>

          {/* Sequential variation */}
          <button
            onClick={() => publishMode('VARIASI1')}
            className="bg-blue-950/30 hover:bg-blue-950/60 border border-blue-900/50 text-blue-400 hover:text-blue-300 font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer focus:outline-none select-none"
            id="variation_left_right_btn"
            title="Relay menyala bergantian dari kiri ke kanan"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>VARIASI 1 (SEQUENTIAL)</span>
          </button>

          {/* Flashing strobe variation */}
          <button
            onClick={() => publishMode('VARIASI2')}
            className="bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 hover:text-cyan-300 font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer focus:outline-none select-none"
            id="variation_strobe_btn"
            title="Semua relay berkedip bersama seperti efek strobe"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>VARIASI 2 (STROBE)</span>
          </button>
        </div>

      </div>

      {/* 4 Cards arrangement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {relays.map((relay) => {
          const isActive = relayState[relay.key];
          return (
            <div 
              key={relay.id}
              className={`bg-slate-900/40 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shadow-lg ${
                isActive 
                  ? 'border-emerald-500/30 shadow-emerald-950/10' 
                  : 'border-slate-800/80 shadow-slate-950/20'
              }`}
            >
              
              {/* Neon Glow Circle when Active */}
              {isActive && (
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Card Header section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Relay #{relay.id}</span>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-950 text-slate-600 border border-slate-800/60'}`}>
                    <Power className="w-4 h-4 shrink-0" />
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-bold font-sans text-white">{relay.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans font-light min-h-[32px]">
                    {relay.desc}
                  </p>
                </div>
              </div>

              {/* Status Indicator & Toggles */}
              <div className="border-t border-slate-800/60 mt-6 pt-5 flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold font-mono tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  STATUS: {isActive ? 'ON' : 'OFF'}
                </span>

                <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800/60">
                  <button
                    onClick={() => publishRelay(relay.id, 'ON')}
                    className={`text-[10px] font-bold font-mono px-3 py-1.5 rounded transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600/25 border border-emerald-500/40 text-emerald-400' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    id={`relay_on_card_${relay.id}`}
                  >
                    ON
                  </button>
                  <button
                    onClick={() => publishRelay(relay.id, 'OFF')}
                    className={`text-[10px] font-bold font-mono px-3 py-1.5 rounded transition-all cursor-pointer ${
                      !isActive 
                        ? 'bg-slate-800 border border-slate-700 text-slate-300' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    id={`relay_off_card_${relay.id}`}
                  >
                    OFF
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
