import React, { useState, useEffect, useRef } from 'react';
import { useIoT } from '../context/IoTContext';
import VoiceSpectrum3D from './VoiceSpectrum3D';
import { Mic, MicOff, Info, Play, CheckCircle, Volume2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function VoiceView() {
  const { 
    voiceText, 
    setVoiceText, 
    isVoiceListening, 
    setIsVoiceListening, 
    triggerVoiceCommand,
    addLog
  } = useIoT();

  const [supportMessage, setSupportMessage] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [speechIntensity, setSpeechIntensity] = useState(0);

  const recognitionRef = useRef<any>(null);
  const intensityIntervalRef = useRef<any>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupportMessage('Browser ini tidak mendukung Web Speech API secara asli. Sila gunakan simulasi di bawah.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'id-ID'; // Indonesian Language Requirement

      rec.onstart = () => {
        setIsVoiceListening(true);
        setRecognitionError('');
        addLog('info', 'Voice Engine', 'Pengenalan suara aktif, mulailah berbicara...');
        
        // Simulating speech sound intensity wave values for Three.js
        intensityIntervalRef.current = setInterval(() => {
          setSpeechIntensity(0.1 + Math.random() * 0.9);
        }, 150);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        triggerVoiceCommand(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setRecognitionError(`Error: ${event.error}. Pastikan mic terpasang dan ijin frame aktif.`);
        setIsVoiceListening(false);
        stopIntensitySim();
      };

      rec.onend = () => {
        setIsVoiceListening(false);
        stopIntensitySim();
      };

      recognitionRef.current = rec;
    } catch (e: any) {
      setSupportMessage(`Inisialisasi gagal: ${e.message}`);
    }

    return () => {
      stopIntensitySim();
    };
  }, []);

  const stopIntensitySim = () => {
    if (intensityIntervalRef.current) {
      clearInterval(intensityIntervalRef.current);
    }
    setSpeechIntensity(0);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setVoiceText('Mendengarkan...');
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Recognition already started, ignore
      }
    } else {
      setSupportMessage('Navigasi mic error atau diblokir iframe. Tenang, Anda masih bisa menggunakan mode asisten simulasi di bawah ini!');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsVoiceListening(false);
    stopIntensitySim();
  };

  // Commands available to click for instant testing
  const sampleCommands = [
    'nyalakan relay 1',
    'matikan relay 1',
    'nyalakan semua relay',
    'matikan semua relay',
    'jalankan variasi 1',
    'jalankan variasi 2',
    'baca suhu',
    'baca kelembapan'
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Segment */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-blue-500" />
          Voice Command Controller
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Kendalikan modul perangkat keras ESP32 dan baca status menggunakan asisten perintah suara pintar Bahasa Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual 3D Spectrum Card */}
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between overflow-hidden relative shadow-lg">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-slate-950/80 px-2.5 py-1 rounded-full border border-cyan-950">
            <Sparkles className="w-3.5 h-3.5" />
            3D Spectrum Audio Visualizer
          </div>

          {/* ThreeJS visualizer stage */}
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            <VoiceSpectrum3D isActive={isVoiceListening} intensity={speechIntensity} />
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/60 font-mono text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">HASIL PENGENALAN TRANSKRIP</p>
            <p className={`text-sm ${isVoiceListening ? 'text-cyan-400 animate-pulse' : 'text-slate-200'}`}>
              {voiceText || 'Tekan "MULAI DETEKSI" dan sebutkan perintah Anda...'}
            </p>
          </div>
        </div>

        {/* Listening Operations Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Core Controls */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 space-y-5 shadow-lg">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Kontrol Suara</h3>
            
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <button 
                onClick={isVoiceListening ? stopListening : startListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform transform active:scale-95 cursor-pointer relative ${
                  isVoiceListening 
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50' 
                    : 'bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-950/50'
                }`}
                id="mic_trigger_radial_btn"
                title={isVoiceListening ? 'Berhenti mendengarkan' : 'Mulai mendengarkan'}
              >
                {/* Visual ripple effect when mic is listening */}
                {isVoiceListening && (
                  <span className="absolute inset-0 rounded-full bg-rose-600/30 animate-ping" />
                )}
                {isVoiceListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </button>

              <div className="text-center">
                <span className={`text-xs font-mono font-medium ${isVoiceListening ? 'text-rose-400' : 'text-slate-400'}`}>
                  {isVoiceListening ? 'Mendengarkan...' : 'Perangkat Mic Siap'}
                </span>
              </div>
            </div>

            {recognitionError && (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-[10px] text-red-400 font-mono">
                {recognitionError}
              </div>
            )}

            {supportMessage && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-amber-400/90 font-mono flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>{supportMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Sandbox Assistant Simulation for browser previews */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Asisten Simulasi</h3>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">Sandbox Ok</span>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
              Silakan klik tombol di bawah untuk menyimulasikan perkataan fisik Anda ke asisten suara tanpa halangan ijin hardware/iframe.
            </p>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 pt-1">
              {sampleCommands.map((command, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setVoiceText(command);
                    triggerVoiceCommand(command);
                  }}
                  className="bg-slate-950/70 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 text-left px-2.5 py-1.5 rounded text-[10px] text-slate-300 hover:text-cyan-400 font-mono transition-colors flex items-center justify-between group cursor-pointer focus:outline-none"
                  id={`sim_voice_btn_${idx}`}
                >
                  <span className="truncate">{command}</span>
                  <Volume2 className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Helper guide */}
      <div className="bg-slate-900/20 rounded-xl p-4 border border-slate-800/50 flex gap-3.5 text-xs text-slate-400 leading-relaxed max-w-3xl">
        <Info className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">Dukungan Bahasa Indonesia Terintegrasi</p>
          <p className="mt-1 font-sans">
            Sistem pengenalan suara dikonfigurasi menggunakan bahasa Indonesia resmi (<code className="font-mono text-cyan-400 text-[11px]">id-ID</code>). Ucapkan perintah dengan artikulasi jelas seperti "nyalakan relay 1" untuk menyalakan beban listrik, "baca suhu" untuk mendengarkan asisten membacakan nilai temperatur saat ini secara real-time.
          </p>
        </div>
      </div>

    </div>
  );
}
