import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { ShieldAlert, Cpu, Lock, Mail, Accessibility, Users, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      setError('Email dan Password wajib diisi.');
      return false;
    }
    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email atau Password salah.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else {
        setError(`Gagal login: ${err.message || 'Error tidak diketahui'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError('Registrasi berhasil! Anda langsung masuk ke dashboard.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else {
        setError(`Pendaftaran gagal: ${err.message || 'Error tidak diketahui'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    // Fill in a demo credentials for easier user testing
    setEmail('guest@gzza-iot.cz');
    setPassword('Abangaba11');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden text-slate-100">
      
      {/* Dynamic Ambient Background Sparkles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Code-style background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Core Card with Glassmorphism */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 shadow-cyan-950/20">
          
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-sans tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              SISTEM KENDALI IoT
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-widest">
              Multi-Broker & Perintah Suara
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-5 p-3 rounded-lg flex items-start gap-2.5 text-xs font-mono border ${
                error.includes('berhasil') 
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                  : 'bg-red-950/40 border-red-900/50 text-red-400'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                  placeholder="admin@iot-broker.com"
                  id="login_email_input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                  placeholder="******"
                  id="login_password_input"
                />
              </div>
            </div>

            {/* Authentication Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all transform active:scale-[0.98] shadow-lg shadow-cyan-900/30 font-mono flex items-center justify-center select-none cursor-pointer"
                id="login_submit_btn"
              >
                {loading ? 'Processing...' : isRegistering ? 'REGISTER AKUN BARU' : 'MASUK KE DASHBOARD'}
              </button>
            </div>
          </form>

          {/* Toggle Register / Login */}
          <div className="mt-6 flex flex-col gap-3 text-center border-t border-slate-800/60 pt-5">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono tracking-wide cursor-pointer focus:outline-none"
              id="toggle_register_btn"
            >
              {isRegistering ? 'Sudah punya akun? Login di sini' : 'Belum punya akun? Registrasi Sekarang'}
            </button>

            <button
              onClick={handleQuickDemo}
              className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors font-mono cursor-pointer uppercase tracking-widest mt-1 focus:outline-none"
              id="fill_demo_btn"
            >
              [ Gunakan Akun Demo Pengujian ]
            </button>
          </div>

        </div>

        {/* Humility & Platform Stamp */}
        <div className="text-center mt-6 text-[10px] text-slate-600 font-mono tracking-widest">
          ESP32 DEV KIT V1 • MULTI-BROKER CONTROLLER
        </div>
      </motion.div>
    </div>
  );
}
