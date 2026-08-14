import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DojangTenant } from '../../types';
import {
  Award,
  Building,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  PenTool,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    visibleBranches,
    updateDojangSettings,
    updateUserProfile,
    updateBranch,
  } = useApp();

  const isBranchManager = currentUser.role === 'BRANCH_MANAGER';

  // Branch Manager state
  const myBranch = visibleBranches.find((b) => b.id === currentUser.branchId) || visibleBranches[0];
  const [managerSignature, setManagerSignature] = useState<string>(currentUser.signature || myBranch?.signature || '');
  const [managerPhone, setManagerPhone] = useState<string>(currentUser.phone || myBranch?.phone || '');
  const [managerName, setManagerName] = useState<string>(currentUser.name || '');

  // Master / Dojang Tenant State
  const [formData, setFormData] = useState<DojangTenant>(() => {
    return (
      currentTenant || {
        id: 'dojang-tiger',
        masterId: 'user-master-kim',
        name: 'Tiger Taekwondo Academy',
        logo: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80',
        stampSeal: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        signature: '',
        motto: 'Courtesy, Integrity, Perseverance, Self-Control, Indomitable Spirit',
        registrationNumber: 'TKD-INT-99812',
        danCertificateNumber: 'DAN-0582910',
        danRank: '7th Dan',
        passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        masterName: 'Grandmaster Sung-Min Kim',
        phone: '+1 (555) 382-9901',
        email: 'master.kim@tigertkd.com',
        website: 'https://tigertkd-academy.com',
        address: '742 Martial Way, Olympic Park',
        city: 'Seoul / California',
        country: 'United States',
        createdAt: '2023-01-15',
        status: 'Active',
        subscriptionPlan: 'Enterprise',
      }
    );
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBranchManager) {
      updateUserProfile({
        ...currentUser,
        name: managerName,
        phone: managerPhone,
        signature: managerSignature,
      });
      if (myBranch) {
        updateBranch({
          ...myBranch,
          managerName,
          phone: managerPhone,
          signature: managerSignature,
        });
      }
    } else {
      updateDojangSettings(formData);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isBranchManager) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Branch Manager Profile & Signature
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload or update your official manager signature to certify branch receipts, student cards, and reports. Logo and official stamp seal management are reserved for the Master.
          </p>
        </div>

        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Branch Manager signature and profile details saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Branch Manager Signature & Branding Notice */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-500" />
                Branch Manager Signature Upload
              </h2>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Branch Manager Access Level
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Manager Signature */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-blue-500" />
                  Your Manager Signature
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  This signature will appear on official receipts, attendance sheets, and student cards generated under your branch.
                </p>

                <div className="flex flex-col items-center gap-3 pt-2">
                  {managerSignature ? (
                    <div className="relative group w-48 h-24 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <img
                        src={managerSignature}
                        alt="Manager Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setManagerSignature('')}
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                        title="Remove Signature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-24 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-400 text-xs text-center p-3">
                      No Manager Signature Uploaded
                    </div>
                  )}

                  <div className="w-full flex flex-col items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="manager-signature-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setManagerSignature(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="manager-signature-upload"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      {managerSignature ? 'Upload New Signature' : 'Upload Signature'}
                    </label>

                    {managerSignature && (
                      <button
                        type="button"
                        onClick={() => setManagerSignature('')}
                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Signature
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Master Privilege Notice / Read-Only Dojang Assets */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Institutional Assets (Master Privilege Only)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                    The Dojang Logo and Official Red/Gold Stamp Seal are institution-wide assets managed strictly by the Master / Grandmaster.
                  </p>

                  <div className="flex items-center justify-around gap-4 pt-2">
                    <div className="text-center space-y-1">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Dojang Logo</div>
                      <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center mx-auto shadow-sm">
                        {currentTenant?.logo ? (
                          <img src={currentTenant.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-400">None</span>
                        )}
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Stamp Seal</div>
                      <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center mx-auto shadow-sm">
                        {currentTenant?.stampSeal ? (
                          <img src={currentTenant.stampSeal} alt="Stamp" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-400">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/50 text-center italic mt-3">
                  Contact your Grandmaster/Owner to update official institutional logos or stamp seals.
                </div>
              </div>
            </div>
          </div>

          {/* Manager Info */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              Manager Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Manager Full Name
                </label>
                <input
                  type="text"
                  required
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Manager Contact Phone
                </label>
                <input
                  type="text"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Manager Signature & Settings
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          Dojang Institutional Settings & Branding
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure official dojang credentials, uploaded logo, stamp seal, master signature, registration number, and motto.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Dojang settings updated successfully! These changes will reflect automatically across all reports, receipts, and certificates.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branding & Visual Assets */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            Official Logo, Stamp Seal & Master Signature
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Section */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Dojang Logo
              </label>
              <div className="flex flex-col gap-2">
                {formData.logo ? (
                  <div className="relative group w-20 h-20 mx-auto flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <img
                      src={formData.logo}
                      alt="Logo Preview"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 text-[10px] text-center p-2">
                    No Logo Uploaded
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, logo: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-[11px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                />
                {formData.logo && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: '' })}
                    className="w-full text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Logo
                  </button>
                )}
              </div>
            </div>

            {/* Stamp Seal Section */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Red/Gold Stamp Seal
              </label>
              <div className="flex flex-col gap-2">
                {formData.stampSeal ? (
                  <div className="relative group w-20 h-20 mx-auto flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <img
                      src={formData.stampSeal}
                      alt="Seal Preview"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stampSeal: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                      title="Remove Stamp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 text-[10px] text-center p-2">
                    No Stamp Uploaded
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, stampSeal: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-[11px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                />
                {formData.stampSeal && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stampSeal: '' })}
                    className="w-full text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Stamp
                  </button>
                )}
              </div>
            </div>

            {/* Master Signature Section */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5 text-blue-500" />
                Master / Official Signature
              </label>
              <div className="flex flex-col gap-2">
                {formData.signature ? (
                  <div className="relative group w-24 h-20 mx-auto flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <img
                      src={formData.signature}
                      alt="Signature Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, signature: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                      title="Remove Signature"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-20 mx-auto flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 text-[10px] text-center p-2">
                    No Signature Uploaded
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, signature: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-[11px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                {formData.signature && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, signature: '' })}
                    className="w-full text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Signature
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dojang Motto / Tenets
            </label>
            <input
              type="text"
              value={formData.motto}
              onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Legal & Registration Credentials */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Registration & Dan Certification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trainer / Master Full Name
              </label>
              <input
                type="text"
                required
                value={formData.masterName || ''}
                onChange={(e) => setFormData({ ...formData, masterName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dan Rank / Belt Level
              </label>
              <input
                type="text"
                value={formData.danRank || ''}
                onChange={(e) => setFormData({ ...formData, danRank: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Federation Dan Certificate Number
              </label>
              <input
                type="text"
                value={formData.danCertificateNumber || ''}
                onChange={(e) => setFormData({ ...formData, danCertificateNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-semibold text-amber-600 dark:text-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dojang Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                National Dojang Registration Number
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-500" />
            Institutional Contact & Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Institutional Settings
          </button>
        </div>
      </form>
    </div>
  );
};
