import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DojangTenant } from '../../types';
import { formatCurrency, formatDate } from '../../utils/exportUtils';
import {
  Award,
  Building,
  CheckCircle2,
  Edit3,
  KeyRound,
  Lock,
  Plus,
  Power,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';

export const SuperAdminPortal: React.FC = () => {
  const {
    tenants,
    users,
    auditLogs,
    toggleTenantStatus,
    resetUserPassword,
    approveTenant,
    registerMasterAccount,
    updateDojangSettings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dojangs' | 'users' | 'subscriptions' | 'audit'>('dojangs');
  const [isCreateDojangOpen, setIsCreateDojangOpen] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);

  const [resetUserModal, setResetUserModal] = useState<{
    userId: string;
    userName: string;
    email: string;
    role: string;
    newPass: string;
    successMsg?: string;
  } | null>(null);

  const [newDojang, setNewDojang] = useState({
    dojangName: '',
    masterName: '',
    email: '',
    phone: '+1 (555) 000-0000',
    address: 'Central Dojo Ave',
    city: 'New York',
    country: 'United States',
    danRank: '6th Dan',
    danCertificateNumber: 'DAN-' + Math.floor(100000 + Math.random() * 900000),
    motto: 'Courtesy, Integrity, Perseverance',
    password: 'Master123!',
    passportPhoto: '',
  });

  const handleOpenCreateModal = () => {
    setEditingTenantId(null);
    setNewDojang({
      dojangName: '',
      masterName: '',
      email: '',
      phone: '+1 (555) 000-0000',
      address: 'Central Dojo Ave',
      city: 'New York',
      country: 'United States',
      danRank: '6th Dan',
      danCertificateNumber: 'DAN-' + Math.floor(100000 + Math.random() * 900000),
      motto: 'Courtesy, Integrity, Perseverance',
      password: 'Master123!',
      passportPhoto: '',
    });
    setIsCreateDojangOpen(true);
  };

  const handleOpenEditModal = (t: DojangTenant) => {
    setEditingTenantId(t.id);
    setNewDojang({
      dojangName: t.name,
      masterName: t.masterName,
      email: t.email,
      phone: t.phone || '+1 (555) 000-0000',
      address: t.address || 'Central Dojo Ave',
      city: t.city || 'New York',
      country: t.country || 'United States',
      danRank: t.danRank || '2nd Dan',
      danCertificateNumber: t.danCertificateNumber || 'DAN-' + Math.floor(100000 + Math.random() * 900000),
      motto: t.motto || 'Courtesy, Integrity, Perseverance',
      password: 'Master123!',
      passportPhoto: t.passportPhoto || '',
    });
    setIsCreateDojangOpen(true);
  };

  const handleCreateDojangSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDojang.dojangName || !newDojang.masterName || !newDojang.email) {
      alert('Please provide Dojang Name, Master Name, and Master Email.');
      return;
    }

    if (editingTenantId) {
      const existingTenant = tenants.find((t) => t.id === editingTenantId);
      if (existingTenant) {
        updateDojangSettings({
          ...existingTenant,
          name: newDojang.dojangName,
          masterName: newDojang.masterName,
          email: newDojang.email,
          phone: newDojang.phone,
          address: newDojang.address,
          city: newDojang.city,
          country: newDojang.country,
          danRank: newDojang.danRank,
          danCertificateNumber: newDojang.danCertificateNumber,
          motto: newDojang.motto,
          passportPhoto: newDojang.passportPhoto,
        });
        alert(`Dojang "${newDojang.dojangName}" updated successfully!`);
      }
    } else {
      const res = await registerMasterAccount({
        dojangName: newDojang.dojangName,
        masterName: newDojang.masterName,
        email: newDojang.email,
        phone: newDojang.phone,
        address: newDojang.address,
        city: newDojang.city,
        country: newDojang.country,
        danRank: newDojang.danRank,
        danCertificateNumber: newDojang.danCertificateNumber,
        motto: newDojang.motto,
        password: newDojang.password,
        passportPhoto: newDojang.passportPhoto,
      });

      if (res && !res.success) {
        alert(res.error || 'Failed to create Dojang tenant account.');
        return;
      }
      alert(`Dojang "${newDojang.dojangName}" and Master account created successfully!`);
    }

    setIsCreateDojangOpen(false);
    setEditingTenantId(null);
  };

  const filteredTenants = tenants.filter(
    (t) =>
      (t.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (t.masterName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (t.email || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const totalDojangs = tenants.length;
  const activeDojangs = tenants.filter((t) => t.status === 'Active').length;
  const pendingApproval = tenants.filter((t) => t.status === 'Disabled').length;
  const totalUsersPlatform = users.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-slate-100 shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">SUPER ADMINISTRATOR PLATFORM CONTROL</h1>
            <p className="text-xs text-rose-200">
              Global Platform Oversight • Tenant Approvals • Cross-Dojang Password Resets & Licensing
            </p>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Dojangs</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalDojangs}</div>
          <div className="text-[10px] text-emerald-500 font-bold">{activeDojangs} Active Tenants</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingApproval}
          </div>
          <div className="text-[10px] text-slate-400">Requires Admin Verification</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Platform Accounts</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{totalUsersPlatform}</div>
          <div className="text-[10px] text-slate-400">Masters, Managers, Staff</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Security Logs</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{auditLogs.length}</div>
          <div className="text-[10px] text-slate-400 font-mono">Realtime Security Feed</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          {(
            [
              { id: 'dojangs', label: 'Registered Dojangs & Approvals', icon: Building },
              { id: 'users', label: 'User Accounts & Password Resets', icon: KeyRound },
              { id: 'subscriptions', label: 'Subscription Plans', icon: Award },
              { id: 'audit', label: 'Global Audit Trail', icon: ShieldCheck },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'dojangs' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dojang, master name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-slate-100 border-none"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Provision Dojang & Master Account
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Dojang Name</th>
                    <th className="p-3">Master Owner</th>
                    <th className="p-3">Federation Dan Cert</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Super Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.id}</div>
                      </td>

                      <td className="p-3 font-medium">
                        <div>{t.masterName}</div>
                        <div className="text-[10px] text-slate-400">{t.email}</div>
                      </td>

                      <td className="p-3 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {t.danCertificateNumber} ({t.danRank})
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                          {t.subscriptionPlan}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            t.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(t)}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] cursor-pointer flex items-center gap-1"
                            title="Edit Dojang & Master Details"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          {t.status === 'Disabled' && (
                            <button
                              onClick={() => approveTenant(t.id)}
                              className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => toggleTenantStatus(t.id)}
                            className={`px-2.5 py-1 rounded font-bold text-[10px] cursor-pointer ${
                              t.status === 'Active'
                                ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            }`}
                          >
                            {t.status === 'Active' ? 'Disable Account' : 'Activate Account'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Cross-Platform Users & Password Reset</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Assigned Tenant ID</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3 font-bold text-amber-500">{u.role}</td>
                      <td className="p-3 font-mono">{u.tenantId || 'Global System'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setResetUserModal({
                              userId: u.id,
                              userName: u.name,
                              email: u.email,
                              role: u.role,
                              newPass: 'Dojang2026!',
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase">System Security Audit Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map((log, idx) => (
                <div
                  key={log.id ? `sa-log-${log.id}-${idx}` : `sa-log-${idx}`}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-amber-500 font-mono">[{log.action}]</span>{' '}
                    <span className="text-slate-900 dark:text-slate-100">{log.details}</span>
                    <div className="text-[10px] text-slate-400">
                      User: {log.userName} ({log.role}) • Tenant: {log.tenantId}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{formatDate(log.timestamp)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Provision / Edit Dojang Modal */}
      {isCreateDojangOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-rose-500" />
                {editingTenantId ? 'Edit Dojang & Master Tenant' : 'Provision New Dojang & Master'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateDojangOpen(false)}
                className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDojangSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dojang School Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Eagle Taekwondo Martial Arts"
                  value={newDojang.dojangName}
                  onChange={(e) => setNewDojang({ ...newDojang, dojangName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Master / Trainer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Master Ji-Hoon Lee"
                    value={newDojang.masterName}
                    onChange={(e) => setNewDojang({ ...newDojang, masterName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Master Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="master@eagletkd.com"
                    value={newDojang.email}
                    onChange={(e) => setNewDojang({ ...newDojang, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dan Rank
                  </label>
                  <select
                    value={newDojang.danRank}
                    onChange={(e) => setNewDojang({ ...newDojang, danRank: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="1st Dan">1st Dan</option>
                    <option value="2nd Dan">2nd Dan</option>
                    <option value="3rd Dan">3rd Dan</option>
                    <option value="4th Dan">4th Dan</option>
                    <option value="5th Dan">5th Dan</option>
                    <option value="6th Dan">6th Dan</option>
                    <option value="7th Dan">7th Dan</option>
                    <option value="8th Dan">8th Dan</option>
                    <option value="9th Dan">9th Dan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Federation Dan Cert #
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DAN-983057"
                    value={newDojang.danCertificateNumber}
                    onChange={(e) => setNewDojang({ ...newDojang, danCertificateNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
              </div>

              {!editingTenantId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Master Password
                  </label>
                  <input
                    type="text"
                    value={newDojang.password}
                    onChange={(e) => setNewDojang({ ...newDojang, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Master Passport Photo (Select from Device)
                </label>
                <div className="flex items-center gap-3">
                  {newDojang.passportPhoto && (
                    <img
                      src={newDojang.passportPhoto}
                      alt="Master Photo"
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewDojang((prev) => ({ ...prev, passportPhoto: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateDojangOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {editingTenantId ? (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Provision Tenant Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {resetUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                Reset Account Password
              </h2>
              <button
                onClick={() => setResetUserModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Account Holder:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{resetUserModal.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{resetUserModal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="font-bold text-amber-500">{resetUserModal.role}</span>
              </div>
            </div>

            {resetUserModal.successMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {resetUserModal.successMsg}
                </p>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100 select-all border border-slate-200 dark:border-slate-700">
                  New Password: {resetUserModal.newPass}
                </div>
                <button
                  onClick={() => setResetUserModal(null)}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const res = resetUserPassword(resetUserModal.userId, resetUserModal.newPass);
                  if (res.success) {
                    setResetUserModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            successMsg: `Successfully updated password for ${resetUserModal.userName}!`,
                          }
                        : null
                    );
                  } else {
                    alert(res.error || 'Failed to reset password.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Security Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={resetUserModal.newPass}
                      onChange={(e) =>
                        setResetUserModal((prev) => (prev ? { ...prev, newPass: e.target.value } : null))
                      }
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'TKD-' + Math.floor(100000 + Math.random() * 900000) + '!';
                        setResetUserModal((prev) => (prev ? { ...prev, newPass: randomPass } : null));
                      }}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Minimum 6 characters. The account holder can now log in using these credentials.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setResetUserModal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" /> Save New Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
