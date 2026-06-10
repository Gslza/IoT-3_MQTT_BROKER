import React, { useState } from 'react';
import { useIoT } from '../context/IoTContext';
import { Settings, Save, RotateCcw, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { MQTTConfigs } from '../types';

export default function SettingsView() {
  const { configs, saveConfigs, resetConfigs, connectionStatus } = useIoT();

  // Local state to manage edits before save
  const [localConfigs, setLocalConfigs] = useState<MQTTConfigs>(() => JSON.parse(JSON.stringify(configs)));

  const handleInputChange = (
    brokerKey: keyof MQTTConfigs,
    field: keyof MQTTConfigs[keyof MQTTConfigs],
    value: string | number
  ) => {
    setLocalConfigs((prev) => ({
      ...prev,
      [brokerKey]: {
        ...prev[brokerKey],
        [field]: value
      }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfigs(localConfigs);
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan konfigurasi semua broker MQTT ke pengaturan default pabrik?')) {
      resetConfigs();
      // Sync local form state
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const brokers: { key: keyof MQTTConfigs; label: string; placeholderWss: string }[] = [
    { key: 'Cedalo', label: 'Broker 1: Cedalo MQTT', placeholderWss: 'wss://pf-khkqcj4oqntlaiv975yr.cedalo.cloud:443/mqtt' },
    { key: 'CrystalMQ', label: 'Broker 2: CrystalMQ (Flespi)', placeholderWss: 'wss://mqtt.flespi.io:443' },
    { key: 'MyQttHub', label: 'Broker 3: Shiftr.io', placeholderWss: 'wss://gusliza.cloud.shiftr.io:443' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Konfigurasi MQTT Multi-Broker
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Atur parameter WebSocket Secure untuk ketiga broker MQTT. Setiap instruksi kontrol akan dialirkan serentak.
          </p>
        </div>

        {/* Global Reset settings */}
        <button
          type="button"
          onClick={handleReset}
          className="bg-slate-900 border border-slate-800 hover:border-rose-955 hover:bg-slate-800 hover:text-rose-400 px-4 py-2 rounded-lg text-xs font-mono text-slate-400 transition-all flex items-center gap-2 cursor-pointer focus:outline-none"
          id="global_reset_settings_btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Setelan Default</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Three Broker Configurations Forms */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {brokers.map((broker) => {
            const bConfig = localConfigs[broker.key];
            const liveStatus = connectionStatus[broker.key];
            
            return (
              <div 
                key={broker.key}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between"
              >
                
                {/* Form header space */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">{broker.label}</h3>
                    
                    {/* Status badge and bullet */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className={`w-2 h-2 rounded-full ${
                        liveStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                        liveStatus === 'connecting' ? 'bg-amber-500 animate-ping' :
                        liveStatus === 'error' ? 'bg-rose-500' : 'bg-slate-600'
                      }`} />
                      <span className={`${
                        liveStatus === 'connected' ? 'text-emerald-400' :
                        liveStatus === 'connecting' ? 'text-amber-400' :
                        liveStatus === 'error' ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {liveStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Form fields set */}
                  <div className="space-y-3 font-mono text-xs">
                    
                    {/* WebSocket WSS URL */}
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">WebSocket URL (WSS)</label>
                      <input
                        type="text"
                        value={bConfig.websocketUrl}
                        onChange={(e) => handleInputChange(broker.key, 'websocketUrl', e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-300"
                        placeholder={broker.placeholderWss}
                        id={`settings_${broker.key}_url`}
                      />
                    </div>

                    {/* Port */}
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">Port</label>
                      <input
                        type="number"
                        value={bConfig.port}
                        onChange={(e) => handleInputChange(broker.key, 'port', parseInt(e.target.value) || 443)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-300"
                        placeholder="443"
                        id={`settings_${broker.key}_port`}
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">Username / Token</label>
                      <input
                        type="text"
                        value={bConfig.username}
                        onChange={(e) => handleInputChange(broker.key, 'username', e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-300"
                        placeholder="Isi username"
                        id={`settings_${broker.key}_username`}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">Password</label>
                      <input
                        type="password"
                        value={bConfig.password || ''}
                        onChange={(e) => handleInputChange(broker.key, 'password', e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-300"
                        placeholder="••••••"
                        id={`settings_${broker.key}_password`}
                      />
                    </div>

                    {/* Client ID */}
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">Client ID</label>
                      <input
                        type="text"
                        value={bConfig.clientId}
                        onChange={(e) => handleInputChange(broker.key, 'clientId', e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-300"
                        id={`settings_${broker.key}_client`}
                      />
                    </div>

                    {/* Base Topic */}
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">Base Topic</label>
                      <input
                        type="text"
                        value={bConfig.baseTopic}
                        onChange={(e) => handleInputChange(broker.key, 'baseTopic', e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-slate-300 text-[11px]"
                        placeholder="gzza-core/iot/esp32-gzza-core-01"
                        id={`settings_${broker.key}_topic`}
                      />
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Form submitting footer */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-start gap-2 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <p>
              <strong>Kebijakan Keamanan:</strong> Seluruh password and token di atas dienkapsulasi dan hanya disimpan di memori <code className="text-cyan-400">localStorage</code> peramban Anda. Tidak pernah dikirimkan atau dipotong ke server eksternal perantara.
            </p>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-mono text-xs px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 font-bold transition-all hover:scale-[1.01] active:scale-95 select-none cursor-pointer"
            id="settings_configuration_submit_btn"
          >
            <Save className="w-4 h-4" />
            <span>TERAPKAN DAN HUBUNGKAN</span>
          </button>

        </div>

      </form>

      {/* Helper guide */}
      <div className="bg-slate-900/20 rounded-xl p-4 border border-slate-800/50 flex gap-3 text-xs text-slate-400 max-w-4xl font-sans leading-relaxed">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">Panduan Teknis Subskripsi Perangkat Keras</p>
          <p className="mt-1">
            Guna berkomunikasi secara dua arah, pastikan Base Topic di atas sama dengan yang terunggah di firmware mikrokontroler ESP32 Anda. Dashboard ini akan otomatis mempublikasikan perintah setela diklik ke sub-topik <code className="font-mono text-cyan-400 text-[11px] bg-slate-950 px-1 py-0.5 rounded">/[baseTopic]/relay/+/set</code> and mendengarkan data sensor DHT pada sub-topik <code className="font-mono text-cyan-400 text-[11px] bg-slate-950 px-1 py-0.5 rounded">/[baseTopic]/sensor</code>.
          </p>
        </div>
      </div>

    </div>
  );
}
