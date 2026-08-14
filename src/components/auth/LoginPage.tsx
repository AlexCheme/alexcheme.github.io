import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  CheckCircle2,
  Lock,
  Mail,
  Moon,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';

interface LoginPageProps {}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const { login, darkMode, toggleDarkMode } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setIsForgotPassword(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Top Navbar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
            TKD
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              DOJANG MANAGEMENT SYSTEM
            </span>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
              Multi-Tenant Enterprise Portal
            </span>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-1">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Portal Authentication</h1>
            <p className="text-xs text-slate-400">
              Sign in with your Dojang Master, Branch Manager, or Super Admin account
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {!isForgotPassword ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Account Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dojang.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Authenticating with Supabase...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Sign In to Dojang Portal
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <h3 className="text-xs font-bold text-white">Reset Account Credentials</h3>
              <p className="text-xs text-slate-400">
                Enter your account email to dispatch a secure administrative reset link.
              </p>

              {resetSent && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Password reset email sent successfully!
                </div>
              )}

              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="master@tigertkd.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-300 block">
                Master Account Registration
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                To register a new Dojang School on the platform, please contact the Super Administrator:
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-[11px] space-y-1.5 text-slate-300">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Alemayehu Sahle Shawul</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold ml-auto border border-rose-500/30">
                  Super Admin
                </span>
              </div>
              <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>alemayehusahleshawul@gmail.com</span>
                </div>
                <div className="flex items-center gap-1.5 pl-4">
                  <span>alemayehusahleshawul@outlook.com</span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>0927565651 &nbsp;|&nbsp; 0717675712</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 relative z-10 space-y-1">
        <div>Dojang Management System (DMS) © 2026 • Encrypted Session Access Control</div>
        <div className="text-[11px] text-slate-400">
          Super Admin Contact: <span className="text-slate-300 font-medium">Alemayehu Sahle Shawul</span> (0927565651 / 0717675712)
        </div>
      </footer>
    </div>
  );
};
