import React from 'react';
import { useIoT } from '../context/IoTContext';
import Temperature3D from './Temperature3D';
import { Thermometer, Radio, ArrowUpRight, Shield, AlertTriangle, Wind } from 'lucide-react';
import { motion } from 'motion/react';

export default function SuhuView() {
  const { sensorData, simulateSensorPayload } = useIoT();
  const temp = sensorData.temperature;

  // Format thermal threshold statuses
  const getSuhuStatus = (t: number) => {
    if (t < 25) return { status: 'Dingin', desc: 'Suhu di bawah ambang batas normal. Udara cenderung sejuk/dingin.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'blue' };
    if (t >= 25 && t <= 30) return { status: 'Normal', desc: 'Kondisi suhu ruangan ideal untuk perumahan dan perkantoran.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', accent: 'emerald' };
    if (t > 30 && t <= 35) return { status: 'Panas', desc: 'Temperatur menghangat. Perlu sirkulasi udara or nyalakan pendingin ruangan.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', accent: 'orange' };
    return { status: 'Sangat Panas', desc: 'Suhu ekstrem terdeteksi! Segera periksa peralatan listrik atau pendingin ruangan!', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', accent: 'rose' };
  };

  const currentStatus = getSuhuStatus(temp);

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-rose-500 animate-pulse" />
            Monitoring Sensor Suhu Realtime
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Pemantauan termal sensor DHT11/DHT22 terintegrasi grafis 3D Interaktif menggunakan geometri rendering Three.js.
          </p>
        </div>

        {/* Manual Test trigger button */}
        <button
          onClick={simulateSensorPayload}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none select-none"
          id="simulate_temp_btn"
        >
          <Wind className="w-4 h-4 shrink-0" />
          <span>Simulasi Data Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual 3D Component Frame */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md shadow-xl min-h-[350px]">
          <div className="absolute top-4 left-4 font-mono text-[9px] text-slate-500 tracking-wider uppercase">
            3D Emoticon Model (Three.js WebGL)
          </div>
          <div className="absolute top-4 right-4 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            Sumber Data: <span className="font-semibold text-cyan-400">{sensorData.broker}</span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center">
            {/* The actual live 3D Canvas rendering */}
            <Temperature3D temperature={temp} />
          </div>

          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-4">
            * Geser dengan mouse / tekan sentuh untuk memutar model
          </p>
        </div>

        {/* Value Dashboard panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main Giant Meter Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Nilai Suhu Kamar</h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-sans font-bold tracking-tighter text-white">
                {temp}
              </span>
              <span className="text-3xl text-rose-500 font-sans font-light">
                °C
              </span>
            </div>

            <div className={`mt-5 p-4 rounded-xl border ${currentStatus.bg} ${currentStatus.border} flex flex-col gap-1.5`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold font-mono ${currentStatus.color}`}>
                  KONDISI: {currentStatus.status.toUpperCase()}
                </span>
                {temp > 35 ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                ) : (
                  <Shield className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentStatus.desc}</p>
            </div>
          </div>

          {/* Logical guidelines table representing system condition */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Indikator Threshold Sistem</h4>
            
            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded">
                <span className="text-blue-400">Suhu &lt; 25°C</span>
                <span className="text-slate-400">Biru • Menggigil</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded">
                <span className="text-emerald-400">Suhu 25°C - 30°C</span>
                <span className="text-slate-400">Hijau • Berputar Perlahan</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded">
                <span className="text-orange-400">Suhu 31°C - 35°C</span>
                <span className="text-slate-400">Oranye • Berputar Cepat</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded text-rose-400">
                <span>Suhu &gt; 35°C</span>
                <span>Merah • Bergetar Sangat Cepat</span>
              </div>
            </div>
            
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/60 pt-3">
              <span>Waktu Sinkronisasi Terakhir:</span>
              <span className="text-slate-300 font-bold">{sensorData.lastUpdated}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
