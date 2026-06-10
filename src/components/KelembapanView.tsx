import React from 'react';
import { useIoT } from '../context/IoTContext';
import Humidity3D from './Humidity3D';
import { Droplets, Wind, Shield, HelpCircle, Activity } from 'lucide-react';

export default function KelembapanView() {
  const { sensorData, simulateSensorPayload } = useIoT();
  const indexHum = sensorData.humidity;

  const getHumStatus = (h: number) => {
    if (h < 40) return { status: 'Kering', desc: 'Kelembapan rendah terdeteksi. Lingkungan cenderung kering yang dapat memicu ketidaknyamanan mata / kulit.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    if (h >= 40 && h <= 70) return { status: 'Normal', desc: 'Tingkat kelembapan ideal untuk kesehatan manusia dan meminimalkan pertumbuhan bakteri dan jamur.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    return { status: 'Lembap / Basah', desc: 'Kelembapan tinggi terdeteksi. Risiko pertumbuhan jamur pada dinding meningkat, ruangan terasa pengap.', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
  };

  const statusObj = getHumStatus(indexHum);

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400 animate-pulse" />
            Monitoring Sensor Kelembapan Udara
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Pemantauan kadar air sensor DHT11/DHT22 terintegrasi model 3D Interaktif menggunakan Three.js WebGL rendering.
          </p>
        </div>

        {/* Dynamic Simulation button */}
        <button
          onClick={simulateSensorPayload}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none select-none"
          id="simulate_hum_btn"
        >
          <Wind className="w-4 h-4 shrink-0" />
          <span>Simulasi Data Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual 3D Component Frame */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md shadow-xl min-h-[350px]">
          <div className="absolute top-4 left-4 font-mono text-[9px] text-slate-500 tracking-wider uppercase">
            3D Humid Emoticon (Three.js WebGL)
          </div>
          <div className="absolute top-4 right-4 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            Sumber Data: <span className="font-semibold text-cyan-400">{sensorData.broker}</span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center">
            {/* The actual live 3D Canvas rendering */}
            <Humidity3D humidity={indexHum} />
          </div>

          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-4">
            * Geser dengan mouse / tekan sentuh untuk memutar model
          </p>
        </div>

        {/* Value Dashboard panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main Giant Meter Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Kandungan Udara</h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-sans font-bold tracking-tighter text-white">
                {indexHum}
              </span>
              <span className="text-3xl text-cyan-400 font-sans font-light animate-bounce">
                % RH
              </span>
            </div>

            <div className={`mt-5 p-4 rounded-xl border ${statusObj.bg} ${statusObj.border} flex flex-col gap-1.5`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold font-mono ${statusObj.color}`}>
                  KONDISI: {statusObj.status.toUpperCase()}
                </span>
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{statusObj.desc}</p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Ambivalensi Skala Kelembapan</h4>
            
            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded text-amber-400">
                <span>Kelembapan &lt; 40%</span>
                <span>Kuning • Berputar Lambat</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded text-emerald-400">
                <span>Kelembapan 40% - 70%</span>
                <span>Hijau • Berputar Stabil</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded text-cyan-400">
                <span>Kelembapan &gt; 70%</span>
                <span>Biru Muda • Gelombang Naik Turun</span>
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
