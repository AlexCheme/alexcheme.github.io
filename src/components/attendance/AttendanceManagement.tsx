import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { exportToCSV, exportToPDF, formatDate, getBeltBadgeClass, triggerPrint } from '../../utils/exportUtils';
import { getStudentFullName } from '../../utils/studentUtils';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  Filter,
  History,
  Printer,
  Search,
  UserCheck,
  XCircle,
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    branches,
    visibleStudents,
    visibleAttendance,
    visibleBranches,
    markAttendance,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId ? currentUser.branchId : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'history' | 'matrix'>('daily');

  // Filter students
  const filteredStudents = visibleStudents.filter((student) => {
    const q = (searchQuery || '').toLowerCase();
    const fullName = getStudentFullName(student).toLowerCase();
    const matchesQuery =
      fullName.includes(q) ||
      (student.id || '').toLowerCase().includes(q);

    const matchesBranch = selectedBranchId === 'ALL' || student.branchId === selectedBranchId;
    return matchesQuery && matchesBranch && student.status === 'Active';
  });

  // Get attendance status map for selected date
  const getStudentStatusForDate = (studentId: string, date: string): AttendanceStatus | 'Unmarked' => {
    const record = visibleAttendance.find((a) => a.studentId === studentId && a.date === date);
    return record ? record.status : 'Unmarked';
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    const branchId =
      visibleStudents.find((s) => s.id === studentId)?.branchId || visibleBranches[0]?.id || '';
    markAttendance({
      branchId,
      studentId,
      date: selectedDate,
      status,
      markedBy: currentUser.name,
    });
  };

  const handleMarkAllPresent = () => {
    filteredStudents.forEach((s) => {
      markAttendance({
        branchId: s.branchId,
        studentId: s.id,
        date: selectedDate,
        status: 'Present',
        markedBy: currentUser.name,
      });
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = filteredStudents.map((s) => ({
      'Student ID': s.id,
      'Student Name': getStudentFullName(s),
      'Belt Rank': s.beltRank,
      Branch: visibleBranches.find((b) => b.id === s.branchId)?.name || s.branchId,
      Date: selectedDate,
      Status: getStudentStatusForDate(s.id, selectedDate),
    }));
    exportToCSV(`Attendance_Sheet_${selectedDate}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-500" />
            Daily Attendance Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rapid student search check-in, status toggles, attendance history, and official class sheet printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToPDF('attendance-sheet-printable', `Attendance_${selectedDate}`)}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={triggerPrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            Print Attendance Sheet
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Daily Check-in
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Attendance Logs
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
            />
          </div>

          {/* Branch Filter */}
          {currentUser.role !== 'BRANCH_MANAGER' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Branch:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
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

          {/* Quick Mark All Present */}
          {activeSubTab === 'daily' && (
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              Mark All Present
            </button>
          )}
        </div>
      </div>

      {/* DAILY CHECK-IN VIEW */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          {/* Student Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Student Name or Student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>

          {/* Attendance Check-in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
                No active students found for attendance check-in.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const currentStatus = getStudentStatusForDate(student.id, selectedDate);
                const branchName =
                  visibleBranches.find((b) => b.id === student.branchId)?.name || student.branchId;

                return (
                  <div
                    key={student.id}
                    className={`p-4 rounded-xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
                      currentStatus === 'Present'
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : currentStatus === 'Late'
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : currentStatus === 'Excused'
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : currentStatus === 'Absent'
                        ? 'border-rose-500/50 bg-rose-500/5'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={student.photo}
                        alt={student.firstName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-slate-700 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          {student.id}
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {getStudentFullName(student)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold border ${getBeltBadgeClass(student.beltRank)}`}>
                            {student.beltRank}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">{branchName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick 1-Click Status Selector */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {(['Present', 'Late', 'Excused', 'Absent'] as AttendanceStatus[]).map((status) => {
                        const isSelected = currentStatus === status;
                        let activeStyle = '';
                        if (status === 'Present')
                          activeStyle = isSelected
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20';
                        else if (status === 'Late')
                          activeStyle = isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20';
                        else if (status === 'Excused')
                          activeStyle = isSelected
                            ? 'bg-blue-500 text-white font-bold'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20';
                        else
                          activeStyle = isSelected
                            ? 'bg-rose-500 text-white font-bold'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20';

                        return (
                          <button
                            key={status}
                            onClick={() => handleSetStatus(student.id, status)}
                            className={`py-1.5 text-[10px] rounded-lg transition-all cursor-pointer text-center ${activeStyle}`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE HISTORY LOGS */}
      {activeSubTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" /> Attendance Audit History
            </h3>
            <span className="text-xs text-slate-400">Total Records: {visibleAttendance.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Student ID & Name</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Marked By</th>
                  <th className="p-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No attendance records logged yet.
                    </td>
                  </tr>
                ) : (
                  visibleAttendance.map((record, index) => {
                    const student = visibleStudents.find((s) => s.id === record.studentId);
                    const branchName =
                      visibleBranches.find((b) => b.id === record.branchId)?.name || record.branchId;

                    return (
                      <tr key={record.id ? `${record.id}-${index}` : `att-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {formatDate(record.date)}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {student ? getStudentFullName(student) : record.studentId}
                          </div>
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
                            {record.studentId}
                          </div>
                        </td>
                        <td className="p-3.5 font-medium">{branchName}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold ${
                              record.status === 'Present'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : record.status === 'Late'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : record.status === 'Excused'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-600 dark:text-slate-300">
                          {record.markedBy}
                        </td>
                        <td className="p-3.5 text-slate-400 italic">
                          {record.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE ATTENDANCE SHEET */}
      <div id="attendance-sheet-printable" className="hidden print:block p-8 bg-white text-slate-950 font-sans">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex items-center gap-3">
            {(currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80') && (
              <img
                src={currentTenant?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80'}
                alt="School Logo"
                className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
              />
            )}
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider">{currentTenant?.name || 'ETHIOPIAN TAEKWONDO ACADEMY'}</h1>
              <p className="text-xs text-slate-600">Official Daily Attendance Sheet — Date: {selectedDate}</p>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-900 text-xs">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold uppercase border-b border-slate-900">
              <th className="border border-slate-900 p-2">Student ID</th>
              <th className="border border-slate-900 p-2">Student Name</th>
              <th className="border border-slate-900 p-2">Belt Rank</th>
              <th className="border border-slate-900 p-2">Status</th>
              <th className="border border-slate-900 p-2">Signature / Mark</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-b border-slate-300">
                <td className="border border-slate-900 p-2 font-mono font-bold">{s.id}</td>
                <td className="border border-slate-900 p-2">{getStudentFullName(s)}</td>
                <td className="border border-slate-900 p-2">{s.beltRank}</td>
                <td className="border border-slate-900 p-2 font-bold">{getStudentStatusForDate(s.id, selectedDate)}</td>
                <td className="border border-slate-900 p-2 text-slate-400">___________________</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex justify-between items-end text-xs pt-4 border-t border-slate-900">
          <div>
            <div>Generated by: {currentUser.name}</div>
            <div className="mt-4 flex items-center gap-2">
              <span>Instructor / Manager Signature:</span>
              {(() => {
                const activeSig = currentUser?.signature || (currentUser?.branchId ? branches.find(b => b.id === currentUser.branchId)?.signature : undefined) || currentTenant?.signature;
                return activeSig ? (
                  <img
                    src={activeSig}
                    alt="Signature"
                    className="h-8 max-w-[140px] object-contain"
                  />
                ) : (
                  <span>______________________</span>
                );
              })()}
            </div>
          </div>
          <div className="text-center">
            {currentTenant?.stampSeal ? (
              <img src={currentTenant.stampSeal} alt="Official Stamp" className="w-16 h-16 object-contain mx-auto mb-1 opacity-90 rotate-[-2deg]" />
            ) : (
              <div className="w-14 h-14 border border-dashed border-rose-400 rounded-full flex items-center justify-center text-[8px] text-rose-600 font-bold mx-auto mb-1 bg-rose-50/30">
                [ Stamp ]
              </div>
            )}
            <div className="border-t border-slate-900 w-40 text-center pt-0.5 font-bold text-[10px]">
              Official Stamp & Date
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
