import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Branch } from '../../types';
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  Building,
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  PowerOff,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

export const BranchManagement: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    visibleBranches,
    visibleStudents,
    visibleInventory,
    visibleUsers,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
    registerBranchManager,
    deleteBranchManager,
    toggleBranchManagerStatus,
    transferStudent,
    transferInventory,
    transferStaff,
  } = useApp();

  // Modals state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [deletingManager, setDeletingManager] = useState<{ id: string; name: string; email: string } | null>(null);

  // Manager Assignment Mode: 'select_existing' | 'select_student' | 'new_manager'
  const [managerMode, setManagerMode] = useState<'select_existing' | 'select_student' | 'new_manager'>('select_existing');
  const [selectedExistingUserId, setSelectedExistingUserId] = useState<string>('');
  const [selectedStudentIdForManager, setSelectedStudentIdForManager] = useState<string>('');

  const [newManagerData, setNewManagerData] = useState({
    name: '',
    email: '',
    password: 'Manager123!',
    phone: currentTenant?.phone || '',
    photoUrl: '',
  });

  // Transfer Modals
  const [transferType, setTransferType] = useState<'student' | 'inventory' | 'staff' | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(1);

  // Form State
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    phone: currentTenant?.phone || '',
    email: currentTenant?.email || '',
    address: '',
    managerName: '',
    managerId: '',
  });

  const tenantStaff = visibleUsers.filter((u) => u.tenantId === currentUser.tenantId);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setManagerMode('select_existing');
    setSelectedExistingUserId(currentUser.id);
    setSelectedStudentIdForManager('');
    setNewManagerData({
      name: '',
      email: '',
      password: 'Manager123!',
      phone: currentTenant?.phone || '',
      photoUrl: '',
    });
    setBranchFormData({
      name: '',
      phone: currentTenant?.phone || '',
      email: currentTenant?.email || '',
      address: '',
      managerName: currentUser.name,
      managerId: currentUser.id,
    });
    setIsBranchModalOpen(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setManagerMode('select_existing');
    setSelectedExistingUserId(b.managerId || currentUser.id);
    setSelectedStudentIdForManager('');
    setNewManagerData({
      name: '',
      email: '',
      password: 'Manager123!',
      phone: currentTenant?.phone || '',
      photoUrl: '',
    });
    setBranchFormData({
      name: b.name,
      phone: b.phone,
      email: b.email,
      address: b.address,
      managerName: b.managerName || '',
      managerId: b.managerId || '',
    });
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchFormData.name || !branchFormData.address) {
      alert('Please fill out branch name and physical address.');
      return;
    }

    let finalManagerName = branchFormData.managerName;
    let finalManagerId = branchFormData.managerId;

    if (managerMode === 'new_manager') {
      if (!newManagerData.name || !newManagerData.email) {
        alert('Please fill out Name and Email for the new Branch Manager.');
        return;
      }
      const createdBm = registerBranchManager({
        name: newManagerData.name,
        email: newManagerData.email,
        password: newManagerData.password,
        phone: newManagerData.phone,
        photoUrl: newManagerData.photoUrl,
      });
      finalManagerName = createdBm.name;
      finalManagerId = createdBm.id;
    } else if (managerMode === 'select_student') {
      const student = visibleStudents.find((s) => s.id === selectedStudentIdForManager);
      if (student) {
        const studentFullName = `${student.firstName} ${student.lastName}`;
        const createdBm = registerBranchManager({
          name: studentFullName,
          email: student.email,
          phone: student.phone,
          photoUrl: student.photo,
        });
        finalManagerName = createdBm.name;
        finalManagerId = createdBm.id;
      }
    } else if (managerMode === 'select_existing') {
      const existingUser = tenantStaff.find((u) => u.id === selectedExistingUserId);
      if (existingUser) {
        finalManagerName = existingUser.name;
        finalManagerId = existingUser.id;
      }
    }

    if (editingBranch) {
      updateBranch({
        ...editingBranch,
        ...branchFormData,
        managerName: finalManagerName,
        managerId: finalManagerId,
      });
    } else {
      createBranch({
        ...branchFormData,
        managerName: finalManagerName,
        managerId: finalManagerId,
      });
    }
    setIsBranchModalOpen(false);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBranchId) {
      alert('Please select a target destination branch.');
      return;
    }

    if (transferType === 'student' && selectedStudentId) {
      transferStudent(selectedStudentId, targetBranchId);
    } else if (transferType === 'inventory' && selectedInventoryId) {
      transferInventory(selectedInventoryId, targetBranchId, Number(transferQty));
    } else if (transferType === 'staff' && selectedStaffId) {
      transferStaff(selectedStaffId, targetBranchId);
    }

    setTransferType(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            Branch & Multi-Location Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create satellite dojang branches, assign branch managers, and execute inter-branch transfers for students, gear, and staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTransferType('student');
              setSelectedStudentId(visibleStudents[0]?.id || '');
              setTargetBranchId(visibleBranches[1]?.id || visibleBranches[0]?.id || '');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-amber-500" />
            Inter-Branch Transfer
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Branch
          </button>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleBranches.map((branch) => {
          const studentCount = visibleStudents.filter((s) => s.branchId === branch.id).length;
          const inventoryCount = visibleInventory
            .filter((i) => i.branchId === branch.id)
            .reduce((acc, i) => acc + i.currentStock, 0);

          return (
            <div
              key={branch.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {branch.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          branch.status === 'Inactive'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {branch.status === 'Inactive' ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Manager: {branch.managerName || 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(branch)}
                    title="Edit Branch Details"
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleBranchStatus(branch.id)}
                    title={branch.status === 'Inactive' ? 'Activate Branch' : 'Deactivate Branch'}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      branch.status === 'Inactive'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    {branch.status === 'Inactive' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeletingBranch(branch)}
                    title="Delete Branch (Auto-reassign students)"
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{branch.email}</span>
                </div>
              </div>

              {/* Branch Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {studentCount} Students
                    </div>
                    <div className="text-[10px] text-slate-400">Assigned Roster</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <Boxes className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {inventoryCount} Items
                    </div>
                    <div className="text-[10px] text-slate-400">Inventory Stock</div>
                  </div>
                </div>
              </div>

              {/* Transfer Shortcut Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    setTransferType('student');
                    setTargetBranchId(branch.id);
                  }}
                  className="flex-1 py-1.5 text-[11px] font-semibold rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-center cursor-pointer"
                >
                  Transfer Student Here
                </button>
                <button
                  onClick={() => {
                    setTransferType('inventory');
                    setTargetBranchId(branch.id);
                  }}
                  className="flex-1 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-center cursor-pointer"
                >
                  Transfer Stock Here
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BRANCH MANAGERS ROSTER & MANAGEMENT */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Branch Managers Roster & Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage, activate, deactivate, or delete branch managers. Deleting a manager automatically reassigns their students and branch duties to the owner Dojang Master.
            </p>
          </div>
        </div>

        {visibleUsers.filter((u) => u.role === 'BRANCH_MANAGER' || u.role === 'INSTRUCTOR').length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            No branch managers registered yet. Create a branch and register a manager above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleUsers
              .filter((u) => u.role === 'BRANCH_MANAGER' || u.role === 'INSTRUCTOR')
              .map((mgr) => {
                const assignedBranch = visibleBranches.find((b) => b.id === mgr.branchId || b.managerId === mgr.id);
                const managerStudentCount = visibleStudents.filter(
                  (s) => s.branchId === assignedBranch?.id
                ).length;

                return (
                  <div
                    key={mgr.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {mgr.photoUrl ? (
                            <img
                              src={mgr.photoUrl}
                              alt={mgr.name}
                              className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                              {mgr.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {mgr.name}
                            </h3>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              {assignedBranch ? `Branch: ${assignedBranch.name}` : 'Unassigned Branch'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            mgr.status === 'Disabled'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {mgr.status === 'Disabled' ? 'Inactive' : 'Active'}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-2">
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{mgr.email}</span>
                        </p>
                        {mgr.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{mgr.phone}</span>
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold pt-1">
                          <Users className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{managerStudentCount} Students under purview</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <button
                        onClick={() => toggleBranchManagerStatus(mgr.id)}
                        title={mgr.status === 'Disabled' ? 'Activate Manager' : 'Deactivate Manager'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          mgr.status === 'Disabled'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                        }`}
                      >
                        {mgr.status === 'Disabled' ? (
                          <>
                            <Power className="w-3.5 h-3.5" /> Activate
                          </>
                        ) : (
                          <>
                            <PowerOff className="w-3.5 h-3.5" /> Deactivate
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setDeletingManager({ id: mgr.id, name: mgr.name, email: mgr.email })}
                        title="Delete Branch Manager"
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT BRANCH MODAL */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-500" />
                {editingBranch ? 'Edit Branch Info' : 'Create Satellite Branch'}
              </h2>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westside Campus Branch"
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Branch Manager Assignment Options */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Branch Manager Assignment (Registered under Master)
                </label>

                <div className="grid grid-cols-3 gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-lg text-[10px] font-bold text-center">
                  <button
                    type="button"
                    onClick={() => setManagerMode('select_existing')}
                    className={`py-1.5 rounded-md cursor-pointer transition-all ${
                      managerMode === 'select_existing'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Staff / User
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerMode('select_student')}
                    className={`py-1.5 rounded-md cursor-pointer transition-all ${
                      managerMode === 'select_student'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Select Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerMode('new_manager')}
                    className={`py-1.5 rounded-md cursor-pointer transition-all ${
                      managerMode === 'new_manager'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    + Register New
                  </button>
                </div>

                {managerMode === 'select_existing' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Choose Registered User under Master:
                    </label>
                    <select
                      value={selectedExistingUserId}
                      onChange={(e) => {
                        setSelectedExistingUserId(e.target.value);
                        const found = tenantStaff.find((u) => u.id === e.target.value);
                        if (found) {
                          setBranchFormData({
                            ...branchFormData,
                            managerName: found.name,
                            managerId: found.id,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      {tenantStaff.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role}) — {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {managerMode === 'select_student' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Promote Student to Branch Manager under Master:
                    </label>
                    <select
                      value={selectedStudentIdForManager}
                      onChange={(e) => {
                        setSelectedStudentIdForManager(e.target.value);
                        const found = visibleStudents.find((s) => s.id === e.target.value);
                        if (found) {
                          setBranchFormData({
                            ...branchFormData,
                            managerName: `${found.firstName} ${found.lastName}`,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="">-- Select Master's Student --</option>
                      {visibleStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.beltRank}) — {s.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {managerMode === 'new_manager' && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Manager Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Carlos Santos"
                        value={newManagerData.name}
                        onChange={(e) =>
                          setNewManagerData({ ...newManagerData, name: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Manager Login Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="manager@tigertkd.com"
                          value={newManagerData.email}
                          onChange={(e) =>
                            setNewManagerData({ ...newManagerData, email: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Login Password *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Manager123!"
                          value={newManagerData.password}
                          onChange={(e) =>
                            setNewManagerData({ ...newManagerData, password: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={newManagerData.phone}
                          onChange={(e) =>
                            setNewManagerData({ ...newManagerData, phone: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 self-center">
                        Branch Managers can sign in on the main login screen using this email & password.
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Branch Manager Photo (Select from Device)
                      </label>
                      <div className="flex items-center gap-2">
                        {newManagerData.photoUrl && (
                          <img
                            src={newManagerData.photoUrl}
                            alt="Manager Preview"
                            className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
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
                                setNewManagerData((prev) => ({ ...prev, photoUrl: reader.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-[10px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={branchFormData.phone}
                    onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={branchFormData.email}
                    onChange={(e) => setBranchFormData({ ...branchFormData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, City, Zip Code"
                  value={branchFormData.address}
                  onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
                >
                  {editingBranch ? 'Save Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTER-BRANCH RESOURCE TRANSFER MODAL */}
      {transferType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-amber-500" /> Inter-Branch Resource Transfer
              </h2>
              <button
                onClick={() => setTransferType(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div className="flex gap-2">
                {(['student', 'inventory', 'staff'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTransferType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      transferType === t
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Student Transfer Selection */}
              {transferType === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Student to Transfer
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {visibleStudents.map((s) => {
                      const currentBranch = visibleBranches.find((b) => b.id === s.branchId)?.name;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.id}) — Current: {currentBranch}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Inventory Transfer Selection */}
              {transferType === 'inventory' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Select Inventory Item
                    </label>
                    <select
                      value={selectedInventoryId}
                      onChange={(e) => setSelectedInventoryId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      {visibleInventory.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.currentStock} in stock)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Transfer Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={transferQty}
                      onChange={(e) => setTransferQty(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Staff Transfer Selection */}
              {transferType === 'staff' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Staff / Instructor
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {visibleUsers
                      .filter((u) => u.tenantId === currentUser.tenantId)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Target Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Target Branch *
                </label>
                <select
                  required
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {visibleBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferType(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BRANCH CONFIRMATION MODAL */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Delete Branch: {deletingBranch.name}
              </h2>
              <button
                onClick={() => setDeletingBranch(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                Automatic Student Re-assignment Rule
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                When deleting <strong>{deletingBranch.name}</strong>, all{' '}
                <strong className="text-amber-600 dark:text-amber-400 font-mono">
                  {visibleStudents.filter((s) => s.branchId === deletingBranch.id).length} student(s)
                </strong>{' '}
                and branch resources currently belonging to this location will be{' '}
                <strong>automatically transferred and assigned to the owner Dojang main HQ branch</strong>.
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently remove this branch location from your Dojang portal?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeletingBranch(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const res = deleteBranch(deletingBranch.id);
                  if (!res.success) {
                    alert(res.error || 'Failed to delete branch.');
                  } else {
                    alert(`Branch deleted! ${res.reassignedCount} student(s) were automatically reassigned to owner Dojang (${res.ownerBranchName}).`);
                  }
                  setDeletingBranch(null);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete & Auto-Reassign Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BRANCH MANAGER CONFIRMATION MODAL */}
      {deletingManager && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Delete Branch Manager: {deletingManager.name}
              </h2>
              <button
                onClick={() => setDeletingManager(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                Automatic Student Re-assignment Rule
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                When deleting manager <strong>{deletingManager.name}</strong>, all students and branch management duties previously assigned under this manager will be{' '}
                <strong>automatically transferred and reassigned to the owner Dojang Master HQ account</strong>.
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete this branch manager account ({deletingManager.email})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeletingManager(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const res = deleteBranchManager(deletingManager.id);
                  if (!res.success) {
                    alert(res.error || 'Failed to delete branch manager.');
                  } else {
                    alert(
                      `Branch manager deleted! ${res.reassignedCount} student(s) and branch duties were automatically reassigned to owner Dojang Master (${res.ownerMasterName}).`
                    );
                  }
                  setDeletingManager(null);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete & Auto-Reassign to Owner Dojang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
