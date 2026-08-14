import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Medal,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BeltRank, CandidateScores, GradingCandidate, GradingTest } from '../../types';
import { TraditionalCertificateModal } from './TraditionalCertificateModal';

const BELT_COLOR_CLASSES: Record<BeltRank, string> = {
  White: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700',
  'Yellow Stripe': 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700',
  Yellow: 'bg-yellow-400 text-yellow-950 border-yellow-500 font-bold',
  'Green Stripe': 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200',
  Green: 'bg-emerald-600 text-white font-bold',
  'Blue Stripe': 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200',
  Blue: 'bg-blue-600 text-white font-bold',
  'Brown Stripe': 'bg-amber-800/20 text-amber-900 dark:text-amber-200 border-amber-700',
  Brown: 'bg-amber-900 text-amber-100 font-bold',
  'Red Stripe': 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200',
  Red: 'bg-red-600 text-white font-bold',
  'Black Stripe': 'bg-slate-800 text-amber-300 border-slate-600 font-bold',
  Black: 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '1st Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '2nd Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '3rd Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '4th Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '5th Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '6th Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '7th Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '8th Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
  '9th Dan': 'bg-slate-900 text-amber-400 border-amber-500/50 font-bold',
};

const BELT_ORDER_LIST: BeltRank[] = [
  'White',
  'Yellow Stripe',
  'Yellow',
  'Green Stripe',
  'Green',
  'Blue Stripe',
  'Blue',
  'Brown Stripe',
  'Brown',
  'Red Stripe',
  'Red',
  'Black Stripe',
  'Black',
  '1st Dan',
  '2nd Dan',
  '3rd Dan',
  '4th Dan',
  '5th Dan',
  '6th Dan',
  '7th Dan',
  '8th Dan',
  '9th Dan',
];

