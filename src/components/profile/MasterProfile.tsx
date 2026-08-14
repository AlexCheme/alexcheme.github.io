import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DojangTenant } from '../../types';
import {
  Award,
  Building,
  Calendar,
  Camera,
  CheckCircle2,
  Edit,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

export const MasterProfile: React.FC = () => {
  const { currentTenant, updateDojangSettings, visibleBranches, visibleStudents, users } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state initialized from currentTenant
  const [editFormData, setEditFormData] = useState<Partial<DojangTenant>>({
    masterName: currentTenant?.masterName || 'Alemayehu Sahle Shawul',
    danRank: currentTenant?.danRank || '2nd Dan',
    danCertificateNumber: currentTenant?.danCertificateNumber || 'DAN-983057',
    name: currentTenant?.name || 'Golden Eagle GTTF Club',
    registrationNumber: currentTenant?.registrationNumber || 'REG-TKD-57456',
    motto: currentTenant?.motto || 'Courtesy, Integrity, Perseverance, Self-Control, Indomitable Spirit',
    phone: currentTenant?.phone || '+1 (555) 382-9901',
    email: currentTenant?.email || 'trainer@goldeneagletkd.com',
    address: currentTenant?.address || '123 Martial Arts Way',
    city: currentTenant?.city || 'Central City',
    country: currentTenant?.country || 'United States',
    passportPhoto: currentTenant?.passportPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenModal = () => {
    setEditFormData({
      masterName: currentTenant?.masterName || '',
      danRank: currentTenant?.danRank || '2nd Dan',
      danCertificateNumber: currentTenant?.danCertificateNumber || 'DAN-983057',
      name: currentTenant?.name || '',
      registrationNumber: currentTenant?.registrationNumber || '',
      motto: currentTenant?.motto || '',
      phone: currentTenant?.phone || '',
      email: currentTenant?.email || '',
      address: currentTenant?.address || '',
      city: currentTenant?.city || '',
      country: currentTenant?.country || '',
      passportPhoto: currentTenant?.passportPhoto || '',
    });
    setIsEditModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditFormData((prev) => ({ ...prev, passportPhoto: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTenant) {
      updateDojangSettings({
        ...currentTenant,
        ...editFormData,
      } as DojangTenant);
      setIsEditModalOpen(false);
      showToast('Master / Trainer Profile updated successfully!');
    }
  };

  const totalBranches = visibleBranches.length;
  const totalStudents = visibleStudents.length;
  const staffCount = users.filter((u) => u.tenantId === currentTenant?.id).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-900 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-slate-100 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 blur-3xl rounded-full" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Master Passport Photo */}
            <div className="relative group">
              <img
                src={
                  currentTenant?.passportPhoto ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
                }
                alt="Trainer / Dojang Owner"
                className="w-28 h-36 rounded-xl object-cover border-2 border-amber-500 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow">
                {currentTenant?.danRank || '2nd Dan'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                <Award className="w-3.5 h-3.5" /> Licensed Trainer & Dojang Owner
              </div>

              <h1 className="text-2xl sm:text-3xl font-black">{currentTenant?.masterName || 'Alemayehu Sahle Shawul'}</h1>

              <p className="text-xs text-slate-400">
                {currentTenant?.name} — Reg #{currentTenant?.registrationNumber}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>
                    Federation Dan Cert: <strong className="font-mono text-amber-300">{currentTenant?.danCertificateNumber || 'DAN-983057'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Registered Since: {currentTenant?.createdAt || '2026-08-10'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* EDIT PROFILE BUTTON */}
          <button
            onClick={handleOpenModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Dojang Branches</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalBranches} Locations
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled Students</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {totalStudents} Practitioners
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructors & Staff</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {staffCount} Active Staff
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Subscription</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {currentTenant?.subscriptionPlan || 'Enterprise'}
          </div>
        </div>
      </div>

      {/* Contact Details Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Trainer Contact & Headquarters Information
          </h2>
          <button
            onClick={handleOpenModal}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Phone className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Phone</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{currentTenant?.phone || 'Not set'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Mail className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Email</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{currentTenant?.email || 'Not set'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <MapPin className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Headquarters Address</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {currentTenant?.address}, {currentTenant?.city}, {currentTenant?.country}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Multi-Tenant Status</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Isolated Dojang Account Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-slate-100 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Edit Trainer & Dojang Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-xs">
              {/* Photo Upload & Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden border-2 border-amber-500 bg-slate-200 dark:bg-slate-900 shrink-0">
                  <img
                    src={
                      editFormData.passportPhoto ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
                    }
                    alt="Passport"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <label className="block font-bold text-slate-900 dark:text-slate-100">
                    Profile Passport Photo
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload a high resolution photo of the Trainer / Dojang Owner.
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <Camera className="w-3.5 h-3.5" />
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste Image URL"
                      value={editFormData.passportPhoto || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, passportPhoto: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trainer / Master Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.masterName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, masterName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dan Rank / Belt Level
                  </label>
                  <select
                    value={editFormData.danRank || '2nd Dan'}
                    onChange={(e) => setEditFormData({ ...editFormData, danRank: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="1st Dan">1st Dan</option>
                    <option value="2nd Dan">2nd Dan</option>
                    <option value="3rd Dan">3rd Dan</option>
                    <option value="4th Dan">4th Dan</option>
                    <option value="5th Dan">5th Dan</option>
                    <option value="6th Dan">6th Dan</option>
                    <option value="7th Dan">7th Dan</option>
                    <option value="8th Dan">8th Dan</option>
                    <option value="9th Dan">9th Dan Grandmaster</option>
                  </select>
                </div>
              </div>

              {/* Federation Dan Certificate Number (Manual Entry) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Federation Dan Certificate Number (Manual Input)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DAN-983057 or FED-2026-881"
                  value={editFormData.danCertificateNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, danCertificateNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold text-amber-600 dark:text-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter your official Federation-issued Dan certification number exactly as printed on your certificate.
                </p>
              </div>

              {/* Dojang Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dojang / Club Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.registrationNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
