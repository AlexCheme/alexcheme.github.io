import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_BELT_RANKS, BeltRank, Gender, Student } from '../../types';
import { exportToCSV, exportToPDF, formatDate, getBeltBadgeClass, triggerPrint } from '../../utils/exportUtils';
import { generateStudentId, getStudentFullName } from '../../utils/studentUtils';
import {
  AlertCircle,
  Award,
  Download,
  Edit,
  Eye,
  FileDown,
  FileText,
  Filter,
  Heart,
  Loader2,
  Phone,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  User,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';

interface StudentManagementProps {
  searchFilter?: string;
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  searchFilter = '',
  isModalOpenExternal = false,
  onCloseExternalModal,
}) => {
  const {
    currentUser,
    currentTenant,
    branches,
    students,
    visibleStudents,
    visibleBranches,
    addStudent,
    updateStudent,
    deleteStudent,
    deactivateStudent,
    permanentDeleteStudent,
    toggleStudentStatus,
    restoreStudent,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState(searchFilter);
  const [selectedBeltFilter, setSelectedBeltFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId ? currentUser.branchId : 'ALL'
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenExternal);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);

  // Form Data state
  const [formData, setFormData] = useState<Omit<Student, 'tenantId'> & { id?: string }>({
    id: '',
    branchId: visibleBranches[0]?.id || 'branch-tiger-central',
    firstName: '',
    middleName: '',
    lastName: '',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    gender: 'Male',
    dob: '2012-01-01',
    registrationDate: new Date().toISOString().split('T')[0],
    beltRank: 'White',
    bloodGroup: 'O+',
    phone: '',
    hivStatus: 'Negative',
    medicalRecords: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    emergencyContact: '',
    status: 'Active',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep modal open sync
  React.useEffect(() => {
    if (isModalOpenExternal) {
      handleOpenAdd();
    }
  }, [isModalOpenExternal]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormError(null);
    setIsSubmitting(false);
    onCloseExternalModal?.();
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormError(null);
    setIsSubmitting(false);
    const defaultBranch =
      currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId
        ? currentUser.branchId
        : visibleBranches[0]?.id || branches[0]?.id || 'branch-central';

    setFormData({
      id: '',
      branchId: defaultBranch,
      firstName: '',
      middleName: '',
      lastName: '',
      fatherName: '',
      grandFatherName: '',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      gender: 'Male',
      dob: '2012-01-01',
      registrationDate: new Date().toISOString().split('T')[0],
      beltRank: 'White',
      bloodGroup: 'O+',
      phone: '',
      hivStatus: 'Negative',
      medicalRecords: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      emergencyContact: '',
      status: 'Active',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormError(null);
    setIsSubmitting(false);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const firstName = (formData.firstName || '').trim();
    const fatherName = (formData.fatherName || formData.middleName || '').trim();
    const grandFatherName = (formData.grandFatherName || formData.lastName || '').trim();
    const lastName = (formData.lastName || grandFatherName || fatherName || firstName).trim();
    const parentPhone = (formData.parentPhone || formData.phone || 'N/A').trim();
    const phone = (formData.phone || parentPhone || 'N/A').trim();

    if (!firstName) {
      setFormError('Please enter the Student Given Name.');
      return;
    }

    const effectiveBranchId =
      currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId
        ? currentUser.branchId
        : formData.branchId || visibleBranches[0]?.id || branches[0]?.id || 'branch-central';

    const submissionData = {
      ...formData,
      firstName,
      fatherName: fatherName || firstName,
      grandFatherName: grandFatherName || fatherName || firstName,
      middleName: fatherName || firstName,
      lastName,
      parentPhone,
      phone,
      branchId: effectiveBranchId,
    };

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        await updateStudent({
          ...submissionData,
          id: editingStudent.id,
          tenantId: editingStudent.tenantId,
        });
      } else {
        await addStudent(submissionData);
      }
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving student:', err);
      setFormError(err?.message || 'Failed to register student. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = visibleStudents.filter((s) => s.status === 'Active' && !s.isDeleted).length;
  const inactiveCount = visibleStudents.filter((s) => s.status === 'Inactive' || s.isDeleted).length;
  const totalCount = visibleStudents.length;

  // Filtered List
  const filteredStudents = visibleStudents.filter((student) => {
    const q = (searchTerm || '').toLowerCase();
    const fullName = getStudentFullName(student).toLowerCase();
    const matchesQuery =
      fullName.includes(q) ||
      (student.id || '').toLowerCase().includes(q) ||
      (student.parentName || '').toLowerCase().includes(q);

    const matchesBelt = selectedBeltFilter === 'ALL' || student.beltRank === selectedBeltFilter;
    const matchesBranch = selectedBranchFilter === 'ALL' || student.branchId === selectedBranchFilter;

    const isInactiveOrDeleted = student.status === 'Inactive' || Boolean(student.isDeleted);
    const matchesStatus =
      selectedStatusFilter === 'ALL'
        ? true
        : selectedStatusFilter === 'Inactive'
        ? isInactiveOrDeleted
        : selectedStatusFilter === 'Active'
        ? student.status === 'Active' && !student.isDeleted
        : student.status === selectedStatusFilter;

    return matchesQuery && matchesBelt && matchesBranch && matchesStatus;
  });

  const handleExportCSV = () => {
    const dataToExport = filteredStudents.map((s) => ({
      'Student ID': s.id,
      'Full Name (Name Father Grandfather)': getStudentFullName(s),
      'First Name': s.firstName,
      "Father's Name": s.fatherName || s.middleName || '',
      "Grandfather's Name": s.grandFatherName || s.lastName || '',
      Gender: s.gender,
      'Belt Rank': s.beltRank,
      Status: s.status,
      Branch: visibleBranches.find((b) => b.id === s.branchId)?.name || s.branchId,
      'Student Phone': s.phone || 'N/A',
      'Guardian / Parent Name': s.parentName || 'N/A',
      'Emergency Contact Phone': s.parentPhone || s.emergencyContact || 'N/A',
      Email: s.parentEmail || '',
      Address: s.address || '',
      'Blood Group': s.bloodGroup || '',
      'Medical Notes': s.medicalRecords || '',
      'Registration Date': s.registrationDate || '',
    }));
    exportToCSV(`Dojang_Students_Report_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  const beltOptions: BeltRank[] = ALL_BELT_RANKS;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Student Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Register, view profiles, track medical history, print registration forms, and manage martial arts ranks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export CSV / Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register New Student
          </button>
        </div>
      </div>

      {/* Quick Status Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
            selectedStatusFilter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All Roster ({totalCount})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('Active')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
            selectedStatusFilter === 'Active'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
        >
          Active Students ({activeCount})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('Inactive')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
            selectedStatusFilter === 'Inactive'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/20'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
          }`}
        >
          Soft-Deleted / Inactive ({inactiveCount})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student ID, name, parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Belt Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Belt:</span>
            <select
              value={selectedBeltFilter}
              onChange={(e) => setSelectedBeltFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Belts</option>
              {beltOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          {currentUser.role !== 'BRANCH_MANAGER' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Branch:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              >
                <option value="ALL">All Branches</option>
                {visibleBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Student Photo & Info</th>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Belt Rank</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Parent / Contact</th>
                <th className="p-3.5">Blood / Health</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No Student Records Found
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        The student roster is empty or no records match your search filters.
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:bg-amber-400 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Register New Student
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const branchName =
                    visibleBranches.find((b) => b.id === student.branchId)?.name || student.branchId;
                  const isInactive = student.status === 'Inactive' || Boolean(student.isDeleted);

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isInactive
                          ? 'bg-amber-500/5 dark:bg-amber-950/20 opacity-85 hover:opacity-100 border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photo}
                            alt={student.firstName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                              {getStudentFullName(student)}
                              {isInactive && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                  Soft-Deleted
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              DOB: {formatDate(student.dob)} • {student.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {student.id}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold border ${getBeltBadgeClass(
                            student.beltRank
                          )}`}
                        >
                          {student.beltRank}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium">{branchName}</td>

                      <td className="p-3.5">
                        {student.phone && (
                          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Student: {student.phone}</span>
                          </div>
                        )}
                        <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Parent: {student.parentPhone}</span>
                        </div>
                        {student.parentName && (
                          <div className="text-[10px] text-slate-400">({student.parentName})</div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold text-[10px]">
                          {student.bloodGroup}
                        </span>
                        {student.medicalRecords && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={student.medicalRecords}>
                            {student.medicalRecords}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-bold border ${
                            isInactive
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                              : student.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : student.status === 'Suspended'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300'
                          }`}
                        >
                          {isInactive ? 'Deactivated (Inactive)' : student.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isInactive ? (
                            <button
                              onClick={() => restoreStudent(student.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              title="Reactivate Returning Student"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reactivate Student
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Deactivate student ${student.firstName} ${student.lastName}? Student will be soft-deleted / set to Inactive for easy return.`
                                  )
                                ) {
                                  deactivateStudent(student.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                              title="Deactivate / Soft Delete (Archive for return)"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPrintingStudent(student)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                            title="Print Registration Form"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `PERMANENT DELETE: Are you sure you want to PERMANENTLY remove student ${student.firstName} ${student.lastName} (${student.id}) from the database? This action CANNOT be undone.`
                                )
                              ) {
                                permanentDeleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                            title="Permanently Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT REGISTRATION & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  {editingStudent ? 'Edit Student Details' : 'Student Registration Form'}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill out full student profile, martial arts rank, and medical contact emergency records.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Student ID (Auto-generated or Custom) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Student ID</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      {editingStudent ? 'Registered ID' : 'Auto-generated if empty'}
                    </span>
                  </label>
                  <input
                    type="text"
                    disabled={!!editingStudent}
                    placeholder={
                      editingStudent
                        ? formData.id
                        : `Auto e.g. ${generateStudentId(
                            currentTenant?.name || '',
                            branches.find((b) => b.id === (formData.branchId || visibleBranches[0]?.id))?.name,
                            formData.registrationDate || new Date().toISOString().split('T')[0],
                            students
                          )}`
                    }
                    value={formData.id || ''}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Name (Given Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bikila"
                    value={formData.fatherName || formData.middleName || ''}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value, middleName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Grandfather's Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grandfather's Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gebre"
                    value={formData.grandFatherName || formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, grandFatherName: e.target.value, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Student Photo Device File Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Photo (Select from Device)
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.photo && (
                      <img
                        src={formData.photo}
                        alt="Student Preview"
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
                            setFormData({ ...formData, photo: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Belt Rank */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Belt Rank
                  </label>
                  <select
                    value={formData.beltRank}
                    onChange={(e) => setFormData({ ...formData, beltRank: e.target.value as BeltRank })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  >
                    {beltOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Branch
                  </label>
                  <select
                    value={formData.branchId}
                    disabled={currentUser.role === 'BRANCH_MANAGER'}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {visibleBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registration Date
                  </label>
                  <input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* HIV Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    HIV Status
                  </label>
                  <select
                    value={formData.hivStatus || 'Negative'}
                    onChange={(e) => setFormData({ ...formData, hivStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Negative">Negative</option>
                    <option value="Positive">Positive</option>
                    <option value="Confidential / Not Disclosed">Confidential / Not Disclosed</option>
                  </select>
                </div>

                {/* Student Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0911223344"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Parent/Guardian */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Bikila"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Parent Phone / Emergency Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Phone (Emergency Contact) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0927565651"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Parent Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail || ''}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const newSt = e.target.value as any;
                      setFormData({
                        ...formData,
                        status: newSt,
                        isDeleted: newSt === 'Inactive',
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    <option value="Active">Active Student</option>
                    <option value="Inactive">Inactive / Deactivated (Soft Deleted)</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Graduated">Graduated Alumni</option>
                  </select>
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aunt Mary (+1 555-123-4567)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Medical Records (Large Area) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Other Medical Records / Allergies / Health Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail any asthma, past surgeries, allergies, medication requirements..."
                  value={formData.medicalRecords || ''}
                  onChange={(e) => setFormData({ ...formData, medicalRecords: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />}
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT PROFILE MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setViewingStudent(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <img
                src={viewingStudent.photo}
                alt={viewingStudent.firstName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500 shadow-md shrink-0"
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold mb-1">
                  ID: {viewingStudent.id}
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {getStudentFullName(viewingStudent)}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold border ${getBeltBadgeClass(viewingStudent.beltRank)}`}>
                    {viewingStudent.beltRank}
                  </span>
                  <span className="text-xs text-slate-500">
                    Reg Date: {formatDate(viewingStudent.registrationDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-xs border-t border-b border-slate-200 dark:border-slate-800 py-4">
              <div>
                <span className="text-slate-400">Student Contact (Phone):</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {viewingStudent.phone || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Guardian / Parent Name:</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {viewingStudent.parentName || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Gender / DOB:</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {viewingStudent.gender} • {formatDate(viewingStudent.dob)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Emergency Contact (Phone):</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {viewingStudent.parentPhone || viewingStudent.emergencyContact || 'N/A'}
                </div>
              </div>
            </div>

            {viewingStudent.medicalRecords && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 mb-1">
                  <Heart className="w-4 h-4" /> Medical History & Allergies
                </div>
                <p className="text-slate-700 dark:text-slate-300">{viewingStudent.medicalRecords}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                {viewingStudent.status === 'Inactive' || viewingStudent.isDeleted ? (
                  <button
                    onClick={() => {
                      restoreStudent(viewingStudent.id);
                      setViewingStudent({ ...viewingStudent, status: 'Active', isDeleted: false });
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Reactivate Returning Student
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Deactivate student ${viewingStudent.firstName} ${viewingStudent.lastName}? Record will be archived as Inactive for future return.`
                        )
                      ) {
                        deactivateStudent(viewingStudent.id);
                        setViewingStudent({ ...viewingStudent, status: 'Inactive', isDeleted: true });
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-2 cursor-pointer border border-amber-500/30"
                  >
                    <UserX className="w-4 h-4" /> Deactivate (Soft Delete)
                  </button>
                )}

                <button
                  onClick={() => {
                    if (
                      confirm(
                        `PERMANENT DELETE: Are you sure you want to PERMANENTLY remove ${viewingStudent.firstName} ${viewingStudent.lastName} (${viewingStudent.id}) from the database? This CANNOT be undone.`
                      )
                    ) {
                      permanentDeleteStudent(viewingStudent.id);
                      setViewingStudent(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-xs flex items-center gap-2 cursor-pointer border border-rose-500/30"
                >
                  <Trash2 className="w-4 h-4" /> Delete Permanently
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPrintingStudent(viewingStudent);
                    setViewingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Printer className="w-4 h-4" /> Print Registration Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT REGISTRATION CARD MODAL */}
      {printingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Print Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToPDF('student-registration-printable', `Student_Card_${printingStudent.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={triggerPrint}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button
                  onClick={() => setPrintingStudent(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Box */}
            <div id="student-registration-printable" className="p-6 bg-white text-slate-950 border border-slate-300 rounded-xl space-y-4 print-container">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  {(currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80') && (
                    <img
                      src={currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80'}
                      alt="School Logo"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
                    />
                  )}
                  <div>
                    <h3
                      className="text-lg uppercase"
                      style={{
                        height: '35px',
                        color: '#ad960c',
                        textAlign: 'left',
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        textDecorationLine: 'none',
                      }}
                    >
                      {currentTenant?.name || 'ETHIOPIAN TAEKWONDO ACADEMY'}
                    </h3>
                    <p className="text-[10px] text-slate-600 italic">"{currentTenant?.motto}"</p>
                    <p className="text-[10px] text-slate-600">Reg #: {currentTenant?.registrationNumber}</p>
                  </div>
                </div>
              </div>

              <div className="text-center font-bold text-sm uppercase tracking-widest text-amber-700 py-1 bg-amber-50 rounded border border-amber-200">
                Official Student Registration Form
              </div>

              <div className="flex items-start gap-4">
                <img
                  src={printingStudent.photo}
                  alt={printingStudent.firstName}
                  className="w-20 h-24 object-cover border-2 border-slate-900 rounded"
                />
                <div className="space-y-1 text-xs flex-1">
                  <div>
                    <span className="font-bold text-slate-600">Student ID:</span>{' '}
                    <span className="font-mono font-bold text-amber-800 text-sm">{printingStudent.id}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Full Name:</span>{' '}
                    <span className="font-bold">{getStudentFullName(printingStudent)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Belt Rank:</span>{' '}
                    <span className="font-bold">{printingStudent.beltRank}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Gender / DOB:</span>{' '}
                    {printingStudent.gender} ({printingStudent.dob})
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Registration Date:</span>{' '}
                    {printingStudent.registrationDate}
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-bold text-slate-600">Student Contact:</span>{' '}
                    <span className="font-bold text-slate-900">{printingStudent.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Guardian / Parent:</span>{' '}
                    <span className="font-bold text-slate-900">{printingStudent.parentName || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Emergency Contact (Phone):</span>{' '}
                  <span className="font-bold text-slate-900">{printingStudent.parentPhone || printingStudent.emergencyContact || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Physical Address:</span> {printingStudent.address}
                </div>
                <div>
                  <span className="font-bold text-slate-600">Blood Group:</span> {printingStudent.bloodGroup} | <span className="font-bold text-slate-600">Medical:</span> {printingStudent.medicalRecords || 'None'}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end text-[10px] text-slate-600">
                <div>
                  {(() => {
                    const activeSig = currentUser?.signature || (currentUser?.branchId ? branches.find(b => b.id === currentUser.branchId)?.signature : undefined) || currentTenant?.signature;
                    return activeSig ? (
                      <img
                        src={activeSig}
                        alt="Master/Manager Signature"
                        className="h-10 max-w-[140px] object-contain mb-1"
                      />
                    ) : (
                      <div className="h-6"></div>
                    );
                  })()}
                  <div className="border-t border-slate-900 w-36 text-center pt-1 font-bold">
                    Master / Manager Signature
                  </div>
                </div>
                <div className="text-center">
                  {currentTenant?.stampSeal ? (
                    <img src={currentTenant.stampSeal} alt="Official Stamp" className="w-16 h-16 object-contain mx-auto mb-1 opacity-90 rotate-[-3deg]" />
                  ) : (
                    <div className="w-14 h-14 border border-dashed border-rose-400 rounded-full flex items-center justify-center text-[8px] text-rose-600 font-bold mx-auto mb-1 bg-rose-50/30">
                      [ Stamp Space ]
                    </div>
                  )}
                  <div className="border-t border-slate-900 w-36 text-center pt-1 font-bold">
                    Official Dojang Stamp & Date
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