export const GradingModule: React.FC = () => {
  const {
    visibleGradingTests,
    visibleGradingCandidates,
    visibleStudents,
    branches,
    selectedBranchId,
    createGradingTest,
    updateCandidateScores,
    promoteCandidate,
    batchPromotePassedCandidates,
    deleteGradingTest,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tests' | 'scoring' | 'distribution' | 'certificates'>('tests');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(
    visibleGradingTests.length > 0 ? visibleGradingTests[0].id : null
  );

  // Modals state
  const [isNewTestModalOpen, setIsNewTestModalOpen] = useState(false);
  const [scoringCandidate, setScoringCandidate] = useState<GradingCandidate | null>(null);
  const [certificateCandidate, setCertificateCandidate] = useState<GradingCandidate | null>(null);

  // New Test Form State
  const [newTestForm, setNewTestForm] = useState({
    testName: '',
    testDate: new Date().toISOString().slice(0, 10),
    examinerName: 'Grandmaster Sung-Min Kim (7th Dan)',
    location: 'Dojang Main Training Hall',
    notes: 'Official Belt Promotion Examination focusing on Poomsae accuracy, free sparring, and power board breaking.',
    branchId: selectedBranchId !== 'ALL' ? selectedBranchId : branches[0]?.id || 'branch-tiger-central',
    selectedStudentIds: [] as string[],
  });

  // Candidate Scoring State
  const [scoreForm, setScoreForm] = useState<CandidateScores>({
    poomsae: 85,
    sparring: 80,
    breaking: 85,
    discipline: 90,
    fitness: 85,
  });
  const [scoreStatus, setScoreStatus] = useState<GradingCandidate['status']>('Passed');
  const [scoreRemarks, setScoreRemarks] = useState('');

  // Search/Filter state
  const [candidateSearch, setCandidateSearch] = useState('');

  // Active Test Object
  const currentTest = visibleGradingTests.find((t) => t.id === selectedTestId) || visibleGradingTests[0];

  // Candidates for selected test
  const testCandidates = visibleGradingCandidates.filter((c) => c.testId === currentTest?.id);

  const filteredCandidates = testCandidates.filter((c) =>
    c.studentName.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  // Notification banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Schedule New Test Submission
  const handleScheduleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestForm.testName.trim()) return;

    if (newTestForm.selectedStudentIds.length === 0) {
      showToast('Please select at least one student candidate for the examination.');
      return;
    }

    createGradingTest(
      {
        testName: newTestForm.testName,
        testDate: newTestForm.testDate,
        examinerName: newTestForm.examinerName,
        branchId: newTestForm.branchId,
        location: newTestForm.location,
        notes: newTestForm.notes,
        status: 'In Progress',
      },
      newTestForm.selectedStudentIds
    );

    setIsNewTestModalOpen(false);
    setNewTestForm({
      testName: '',
      testDate: new Date().toISOString().slice(0, 10),
      examinerName: 'Grandmaster Sung-Min Kim (7th Dan)',
      location: 'Dojang Main Training Hall',
      notes: 'Official Belt Promotion Examination.',
      branchId: selectedBranchId !== 'ALL' ? selectedBranchId : branches[0]?.id || 'branch-tiger-central',
      selectedStudentIds: [],
    });
  };

  // Open Score Candidate Modal
  const openScoringModal = (candidate: GradingCandidate) => {
    setScoringCandidate(candidate);
    setScoreForm(candidate.scores || { poomsae: 85, sparring: 80, breaking: 85, discipline: 90, fitness: 85 });
    setScoreStatus(candidate.status === 'Registered' ? 'Passed' : candidate.status);
    setScoreRemarks(candidate.remarks || '');
  };

  // Save Candidate Scores
  const handleSaveScores = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringCandidate) return;

    updateCandidateScores(scoringCandidate.id, scoreForm, scoreStatus, scoreRemarks);
    setScoringCandidate(null);
  };

  // Direct Candidate Belt Promotion
  const handlePromoteCandidate = (candidate: GradingCandidate) => {
    const res = promoteCandidate(candidate.id);
    if (res.success) {
      // Find updated candidate
      const updatedCand = visibleGradingCandidates.find((c) => c.id === candidate.id) || {
        ...candidate,
        status: 'Passed' as const,
        certificateNo: res.certificateNo,
      };
      setCertificateCandidate(updatedCand);
    }
  };

  // Batch Promote Test
  const handleBatchPromote = (testId: string) => {
    const count = batchPromotePassedCandidates(testId);
    showToast(`Successfully promoted ${count} student candidate(s) to their new belt ranks!`);
  };

  // Calculate Belt Rank Distribution Stats
  const beltDistribution = BELT_ORDER_LIST.map((belt) => {
    const count = visibleStudents.filter((s) => s.beltRank === belt && s.status === 'Active').length;
    return { belt, count };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Grading & Belt Promotion Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Taekwondo Geup & Dan examinations, candidate score evaluations, and traditional promotion certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewTestModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Examination
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="p-4 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-between transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-900 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'tests'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Examinations Sessions ({visibleGradingTests.length})
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'scoring'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Candidate Scoring & Promotion
        </button>

        <button
          onClick={() => setActiveTab('distribution')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'distribution'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Belt Rank Pyramid
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'certificates'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Medal className="w-4 h-4" />
          Issued Certificates Registry
        </button>
      </div>

      {/* TAB 1: EXAMINATION SESSIONS */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleGradingTests.map((test) => {
              const testBranch = branches.find((b) => b.id === test.branchId);
              const candidates = visibleGradingCandidates.filter((c) => c.testId === test.id);
              const passedCount = candidates.filter((c) => c.status === 'Passed').length;
              const isSelected = selectedTestId === test.id;

              return (
                <div
                  key={test.id}
                  onClick={() => {
                    setSelectedTestId(test.id);
                    setActiveTab('scoring');
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 shadow-md ring-1 ring-amber-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg tracking-wider ${
                        test.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          : test.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200'
                      }`}
                    >
                      {test.status}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGradingTest(test.id);
                        showToast(`Deleted examination session "${test.testName}".`);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete Examination Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1 line-clamp-1">
                    {test.testName}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{test.testDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span className="line-clamp-1">{test.examinerName}</span>
                    </div>
                    {testBranch && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Branch: {testBranch.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Candidate Stats Progress */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">Candidates Enrolled</span>
                      <span className="text-slate-900 dark:text-slate-100">{candidates.length} Registered</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${candidates.length > 0 ? (passedCount / candidates.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Passed: {passedCount}</span>
                      <span>Pass Rate: {candidates.length > 0 ? Math.round((passedCount / candidates.length) * 100) : 0}%</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <span>Evaluate Candidates</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {visibleGradingTests.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Grading Examinations Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Schedule a Geup or Dan belt promotion exam session to evaluate student Poomsae forms, sparring, and board breaking.
              </p>
              <button
                onClick={() => setIsNewTestModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Schedule First Exam
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CANDIDATE SCORING & PROMOTION */}
      {activeTab === 'scoring' && currentTest && (
        <div className="space-y-6">
          {/* Active Test Banner */}
          <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                Active Examination Session
              </div>
              <h2 className="text-lg font-bold">{currentTest.testName}</h2>
              <p className="text-xs text-slate-400">
                Examiner: {currentTest.examinerName} • Date: {currentTest.testDate} • Location: {currentTest.location}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBatchPromote(currentTest.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                Batch Promote Passed Candidates
              </button>
            </div>
          </div>

          {/* Candidate Search & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate student by name..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Candidate Score Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Candidate Student</th>
                    <th className="py-3 px-4">Current Rank</th>
                    <th className="py-3 px-4">Target Rank</th>
                    <th className="py-3 px-4 text-center">Poomsae</th>
                    <th className="py-3 px-4 text-center">Sparring</th>
                    <th className="py-3 px-4 text-center">Breaking</th>
                    <th className="py-3 px-4 text-center">Total %</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredCandidates.map((candidate) => {
                    const student = visibleStudents.find((s) => s.id === candidate.studentId);

                    return (
                      <tr key={candidate.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{candidate.studentName}</div>
                              <div className="text-[10px] text-slate-400">{student?.id || candidate.studentId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded-md font-semibold border ${
                              BELT_COLOR_CLASSES[candidate.currentBelt] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {candidate.currentBelt}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded-md font-bold border ${
                              BELT_COLOR_CLASSES[candidate.targetBelt] || 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {candidate.targetBelt}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {candidate.scores?.poomsae || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {candidate.scores?.sparring || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {candidate.scores?.breaking || '-'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                            {candidate.totalScore ? `${candidate.totalScore}%` : 'Unrated'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                              candidate.status === 'Passed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                : candidate.status === 'Failed'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {candidate.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openScoringModal(candidate)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white rounded-lg transition-colors"
                            >
                              Score Candidate
                            </button>

                            {candidate.status === 'Passed' ? (
                              <button
                                onClick={() => setCertificateCandidate(candidate)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs inline-flex items-center gap-1"
                              >
                                <Award className="w-3 h-3" />
                                Certificate
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePromoteCandidate(candidate)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
                              >
                                Promote Belt
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredCandidates.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No candidate students enrolled for this examination session.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BELT RANK DISTRIBUTION */}
      {activeTab === 'distribution' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Dojang Active Student Belt Rank Pyramid
            </h2>
            <p className="text-xs text-slate-500">
              Visual census distribution of active martial artists by rank tier across all branches.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {beltDistribution.map((item) => (
              <div
                key={item.belt}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-center"
              >
                <span
                  className={`inline-block px-2.5 py-0.5 text-[10px] rounded-md font-bold border ${
                    BELT_COLOR_CLASSES[item.belt] || 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {item.belt}
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {item.count}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Students</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ISSUED CERTIFICATES REGISTRY */}
      {activeTab === 'certificates' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Official Belt Promotion Certificates Log
            </h2>
            <p className="text-xs text-slate-500">
              Registry of all issued traditional Taekwondo certificates and promotion records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleGradingCandidates
              .filter((c) => c.status === 'Passed' || c.certificateNo)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-amber-800 dark:text-amber-400">
                        {candidate.certificateNo || 'TKD-CERT-2026-REG'}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {candidate.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">Promoted to: <strong>{candidate.targetBelt}</strong></p>
                    </div>

                    <Award className="w-6 h-6 text-amber-500" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                    <span>Date: {candidate.promotedDate || 'Recently'}</span>
                    <button
                      onClick={() => setCertificateCandidate(candidate)}
                      className="px-2.5 py-1 text-[11px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SCHEDULE NEW TEST MODAL */}
      {isNewTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Schedule New Belt Promotion Examination</h3>
              </div>
              <button onClick={() => setIsNewTestModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Examination Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 Color Belt Geup Promotion Exam"
                  value={newTestForm.testName}
                  onChange={(e) => setNewTestForm({ ...newTestForm, testName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Examination Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTestForm.testDate}
                    onChange={(e) => setNewTestForm({ ...newTestForm, testDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Host Branch
                  </label>
                  <select
                    value={newTestForm.branchId}
                    onChange={(e) => setNewTestForm({ ...newTestForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chief Examiner / Grandmaster
                </label>
                <input
                  type="text"
                  required
                  value={newTestForm.examinerName}
                  onChange={(e) => setNewTestForm({ ...newTestForm, examinerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Candidate Students from Roster
                </label>
                <div className="max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  {visibleStudents
                    .filter((s) => s.status === 'Active')
                    .map((st) => {
                      const isChecked = newTestForm.selectedStudentIds.includes(st.id);

                      return (
                        <label
                          key={st.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTestForm({
                                    ...newTestForm,
                                    selectedStudentIds: [...newTestForm.selectedStudentIds, st.id],
                                  });
                                } else {
                                  setNewTestForm({
                                    ...newTestForm,
                                    selectedStudentIds: newTestForm.selectedStudentIds.filter((id) => id !== st.id),
                                  });
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {st.firstName} {st.fatherName || st.lastName || ''}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] rounded border ${BELT_COLOR_CLASSES[st.beltRank]}`}>
                            {st.beltRank}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  Create Exam Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCORE CANDIDATE MODAL */}
      {scoringCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Grading Evaluation: {scoringCandidate.studentName}</h3>
                <p className="text-xs text-slate-400">Current: {scoringCandidate.currentBelt} → Target: {scoringCandidate.targetBelt}</p>
              </div>
              <button onClick={() => setScoringCandidate(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScores} className="p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { key: 'poomsae', label: 'Poomsae (Forms & Pattern Techniques)' },
                  { key: 'sparring', label: 'Kyorugi (Free Sparring & Footwork)' },
                  { key: 'breaking', label: 'Kyokpa (Power Board Breaking)' },
                  { key: 'discipline', label: 'Etiquette, Respect & Focus' },
                  { key: 'fitness', label: 'Physical Stamina & Kicking Speed' },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">{item.label}</label>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {(scoreForm as any)[item.key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(scoreForm as any)[item.key]}
                      onChange={(e) =>
                        setScoreForm({ ...scoreForm, [item.key]: Number(e.target.value) })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Evaluation Decision
                  </label>
                  <select
                    value={scoreStatus}
                    onChange={(e) => setScoreStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="Passed">Passed (Eligible for Promotion)</option>
                    <option value="Failed">Failed (Needs Retest)</option>
                    <option value="Registered">Pending Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Examiner Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent Poomsae snap"
                    value={scoreRemarks}
                    onChange={(e) => setScoreRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setScoringCandidate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  Save Score & Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRADITIONAL CERTIFICATE MODAL VIEW */}
      {certificateCandidate && (
        <TraditionalCertificateModal
          candidate={certificateCandidate}
          test={currentTest}
          onClose={() => setCertificateCandidate(null)}
        />
      )}
    </div>
  );
};
