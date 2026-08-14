import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, CheckCircle2, KeyRound, Lock, Mail, ShieldAlert, User, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onOpenRegister }) => {
  const { switchUserRole, users, login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = (userId: string) => {
    switchUserRole(userId);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error occurred.');
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-500" /> DMS Secure Access Authentication
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Role Switcher Presets */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3 h-3 text-amber-500" /> Quick Demo Role Login:
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('user-super-admin')}
              className="p-2 text-left rounded-lg bg-white dark:bg-slate-900 hover:border-rose-500 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-bold text-rose-600 dark:text-rose-400">Super Administrator</div>
                <div className="text-[10px] text-slate-400">admin@dojangsystem.com • Password: Password123!</div>
              </div>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user-master-kim')}
              className="p-2 text-left rounded-lg bg-white dark:bg-slate-900 hover:border-amber-500 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-bold text-amber-600 dark:text-amber-400">Master Kim (Tiger TKD Owner)</div>
                <div className="text-[10px] text-slate-400">master.kim@tigertkd.com • Password: Master123!</div>
              </div>
              <Award className="w-4 h-4 text-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user-manager-santos')}
              className="p-2 text-left rounded-lg bg-white dark:bg-slate-900 hover:border-blue-500 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-bold text-blue-600 dark:text-blue-400">Manager Carlos (Westside Branch)</div>
                <div className="text-[10px] text-slate-400">manager.santos@tigertkd.com • Password: Manager123!</div>
              </div>
              <User className="w-4 h-4 text-blue-500" />
            </button>
          </div>
        </div>

        {/* Login Form */}
        {!isForgotPassword ? (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="master@tigertkd.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In to Dojang Portal'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Reset Your Password
            </h3>
            <p className="text-xs text-slate-500">
              Enter your account email below. An administrative reset link will be sent to your inbox or handled by your Super Admin.
            </p>

            {resetSent && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Password reset email dispatched successfully!
              </div>
            )}

            <div>
              <input
                type="email"
                required
                placeholder="master@tigertkd.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Back to Login
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow cursor-pointer"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Don't have a Dojang registered yet?{' '}
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Register Master Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
