import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateStudentId } from '../utils/studentUtils';
import {
  COLLECTIONS,
  deleteBranchFromFirestore,
  deleteExpenseFromFirestore,
  deleteGradingCandidateFromFirestore,
  deleteGradingTestFromFirestore,
  deleteInventoryItemFromFirestore,
  deleteStudentFromFirestore,
  deleteUserFromFirestore,
  deleteBillFromFirestore,
  saveAttendanceRecordToFirestore,
  saveAuditLogToFirestore,
  saveBillToFirestore,
  saveBranchToFirestore,
  saveExpenseToFirestore,
  saveGradingCandidateToFirestore,
  saveGradingTestToFirestore,
  saveInventoryItemToFirestore,
  saveStudentToFirestore,
  saveTenantToFirestore,
  saveUserToFirestore,
  seedInitialCloudDataIfNeeded,
  subscribeToCollection,
} from '../services/firebaseService';
import {
  INITIAL_ATTENDANCE,
  INITIAL_AUDIT_LOGS,
  INITIAL_BILLS,
  INITIAL_BRANCHES,
  INITIAL_EXPENSES,
  INITIAL_GRADING_CANDIDATES,
  INITIAL_GRADING_TESTS,
  INITIAL_INVENTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_STUDENTS,
  INITIAL_TENANTS,
  INITIAL_USERS,
} from '../data/initialData';
import {
  ActiveTab,
  AttendanceRecord,
  AuditLog,
  BeltRank,
  Bill,
  Branch,
  CandidateScores,
  DojangTenant,
  Expense,
  GradingCandidate,
  GradingTest,
  InventoryItem,
  RegisterMasterInput,
  Student,
  StudentStatus,
  SystemNotification,
  UserAccount,
} from '../types';

interface AppContextType {
  currentUser: UserAccount;
  currentTenant: DojangTenant | null;
  selectedBranchId: string; // 'ALL' or specific branchId
  darkMode: boolean;
  activeTab: ActiveTab;
  isSidebarOpen: boolean;
  isAuthenticated: boolean;
  toggleDarkMode: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentUser: (user: UserAccount) => void;
  setSelectedBranchId: (branchId: string) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  logout: () => Promise<void> | void;
  
  // Data State
  tenants: DojangTenant[];
  branches: Branch[];
  users: UserAccount[];
  students: Student[];
  attendance: AttendanceRecord[];
  bills: Bill[];
  inventory: InventoryItem[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  gradingTests: GradingTest[];
  gradingCandidates: GradingCandidate[];

  // Multi-Tenant Isolation Filtered Views
  visibleBranches: Branch[];
  visibleStudents: Student[];
  visibleAttendance: AttendanceRecord[];
  visibleBills: Bill[];
  visibleInventory: InventoryItem[];
  visibleExpenses: Expense[];
  visibleNotifications: SystemNotification[];
  visibleUsers: UserAccount[];
  visibleAuditLogs: AuditLog[];
  visibleGradingTests: GradingTest[];
  visibleGradingCandidates: GradingCandidate[];

  // Actions
  addStudent: (student: Omit<Student, 'id' | 'tenantId'>) => Promise<Student> | Student;
  updateStudent: (student: Student) => Promise<void> | void;
  deleteStudent: (id: string) => Promise<void> | void;
  deactivateStudent: (id: string) => Promise<void> | void;
  permanentDeleteStudent: (id: string) => Promise<void> | void;
  toggleStudentStatus: (id: string, newStatus?: StudentStatus) => Promise<void> | void;
  restoreStudent: (id: string) => Promise<void> | void;
  
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'tenantId'>) => void;
  
  createBill: (bill: Omit<Bill, 'id' | 'tenantId'>) => Bill;
  updateBillStatus: (id: string, status: Bill['status'], paymentMethod?: Bill['paymentMethod']) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'tenantId' | 'currentStock'>) => void;
  updateInventoryStock: (id: string, qtyInDelta: number, qtyOutDelta: number) => void;
  
  addExpense: (expense: Omit<Expense, 'id' | 'tenantId'>) => void;
  
  createBranch: (branch: Omit<Branch, 'id' | 'tenantId' | 'createdAt'>) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (branchId: string) => { success: boolean; error?: string; reassignedCount: number; ownerBranchName: string };
  toggleBranchStatus: (branchId: string, newStatus?: 'Active' | 'Inactive') => void;
  updateDojangSettings: (tenant: DojangTenant) => void;
  updateUserProfile: (user: UserAccount) => void;
  
  // Transfer Helpers
  transferStudent: (studentId: string, targetBranchId: string) => void;
  transferInventory: (itemId: string, targetBranchId: string, qty: number) => void;
  transferStaff: (staffId: string, targetBranchId: string) => void;

  // Super Admin & Auth Actions
  switchUserRole: (userId: string) => void;
  resetUserPassword: (identifier: string, newPassword?: string) => { success: boolean; error?: string; newPassword?: string };
  registerMasterAccount: (
    input: RegisterMasterInput
  ) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  registerBranchManager: (managerData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    branchId?: string;
    photoUrl?: string;
  }) => UserAccount;
  deleteBranchManager: (managerUserId: string) => { success: boolean; error?: string; reassignedCount: number; ownerBranchName: string; ownerMasterName: string };
  toggleBranchManagerStatus: (managerUserId: string, targetStatus?: 'Active' | 'Disabled') => void;
  approveTenant: (tenantId: string) => void;
  toggleUserStatus: (userId: string) => void;
  toggleTenantStatus: (tenantId: string) => void;
  registerNewTenant: (tenantData: Omit<DojangTenant, 'id' | 'createdAt'>, masterUser: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  
  // Notification Actions
  markNotificationRead: (id: string) => void;
  logAudit: (action: string, details: string) => void;

  // Grading & Promotion Actions
  createGradingTest: (
    testData: Omit<GradingTest, 'id' | 'tenantId' | 'candidatesCount' | 'passedCount'>,
    candidateStudentIds: string[]
  ) => void;
  updateCandidateScores: (
    candidateId: string,
    scores: CandidateScores,
    status: GradingCandidate['status'],
    remarks?: string
  ) => void;
  promoteCandidate: (candidateId: string) => { success: boolean; certificateNo?: string };
  batchPromotePassedCandidates: (testId: string) => number;
  deleteGradingTest: (testId: string) => void;
  updateCandidateFederationCertificate: (candidateId: string, url: string) => void;
  updateStudentPhoto: (studentId: string, photoUrl: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence Keys
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('dms_theme') === 'dark';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('dms_authenticated') === 'true';
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('dms_users');
    if (!saved) return INITIAL_USERS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('dms_current_user_id');
    const userList = users && users.length > 0 ? users : INITIAL_USERS;
    const found = saved ? userList.find((u) => u.id === saved) : null;
    return found || userList[1] || userList[0] || INITIAL_USERS[0];
  });

  const [tenants, setTenants] = useState<DojangTenant[]>(() => {
    const saved = localStorage.getItem('dms_tenants');
    if (!saved) return INITIAL_TENANTS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('dms_branches');
    if (!saved) return INITIAL_BRANCHES;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_BRANCHES;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('dms_students');
    if (!saved) return INITIAL_STUDENTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('dms_attendance');
    if (!saved) return INITIAL_ATTENDANCE;
    try {
      const parsed: AttendanceRecord[] = JSON.parse(saved);
      const demoIds = ['TKD-2026-001', 'TKD-2026-002', 'TKD-2026-003', 'TKD-2026-004', 'DMA-2026-001'];
      return parsed.filter((a) => !demoIds.includes(a.studentId));
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('dms_bills');
    if (!saved) return INITIAL_BILLS;
    try {
      const parsed: Bill[] = JSON.parse(saved);
      const demoIds = ['TKD-2026-001', 'TKD-2026-002', 'TKD-2026-003', 'TKD-2026-004', 'DMA-2026-001'];
      return parsed.filter((b) => !demoIds.includes(b.studentId));
    } catch {
      return INITIAL_BILLS;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('dms_inventory');
    if (!saved) return INITIAL_INVENTORY;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('dms_expenses');
    if (!saved) return INITIAL_EXPENSES;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('dms_audit_logs');
    if (!saved) return INITIAL_AUDIT_LOGS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('dms_notifications');
    if (!saved) return INITIAL_NOTIFICATIONS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [gradingTests, setGradingTests] = useState<GradingTest[]>(() => {
    const saved = localStorage.getItem('dms_grading_tests');
    if (!saved) return INITIAL_GRADING_TESTS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_GRADING_TESTS;
    }
  });

  const [gradingCandidates, setGradingCandidates] = useState<GradingCandidate[]>(() => {
    const saved = localStorage.getItem('dms_grading_candidates');
    if (!saved) return INITIAL_GRADING_CANDIDATES;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_GRADING_CANDIDATES;
    }
  });

  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Dark mode side-effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dms_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dms_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // ==========================================
  // REAL-TIME FIRESTORE MULTI-DEVICE SYNC
  // ==========================================
  useEffect(() => {
    // 1. Seed cloud database if empty on first startup
    seedInitialCloudDataIfNeeded(
      INITIAL_TENANTS,
      INITIAL_BRANCHES,
      INITIAL_USERS,
      INITIAL_STUDENTS,
      INITIAL_BILLS,
      INITIAL_INVENTORY,
      INITIAL_EXPENSES,
      INITIAL_GRADING_TESTS,
      INITIAL_GRADING_CANDIDATES
    );

    // 2. Real-time Subscriptions across all connected devices
    const unsubStudents = subscribeToCollection<Student>(COLLECTIONS.STUDENTS, (cloudStudents) => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
    });

    const unsubTenants = subscribeToCollection<DojangTenant>(COLLECTIONS.TENANTS, (cloudTenants) => {
      if (cloudTenants && cloudTenants.length > 0) {
        setTenants(cloudTenants);
      }
    });

    const unsubBranches = subscribeToCollection<Branch>(COLLECTIONS.BRANCHES, (cloudBranches) => {
      if (cloudBranches && cloudBranches.length > 0) {
        setBranches(cloudBranches);
      }
    });

    const unsubUsers = subscribeToCollection<UserAccount>(COLLECTIONS.USERS, (cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      }
    });

    const unsubAttendance = subscribeToCollection<AttendanceRecord>(COLLECTIONS.ATTENDANCE, (cloudAtt) => {
      if (cloudAtt && cloudAtt.length > 0) {
        setAttendance(cloudAtt);
      }
    });

    const unsubBills = subscribeToCollection<Bill>(COLLECTIONS.BILLS, (cloudBills) => {
      if (cloudBills && cloudBills.length > 0) {
        setBills(cloudBills);
      }
    });

    const unsubInventory = subscribeToCollection<InventoryItem>(COLLECTIONS.INVENTORY, (cloudInv) => {
      if (cloudInv && cloudInv.length > 0) {
        setInventory(cloudInv);
      }
    });

    const unsubExpenses = subscribeToCollection<Expense>(COLLECTIONS.EXPENSES, (cloudExp) => {
      if (cloudExp && cloudExp.length > 0) {
        setExpenses(cloudExp);
      }
    });

    const unsubTests = subscribeToCollection<GradingTest>(COLLECTIONS.GRADING_TESTS, (cloudTests) => {
      if (cloudTests && cloudTests.length > 0) {
        setGradingTests(cloudTests);
      }
    });

    const unsubCandidates = subscribeToCollection<GradingCandidate>(COLLECTIONS.GRADING_CANDIDATES, (cloudCand) => {
      if (cloudCand && cloudCand.length > 0) {
        setGradingCandidates(cloudCand);
      }
    });

    const unsubAudit = subscribeToCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS, (cloudAudit) => {
      if (cloudAudit && cloudAudit.length > 0) {
        setAuditLogs(cloudAudit);
      }
    });

    return () => {
      unsubStudents();
      unsubTenants();
      unsubBranches();
      unsubUsers();
      unsubAttendance();
      unsubBills();
      unsubInventory();
      unsubExpenses();
      unsubTests();
      unsubCandidates();
      unsubAudit();
    };
  }, []);

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem('dms_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('dms_current_user_id', currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dms_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('dms_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('dms_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('dms_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('dms_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('dms_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('dms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dms_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('dms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dms_grading_tests', JSON.stringify(gradingTests));
  }, [gradingTests]);

  useEffect(() => {
    localStorage.setItem('dms_grading_candidates', JSON.stringify(gradingCandidates));
  }, [gradingCandidates]);

  // Derived current tenant
  const currentTenant = tenants.find((t) => t.id === currentUser.tenantId) || null;

  // Log audit helper
  const logAudit = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      tenantId: currentUser.tenantId,
      action,
      details,
      ipAddress: '127.0.0.1 (Session)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    saveAuditLogToFirestore(newLog).catch((err) => console.warn('Audit log cloud save error:', err));
  };

  // MULTI-TENANT FILTERING LOGIC
  const getTenantFiltered = <T extends { tenantId?: string; branchId?: string; isDeleted?: boolean }>(
    list: T[],
    allowDeleted = false
  ): T[] => {
    return list.filter((item) => {
      if (!allowDeleted && item.isDeleted) return false;

      // Super Admin sees everything
      if (currentUser.role === 'SUPER_ADMIN') {
        if (selectedBranchId !== 'ALL' && item.branchId) {
          return item.branchId === selectedBranchId;
        }
        return true;
      }

      // Master sees all items matching their tenantId
      if (currentUser.role === 'MASTER') {
        if (item.tenantId !== currentUser.tenantId) return false;
        if (selectedBranchId !== 'ALL' && item.branchId) {
          return item.branchId === selectedBranchId;
        }
        return true;
      }

      // Branch Manager sees ONLY items for their specific branchId and tenantId
      if (currentUser.role === 'BRANCH_MANAGER') {
        if (item.tenantId !== currentUser.tenantId) return false;
        if (currentUser.branchId && item.branchId) {
          return item.branchId === currentUser.branchId;
        }
        return false;
      }

      return false;
    });
  };

  const visibleBranches = branches.filter((b) => {
    if (currentUser.role === 'SUPER_ADMIN') {
      return selectedBranchId === 'ALL' || b.id === selectedBranchId;
    }
    if (currentUser.role === 'MASTER') {
      if (b.tenantId !== currentUser.tenantId) return false;
      return selectedBranchId === 'ALL' || b.id === selectedBranchId;
    }
    if (currentUser.role === 'BRANCH_MANAGER') {
      return b.tenantId === currentUser.tenantId && b.id === currentUser.branchId;
    }
    return false;
  });

  const visibleStudents = getTenantFiltered(students, true);
  const visibleAttendance = getTenantFiltered(attendance);
  const visibleBills = getTenantFiltered(bills);
  const visibleInventory = getTenantFiltered(inventory);
  const visibleExpenses = getTenantFiltered(expenses);

  const visibleUsers = users.filter((u) => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'MASTER') return u.tenantId === currentUser.tenantId;
    if (currentUser.role === 'BRANCH_MANAGER') {
      return u.tenantId === currentUser.tenantId && u.branchId === currentUser.branchId;
    }
    return false;
  });

  const visibleAuditLogs = auditLogs.filter((a) => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'MASTER') return a.tenantId === currentUser.tenantId;
    if (currentUser.role === 'BRANCH_MANAGER') {
      return (
        a.tenantId === currentUser.tenantId &&
        (a.userEmail === currentUser.email || (currentUser.branchId ? a.details.includes(currentUser.branchId) : false))
      );
    }
    return false;
  });

  const visibleNotifications = notifications.filter((n) => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return !n.tenantId || n.tenantId === currentUser.tenantId;
  });

  const visibleGradingTests = getTenantFiltered<GradingTest>(gradingTests);

  const visibleGradingCandidates = gradingCandidates.filter((candidate) => {
    const parentTest = gradingTests.find((t) => t.id === candidate.testId);
    if (!parentTest) return true;
    return visibleGradingTests.some((vt) => vt.id === parentTest.id);
  });

  // Ensure selectedBranchId stays locked to assigned branch for Branch Managers
  useEffect(() => {
    if (currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId) {
      if (selectedBranchId !== currentUser.branchId) {
        setSelectedBranchId(currentUser.branchId);
      }
    }
  }, [currentUser, selectedBranchId]);

  // ACTION METHODS
  const addStudent = async (studentInput: Omit<Student, 'id' | 'tenantId'> & { id?: string }): Promise<Student> => {
    const tenantId = currentUser?.tenantId || currentTenant?.id || 'dojang-tenant';
    const effectiveBranchId =
      currentUser?.role === 'BRANCH_MANAGER' && currentUser?.branchId
        ? currentUser.branchId
        : studentInput.branchId || branches[0]?.id || 'branch-central';

    const regDate = studentInput.registrationDate || new Date().toISOString().split('T')[0];
    const targetBranch = branches.find((b) => b.id === effectiveBranchId);

    const autoGeneratedId = generateStudentId(
      currentTenant?.name || '',
      targetBranch?.name,
      regDate,
      students
    );

    const finalStudentId = (studentInput.id && studentInput.id.trim()) ? studentInput.id.trim() : autoGeneratedId;

    const newStudent: Student = {
      ...studentInput,
      id: finalStudentId,
      tenantId,
      branchId: effectiveBranchId,
      photo: studentInput.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      status: studentInput.status || 'Active',
      isDeleted: false,
    };

    setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
    saveStudentToFirestore(newStudent).catch((err) => console.warn('Student cloud save error:', err));
    logAudit('STUDENT_ADDED', `Registered student ${newStudent.firstName} ${newStudent.lastName} (${newStudent.id})`);
    
    // Reset branch selection if it would hide the newly created student for Master / Super Admin
    if (selectedBranchId !== 'ALL' && newStudent.branchId && selectedBranchId !== newStudent.branchId) {
      if (currentUser.role !== 'BRANCH_MANAGER') {
        setSelectedBranchId('ALL');
      }
    }

    return newStudent;
  };

  const updateStudent = async (updated: Student): Promise<void> => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    saveStudentToFirestore(updated).catch((err) => console.warn('Student cloud update error:', err));
    logAudit('STUDENT_UPDATED', `Updated profile of ${updated.firstName} ${updated.lastName} (${updated.id})`);
  };

  const deleteStudent = async (id: string): Promise<void> => {
    const targetStudent = students.find((s) => s.id === id);
    if (targetStudent) {
      const softDeleted: Student = { ...targetStudent, isDeleted: true, status: 'Inactive' };
      setStudents((prev) => prev.map((s) => (s.id === id ? softDeleted : s)));
      saveStudentToFirestore(softDeleted).catch((err) => console.warn('Student cloud deactivate error:', err));
      const name = `${targetStudent.firstName} ${targetStudent.lastName}`;
      logAudit('STUDENT_DEACTIVATED', `Deactivated / soft-deleted student ${name} (${id})`);
    }
  };

  const deactivateStudent = async (id: string): Promise<void> => {
    await deleteStudent(id);
  };

  const permanentDeleteStudent = async (id: string): Promise<void> => {
    const targetStudent = students.find((s) => s.id === id);
    const name = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : id;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteStudentFromFirestore(id).catch((err) => console.warn('Student cloud delete error:', err));
    logAudit('STUDENT_PERMANENTLY_DELETED', `Permanently deleted student ${name} (${id})`);
  };

  const toggleStudentStatus = async (id: string, targetStatus?: StudentStatus): Promise<void> => {
    const targetStudent = students.find((s) => s.id === id);
    if (!targetStudent) return;
    const nextStatus = targetStatus || (targetStudent.status === 'Active' ? 'Inactive' : 'Active');
    const isDeleted = nextStatus === 'Inactive';
    const updated: Student = { ...targetStudent, status: nextStatus, isDeleted };
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );
    saveStudentToFirestore(updated).catch((err) => console.warn('Student status cloud save error:', err));
    const name = `${targetStudent.firstName} ${targetStudent.lastName}`;
    logAudit('STUDENT_STATUS_TOGGLED', `Updated status for ${name} (${id}) to ${nextStatus}`);
  };

  const restoreStudent = async (id: string): Promise<void> => {
    const targetStudent = students.find((s) => s.id === id);
    if (targetStudent) {
      const restored: Student = { ...targetStudent, isDeleted: false, status: 'Active' };
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? restored : s))
      );
      saveStudentToFirestore(restored).catch((err) => console.warn('Student restore cloud save error:', err));
      const name = `${targetStudent.firstName} ${targetStudent.lastName}`;
      logAudit('STUDENT_RESTORED', `Reactivated returning student ${name} (${id})`);
    }
  };

  const markAttendance = (record: Omit<AttendanceRecord, 'id' | 'tenantId'>) => {
    const tenantId = currentUser.tenantId || 'dojang-tiger';
    const effectiveBranchId =
      currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId
        ? currentUser.branchId
        : record.branchId;
    const existingIndex = attendance.findIndex(
      (a) => a.studentId === record.studentId && a.date === record.date
    );

    let savedRecord: AttendanceRecord;
    if (existingIndex >= 0) {
      const updated = [...attendance];
      savedRecord = {
        ...updated[existingIndex],
        branchId: effectiveBranchId,
        status: record.status,
        notes: record.notes,
        markedBy: record.markedBy,
      };
      updated[existingIndex] = savedRecord;
      setAttendance(updated);
    } else {
      savedRecord = {
        ...record,
        branchId: effectiveBranchId,
        id: 'att-' + Date.now() + Math.random().toString(36).substring(2, 5),
        tenantId,
      };
      setAttendance((prev) => [savedRecord, ...prev]);
    }
    saveAttendanceRecordToFirestore(savedRecord).catch((err) => console.warn('Attendance cloud save error:', err));
    logAudit('ATTENDANCE_MARKED', `Marked ${record.status} for student ${record.studentId} on ${record.date}`);
  };

  const createBill = (billData: Omit<Bill, 'id' | 'tenantId'>): Bill => {
    const tenantId = currentUser.tenantId || 'dojang-tiger';
    const effectiveBranchId =
      currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId
        ? currentUser.branchId
        : billData.branchId;
    const receiptNo = billData.status === 'Paid' ? `REC-INV-${Math.floor(10000 + Math.random() * 90000)}` : undefined;
    const newBill: Bill = {
      ...billData,
      branchId: effectiveBranchId,
      id: `INV-2026-${String(bills.length + 101).padStart(3, '0')}`,
      tenantId,
      receiptNumber: receiptNo,
      paidDate: billData.status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
    };
    setBills((prev) => [newBill, ...prev]);
    saveBillToFirestore(newBill).catch((err) => console.warn('Bill cloud save error:', err));
    logAudit('BILL_CREATED', `Issued bill ${newBill.id} for $${newBill.amount} (${newBill.reason})`);
    return newBill;
  };

  const updateBillStatus = (id: string, status: Bill['status'], paymentMethod?: Bill['paymentMethod']) => {
    let targetBill: Bill | undefined;
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const isNowPaid = status === 'Paid';
          targetBill = {
            ...b,
            status,
            paymentMethod: paymentMethod || b.paymentMethod,
            paidDate: isNowPaid ? new Date().toISOString().split('T')[0] : b.paidDate,
            receiptNumber: isNowPaid && !b.receiptNumber ? `REC-INV-${Math.floor(10000 + Math.random() * 90000)}` : b.receiptNumber,
          };
          return targetBill;
        }
        return b;
      })
    );
    if (targetBill) {
      saveBillToFirestore(targetBill).catch((err) => console.warn('Bill cloud update error:', err));
    }
    logAudit('BILL_STATUS_UPDATED', `Changed bill ${id} status to ${status}`);
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'tenantId' | 'currentStock'>) => {
    const tenantId = currentUser.tenantId || 'dojang-tiger';
    const effectiveBranchId =
      currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId
        ? currentUser.branchId
        : itemData.branchId;
    const newItem: InventoryItem = {
      ...itemData,
      branchId: effectiveBranchId,
      id: 'inv-' + Date.now(),
      tenantId,
      currentStock: itemData.quantityIn - itemData.quantityOut,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
    saveInventoryItemToFirestore(newItem).catch((err) => console.warn('Inventory cloud save error:', err));
    logAudit('INVENTORY_ADDED', `Added inventory item: ${newItem.name}`);
  };

  const updateInventoryStock = (id: string, qtyInDelta: number, qtyOutDelta: number) => {
    let updatedItem: InventoryItem | undefined;
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newIn = item.quantityIn + qtyInDelta;
          const newOut = item.quantityOut + qtyOutDelta;
          updatedItem = {
            ...item,
            quantityIn: newIn,
            quantityOut: newOut,
            currentStock: newIn - newOut,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
          return updatedItem;
        }
        return item;
      })
    );
    if (updatedItem) {
      saveInventoryItemToFirestore(updatedItem).catch((err) => console.warn('Stock cloud save error:', err));
    }
    logAudit('STOCK_UPDATED', `Updated stock for item ${id} (+${qtyInDelta} In, +${qtyOutDelta} Out)`);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'tenantId'>) => {
    const tenantId = currentUser.tenantId || 'dojang-tiger';
    const effectiveBranchId =
      currentUser.role === 'BRANCH_MANAGER' && currentUser.branchId
        ? currentUser.branchId
        : expenseData.branchId;
    const newExpense: Expense = {
      ...expenseData,
      branchId: effectiveBranchId,
      id: 'exp-' + Date.now(),
      tenantId,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    saveExpenseToFirestore(newExpense).catch((err) => console.warn('Expense cloud save error:', err));
    logAudit('EXPENSE_ADDED', `Recorded expense: ${newExpense.name} ($${newExpense.amount})`);
  };

  const createBranch = (branchData: Omit<Branch, 'id' | 'tenantId' | 'createdAt'>) => {
    const tenantId = currentUser.tenantId || 'dojang-tiger';
    const newBranch: Branch = {
      ...branchData,
      id: 'branch-' + Date.now(),
      tenantId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBranches((prev) => [...prev, newBranch]);
    saveBranchToFirestore(newBranch).catch((err) => console.warn('Branch cloud save error:', err));
    logAudit('BRANCH_CREATED', `Created new branch: ${newBranch.name}`);
  };

  const updateBranch = (updated: Branch) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    saveBranchToFirestore(updated).catch((err) => console.warn('Branch cloud update error:', err));
    logAudit('BRANCH_UPDATED', `Updated branch details for ${updated.name}`);
  };

  const toggleBranchStatus = (branchId: string, targetStatus?: 'Active' | 'Inactive') => {
    const targetBranch = branches.find((b) => b.id === branchId);
    if (!targetBranch) return;

    const nextStatus = targetStatus || (targetBranch.status === 'Inactive' ? 'Active' : 'Inactive');
    const updated: Branch = { ...targetBranch, status: nextStatus };
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? updated : b))
    );
    saveBranchToFirestore(updated).catch((err) => console.warn('Branch status cloud save error:', err));
    logAudit('BRANCH_STATUS_TOGGLED', `Changed branch status for "${targetBranch.name}" (${branchId}) to ${nextStatus}`);
  };

  const deleteBranch = (branchId: string) => {
    const branchToDelete = branches.find((b) => b.id === branchId);
    if (!branchToDelete) {
      return { success: false, error: 'Branch not found.', reassignedCount: 0, ownerBranchName: '' };
    }

    const tenantId = branchToDelete.tenantId;
    const remainingTenantBranches = branches.filter((b) => b.tenantId === tenantId && b.id !== branchId);

    if (remainingTenantBranches.length === 0) {
      return {
        success: false,
        error: 'Cannot delete the sole branch of a Dojang. Create or assign another branch as HQ first.',
        reassignedCount: 0,
        ownerBranchName: '',
      };
    }

    // Determine owner Dojang branch (favor HQ/Main/Central, otherwise first remaining branch)
    const ownerBranch =
      remainingTenantBranches.find((b) => /main|hq|central/i.test(b.name)) || remainingTenantBranches[0];

    // Find and reassign students
    const studentsToTransfer = students.filter((s) => s.branchId === branchId);
    const reassignedCount = studentsToTransfer.length;

    setStudents((prev) =>
      prev.map((s) => (s.branchId === branchId ? { ...s, branchId: ownerBranch.id } : s))
    );

    // Reassign users/staff associated with this branch to ownerBranch
    setUsers((prev) =>
      prev.map((u) => (u.branchId === branchId ? { ...u, branchId: ownerBranch.id } : u))
    );

    // Reassign inventory items
    setInventory((prev) =>
      prev.map((i) => (i.branchId === branchId ? { ...i, branchId: ownerBranch.id } : i))
    );

    // Reassign records (attendance, bills, expenses)
    setAttendance((prev) =>
      prev.map((a) => (a.branchId === branchId ? { ...a, branchId: ownerBranch.id } : a))
    );
    setBills((prev) =>
      prev.map((b) => (b.branchId === branchId ? { ...b, branchId: ownerBranch.id } : b))
    );
    setExpenses((prev) =>
      prev.map((e) => (e.branchId === branchId ? { ...e, branchId: ownerBranch.id } : e))
    );

    // Remove the branch
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
    deleteBranchFromFirestore(branchId).catch((err) => console.warn('Branch cloud delete error:', err));

    if (selectedBranchId === branchId) {
      setSelectedBranchId(ownerBranch.id);
    }

    logAudit(
      'BRANCH_DELETED',
      `Permanently deleted branch "${branchToDelete.name}" (${branchId}). Automatically reassigned ${reassignedCount} student(s) to owner Dojang "${ownerBranch.name}" (${ownerBranch.id}).`
    );

    return {
      success: true,
      reassignedCount,
      ownerBranchName: ownerBranch.name,
    };
  };

  const updateDojangSettings = (updatedTenant: DojangTenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)));
    saveTenantToFirestore(updatedTenant).catch((err) => console.warn('Tenant cloud save error:', err));
    logAudit('SETTINGS_UPDATED', `Updated Dojang branding and contact settings for ${updatedTenant.name}`);
  };

  const updateUserProfile = (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    saveUserToFirestore(updatedUser).catch((err) => console.warn('User cloud save error:', err));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      sessionStorage.setItem('dms_current_user', JSON.stringify(updatedUser));
    }
    // Also if branch manager, update signature on branch if assigned
    if (updatedUser.branchId) {
      setBranches((prev) =>
        prev.map((b) => (b.id === updatedUser.branchId ? { ...b, signature: updatedUser.signature } : b))
      );
    }
    logAudit('USER_PROFILE_UPDATED', `Updated profile and signature for ${updatedUser.name}`);
  };

  // TRANSFERS
  const transferStudent = (studentId: string, targetBranchId: string) => {
    let updatedStudent: Student | undefined;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          updatedStudent = { ...s, branchId: targetBranchId };
          return updatedStudent;
        }
        return s;
      })
    );
    if (updatedStudent) {
      saveStudentToFirestore(updatedStudent).catch((err) => console.warn('Student transfer cloud save error:', err));
    }
    const branchName = branches.find((b) => b.id === targetBranchId)?.name || targetBranchId;
    logAudit('TRANSFER_STUDENT', `Transferred student ${studentId} to branch: ${branchName}`);
  };

  const transferInventory = (itemId: string, targetBranchId: string, qty: number) => {
    // Reduce from current item, add/create in target branch
    const sourceItem = inventory.find((i) => i.id === itemId);
    if (!sourceItem || sourceItem.currentStock < qty) return;

    // Reduce source
    updateInventoryStock(itemId, 0, qty);

    // Add to target
    const targetItem = inventory.find(
      (i) => i.name === sourceItem.name && i.branchId === targetBranchId && !i.isDeleted
    );

    if (targetItem) {
      updateInventoryStock(targetItem.id, qty, 0);
    } else {
      addInventoryItem({
        branchId: targetBranchId,
        name: sourceItem.name,
        category: sourceItem.category,
        quantityIn: qty,
        quantityOut: 0,
        minStockAlert: sourceItem.minStockAlert,
        unitCost: sourceItem.unitCost,
        sellingPrice: sourceItem.sellingPrice,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    }

    const branchName = branches.find((b) => b.id === targetBranchId)?.name || targetBranchId;
    logAudit('TRANSFER_INVENTORY', `Transferred ${qty}x ${sourceItem.name} to branch: ${branchName}`);
  };

  const transferStaff = (staffId: string, targetBranchId: string) => {
    let updatedUser: UserAccount | undefined;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === staffId) {
          updatedUser = { ...u, branchId: targetBranchId };
          return updatedUser;
        }
        return u;
      })
    );
    if (updatedUser) {
      saveUserToFirestore(updatedUser).catch((err) => console.warn('Staff transfer cloud save error:', err));
    }
    const branchName = branches.find((b) => b.id === targetBranchId)?.name || targetBranchId;
    logAudit('TRANSFER_STAFF', `Transferred staff member ${staffId} to branch: ${branchName}`);
  };

  // SUPER ADMIN ACTIONS
  const toggleUserStatus = (userId: string) => {
    let updatedUser: UserAccount | undefined;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Disabled' : 'Active';
          updatedUser = { ...u, status: nextStatus };
          logAudit('ADMIN_USER_STATUS', `Toggled user ${u.name} status to ${nextStatus}`);
          return updatedUser;
        }
        return u;
      })
    );
    if (updatedUser) {
      saveUserToFirestore(updatedUser).catch((err) => console.warn('User status cloud save error:', err));
    }
  };

  const toggleTenantStatus = (tenantId: string) => {
    let updatedTenant: DojangTenant | undefined;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const nextStatus = t.status === 'Active' ? 'Disabled' : 'Active';
          updatedTenant = { ...t, status: nextStatus };
          logAudit('ADMIN_TENANT_STATUS', `Toggled tenant ${t.name} status to ${nextStatus}`);
          return updatedTenant;
        }
        return t;
      })
    );
    if (updatedTenant) {
      saveTenantToFirestore(updatedTenant).catch((err) => console.warn('Tenant status cloud save error:', err));
    }
  };

  const registerNewTenant = (
    tenantData: Omit<DojangTenant, 'id' | 'createdAt'>,
    masterUserData: Omit<UserAccount, 'id' | 'createdAt'>
  ) => {
    const newTenantId = 'dojang-' + Date.now();
    const newMasterId = 'user-master-' + Date.now();

    const newTenant: DojangTenant = {
      ...tenantData,
      id: newTenantId,
      masterId: newMasterId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newMaster: UserAccount = {
      ...masterUserData,
      id: newMasterId,
      tenantId: newTenantId,
      role: 'MASTER',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const mainBranch: Branch = {
      id: 'branch-' + Date.now(),
      tenantId: newTenantId,
      name: `${newTenant.name} Main Branch`,
      phone: newTenant.phone,
      email: newTenant.email,
      address: newTenant.address,
      managerId: newMasterId,
      managerName: newMaster.name,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTenants((prev) => [...prev, newTenant]);
    setUsers((prev) => [...prev, newMaster]);
    setBranches((prev) => [...prev, mainBranch]);

    saveTenantToFirestore(newTenant).catch((err) => console.warn('New tenant cloud save error:', err));
    saveUserToFirestore(newMaster).catch((err) => console.warn('New master cloud save error:', err));
    saveBranchToFirestore(mainBranch).catch((err) => console.warn('New branch cloud save error:', err));

    logAudit('TENANT_REGISTERED', `Registered new Dojang Master: ${newTenant.name} (${newMaster.name})`);
  };

  const switchUserRole = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      setSelectedBranchId('ALL');
      logAudit('ROLE_SWITCH', `Switched active account session to ${targetUser.name} (${targetUser.role})`);
    }
  };

  const resetUserPassword = (identifier: string, newPassword?: string) => {
    const target = users.find(
      (u) => u.id === identifier || (u.email || '').toLowerCase() === (identifier || '').toLowerCase()
    );
    if (!target) {
      return { success: false, error: 'User account not found.' };
    }

    const updatedPass = newPassword && newPassword.trim() ? newPassword.trim() : 'Dojang2026!';
    const updatedUser: UserAccount = { ...target, password: updatedPass };

    setUsers((prev) =>
      prev.map((u) => (u.id === target.id ? updatedUser : u))
    );
    saveUserToFirestore(updatedUser).catch((err) => console.warn('Password reset cloud save error:', err));

    if (currentUser?.id === target.id) {
      setCurrentUser((prev) => (prev ? { ...prev, password: updatedPass } : prev));
    }

    logAudit('PASSWORD_RESET', `Super Admin reset password for account "${target.name}" (${target.email}) to "${updatedPass}"`);
    return { success: true, newPassword: updatedPass };
  };

  const registerMasterAccount = async (
    input: RegisterMasterInput
  ): Promise<{ success: boolean; error?: string }> => {
    const newTenantId = 'dojang-' + Date.now();
    const newMasterId = 'user-master-' + Date.now();

    const newTenant: DojangTenant = {
      id: newTenantId,
      masterId: newMasterId,
      name: input.dojangName,
      logo: input.logo,
      stampSeal: input.stampSeal,
      motto: input.motto,
      registrationNumber: `REG-TKD-${Math.floor(10000 + Math.random() * 90000)}`,
      danCertificateNumber: input.danCertificateNumber,
      danRank: (input.danRank as BeltRank) || '5th Dan',
      passportPhoto: input.passportPhoto,
      masterName: input.masterName,
      phone: input.phone,
      email: input.email,
      website: `www.${(input.dojangName || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      address: input.address,
      city: input.city,
      country: input.country,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active',
      subscriptionPlan: 'Enterprise',
    };

    const newMaster: UserAccount = {
      id: newMasterId,
      name: input.masterName,
      email: input.email,
      role: 'MASTER',
      tenantId: newTenantId,
      phone: input.phone,
      photoUrl: input.passportPhoto,
      danRank: (input.danRank as BeltRank) || '5th Dan',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newBranchId = 'branch-' + Date.now();
    const mainBranch: Branch = {
      id: newBranchId,
      tenantId: newTenant.id,
      name: `${input.dojangName} Main Headquarters`,
      phone: input.phone,
      email: input.email,
      address: `${input.address}, ${input.city}`,
      managerId: newMaster.id,
      managerName: input.masterName,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTenants((prev) => [...prev, newTenant]);
    setUsers((prev) => [...prev, newMaster]);
    setBranches((prev) => [...prev, mainBranch]);
    setCurrentUser(newMaster);
    setIsAuthenticated(true);
    sessionStorage.setItem('dms_authenticated', 'true');
    localStorage.setItem('dms_current_user_id', newMaster.id);
    setSelectedBranchId('ALL');

    saveTenantToFirestore(newTenant).catch((err) => console.warn('Master reg tenant cloud error:', err));
    saveUserToFirestore(newMaster).catch((err) => console.warn('Master reg user cloud error:', err));
    saveBranchToFirestore(mainBranch).catch((err) => console.warn('Master reg branch cloud error:', err));

    logAudit('MASTER_REGISTERED', `Registered new Dojang Master ${input.masterName} for ${input.dojangName}`);

    return { success: true };
  };

  const registerBranchManager = (managerData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    branchId?: string;
    photoUrl?: string;
  }) => {
    const newManagerId = 'user-bm-' + Date.now();
    const tenantId = currentUser?.tenantId || 'dojang-tenant';
    const newManager: UserAccount = {
      id: newManagerId,
      name: managerData.name,
      email: managerData.email,
      phone: managerData.phone,
      tenantId,
      branchId: managerData.branchId,
      role: 'BRANCH_MANAGER',
      status: 'Active',
      photoUrl: managerData.photoUrl,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newManager]);
    saveUserToFirestore(newManager).catch((err) => console.warn('Manager cloud save error:', err));
    logAudit(
      'BRANCH_MANAGER_REGISTERED',
      `Master registered Branch Manager ${newManager.name} (${newManager.email}) under tenant ${tenantId}`
    );
    return newManager;
  };

  const toggleBranchManagerStatus = (managerUserId: string, targetStatus?: 'Active' | 'Disabled') => {
    const targetUser = users.find((u) => u.id === managerUserId);
    if (!targetUser) return;

    const nextStatus = targetStatus || (targetUser.status === 'Disabled' ? 'Active' : 'Disabled');
    const updated: UserAccount = { ...targetUser, status: nextStatus };
    setUsers((prev) =>
      prev.map((u) => (u.id === managerUserId ? updated : u))
    );
    saveUserToFirestore(updated).catch((err) => console.warn('Manager toggle cloud save error:', err));
    logAudit(
      'MANAGER_STATUS_TOGGLED',
      `Changed branch manager status for "${targetUser.name}" (${managerUserId}) to ${nextStatus}`
    );
  };

  const deleteBranchManager = (managerUserId: string) => {
    const managerToDelete = users.find((u) => u.id === managerUserId);
    if (!managerToDelete) {
      return {
        success: false,
        error: 'Branch manager not found.',
        reassignedCount: 0,
        ownerBranchName: '',
        ownerMasterName: '',
      };
    }

    const tenantId = managerToDelete.tenantId || currentUser.tenantId;
    const currentTenant = tenants.find((t) => t.id === tenantId);
    const ownerMasterName = currentTenant?.masterName || currentUser.name;

    // Find main owner Dojang branch (HQ/Main or first branch)
    const tenantBranches = branches.filter((b) => b.tenantId === tenantId);
    const ownerBranch =
      tenantBranches.find((b) => /main|hq|central/i.test(b.name)) || tenantBranches[0] || branches[0];

    // Find all branches currently managed by this manager and reassign managerId/Name to Owner Master
    setBranches((prev) =>
      prev.map((b) => {
        if (b.managerId === managerUserId) {
          const updatedB = {
            ...b,
            managerId: currentTenant?.masterId || currentUser.id,
            managerName: ownerMasterName,
          };
          saveBranchToFirestore(updatedB).catch((err) => console.warn('Branch update cloud error:', err));
          return updatedB;
        }
        return b;
      })
    );

    // Find all students in branches managed by this manager or assigned under this manager's branch
    const managedBranchIds = tenantBranches.filter((b) => b.managerId === managerUserId).map((b) => b.id);
    const studentsToReassign = students.filter(
      (s) => s.branchId && (managedBranchIds.includes(s.branchId) || s.branchId === managerToDelete.branchId)
    );
    const reassignedCount = studentsToReassign.length;

    // Reassign those students to owner Dojang HQ branch
    if (ownerBranch) {
      setStudents((prev) =>
        prev.map((s) => {
          if (managedBranchIds.includes(s.branchId) || s.branchId === managerToDelete.branchId) {
            const reStudent = { ...s, branchId: ownerBranch.id };
            saveStudentToFirestore(reStudent).catch((err) => console.warn('Student reassign cloud error:', err));
            return reStudent;
          }
          return s;
        })
      );
    }

    // Delete the manager user account
    setUsers((prev) => prev.filter((u) => u.id !== managerUserId));
    deleteUserFromFirestore(managerUserId).catch((err) => console.warn('User delete cloud error:', err));

    logAudit(
      'BRANCH_MANAGER_DELETED',
      `Permanently deleted branch manager "${managerToDelete.name}" (${managerUserId}). Automatically reassigned ${reassignedCount} student(s) and branch management duties to owner Dojang Master "${ownerMasterName}" (${ownerBranch?.name || 'HQ'}).`
    );

    return {
      success: true,
      reassignedCount,
      ownerBranchName: ownerBranch?.name || 'Main HQ Dojang',
      ownerMasterName,
    };
  };

  const approveTenant = (tenantId: string) => {
    let updatedTenant: DojangTenant | undefined;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          updatedTenant = { ...t, status: 'Active' };
          return updatedTenant;
        }
        return t;
      })
    );
    if (updatedTenant) {
      saveTenantToFirestore(updatedTenant).catch((err) => console.warn('Approve tenant cloud error:', err));
    }
    logAudit('TENANT_APPROVED', `Super Admin approved tenant ID ${tenantId}`);
  };

  const login = async (
    email: string,
    _password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (email || '').toLowerCase().trim();

    const localTarget = users.find((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (localTarget) {
      if (localTarget.status === 'Disabled' || localTarget.status === 'Inactive') {
        return { success: false, error: 'Account is deactivated. Please contact your Super Admin.' };
      }

      setCurrentUser(localTarget);
      setIsAuthenticated(true);
      sessionStorage.setItem('dms_authenticated', 'true');
      localStorage.setItem('dms_current_user_id', localTarget.id);
      setSelectedBranchId('ALL');

      const newLog: AuditLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userEmail: localTarget.email,
        userName: localTarget.name,
        userRole: localTarget.role,
        tenantId: localTarget.tenantId,
        action: 'SYSTEM_LOGIN',
        details: `User ${localTarget.name} signed into Dojang Portal`,
        ipAddress: '127.0.0.1 (Session)',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      saveAuditLogToFirestore(newLog).catch((err) => console.warn('Login audit cloud error:', err));

      return { success: true };
    }

    return {
      success: false,
      error: 'No account found matching this email address.',
    };
  };

  const logout = async () => {
    if (currentUser) {
      const newLog: AuditLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userEmail: currentUser.email,
        userName: currentUser.name,
        userRole: currentUser.role,
        tenantId: currentUser.tenantId,
        action: 'SYSTEM_LOGOUT',
        details: `User ${currentUser.name} signed out from Dojang Portal`,
        ipAddress: '127.0.0.1 (Session)',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      saveAuditLogToFirestore(newLog).catch((err) => console.warn('Logout audit cloud error:', err));
    }

    setIsAuthenticated(false);
    sessionStorage.removeItem('dms_authenticated');
    setActiveTab('dashboard');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // GRADING & PROMOTION ACTIONS
  const createGradingTest = (
    testData: Omit<GradingTest, 'id' | 'tenantId' | 'candidatesCount' | 'passedCount'>,
    candidateStudentIds: string[]
  ) => {
    const testId = 'TEST-' + Date.now().toString(36).toUpperCase();
    const activeTenantId = currentUser.tenantId || 'dojang-tiger';
    const activeBranchId =
      testData.branchId || (selectedBranchId !== 'ALL' ? selectedBranchId : currentUser.branchId || 'branch-tiger-central');

    const BELT_PROGRESSION: Record<string, BeltRank> = {
      White: 'Yellow Stripe',
      'Yellow Stripe': 'Yellow',
      Yellow: 'Green Stripe',
      'Green Stripe': 'Green',
      Green: 'Blue Stripe',
      'Blue Stripe': 'Blue',
      Blue: 'Red Stripe',
      'Red Stripe': 'Red',
      Red: 'Black Stripe',
      'Black Stripe': '1st Dan',
      '1st Dan': '2nd Dan',
      '2nd Dan': '3rd Dan',
      '3rd Dan': '4th Dan',
      '4th Dan': '5th Dan',
      '5th Dan': '6th Dan',
      '6th Dan': '7th Dan',
      '7th Dan': '8th Dan',
      '8th Dan': '9th Dan',
    };

    const newCandidates: GradingCandidate[] = candidateStudentIds.map((stId, idx) => {
      const student = students.find((s) => s.id === stId);
      const studentName = student
        ? `${student.firstName} ${student.fatherName || student.lastName || ''}`.trim()
        : 'Student #' + stId;
      const currentBelt = student?.beltRank || 'White';
      const targetBelt = BELT_PROGRESSION[currentBelt] || currentBelt;

      return {
        id: 'CAND-' + Date.now() + '-' + idx,
        testId,
        studentId: stId,
        studentName,
        gender: student?.gender || 'Male',
        currentBelt,
        targetBelt,
        status: 'Registered',
        scores: { poomsae: 0, sparring: 0, breaking: 0, discipline: 0, fitness: 0 },
        totalScore: 0,
      };
    });

    const newTest: GradingTest = {
      ...testData,
      id: testId,
      tenantId: activeTenantId,
      branchId: activeBranchId,
      candidatesCount: newCandidates.length,
      passedCount: 0,
    };

    setGradingTests((prev) => [newTest, ...prev]);
    setGradingCandidates((prev) => [...newCandidates, ...prev]);

    saveGradingTestToFirestore(newTest).catch((err) => console.warn('Grading test cloud save error:', err));
    newCandidates.forEach((c) => {
      saveGradingCandidateToFirestore(c).catch((err) => console.warn('Candidate cloud save error:', err));
    });

    logAudit('CREATE_GRADING_TEST', `Scheduled new grading test "${testData.testName}" with ${newCandidates.length} candidate(s).`);
  };

  const updateCandidateScores = (
    candidateId: string,
    scores: CandidateScores,
    status: GradingCandidate['status'],
    remarks?: string
  ) => {
    const scoresArr = Object.values(scores).filter((v) => typeof v === 'number' && v > 0);
    const avgScore = scoresArr.length > 0 ? Number((scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length).toFixed(1)) : 0;

    let updatedCand: GradingCandidate | undefined;
    setGradingCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          updatedCand = {
            ...c,
            scores,
            totalScore: avgScore,
            status,
            remarks: remarks !== undefined ? remarks : c.remarks,
          };
          return updatedCand;
        }
        return c;
      })
    );
    if (updatedCand) {
      saveGradingCandidateToFirestore(updatedCand).catch((err) => console.warn('Candidate scores cloud save error:', err));
    }
  };

  const promoteCandidate = (candidateId: string) => {
    const candidate = gradingCandidates.find((c) => c.id === candidateId);
    if (!candidate) return { success: false };

    const student = students.find((s) => s.id === candidate.studentId);
    if (!student) return { success: false };

    const certNo = candidate.certificateNo || `TKD-CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().slice(0, 10);

    const updatedCand: GradingCandidate = {
      ...candidate,
      status: 'Passed',
      promotedDate: today,
      certificateNo: certNo,
    };

    const updatedStudent: Student = {
      ...student,
      beltRank: candidate.targetBelt,
    };

    // Update candidate record
    setGradingCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? updatedCand : c))
    );
    saveGradingCandidateToFirestore(updatedCand).catch((err) => console.warn('Candidate promote cloud error:', err));

    // Update student belt rank directly in students database
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? updatedStudent : s))
    );
    saveStudentToFirestore(updatedStudent).catch((err) => console.warn('Student promote cloud error:', err));

    // Update test passed count
    setGradingTests((prev) =>
      prev.map((t) => {
        if (t.id === candidate.testId) {
          const updatedT = {
            ...t,
            passedCount: t.passedCount + (candidate.status !== 'Passed' ? 1 : 0),
          };
          saveGradingTestToFirestore(updatedT).catch((err) => console.warn('Test promote count cloud error:', err));
          return updatedT;
        }
        return t;
      })
    );

    // Add notification
    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now(),
      tenantId: student.tenantId,
      title: 'Belt Promotion Distinction',
      message: `${student.firstName} ${student.lastName || ''} was officially promoted to ${candidate.targetBelt}. Certificate ${certNo} issued.`,
      date: today,
      type: 'belt_test',
      read: false,
      priority: 'high',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAudit(
      'BELT_PROMOTION',
      `Promoted student ${student.firstName} (${student.id}) from ${candidate.currentBelt} to ${candidate.targetBelt}. Certificate: ${certNo}`
    );

    return { success: true, certificateNo: certNo };
  };

  const batchPromotePassedCandidates = (testId: string) => {
    const candidatesInTest = gradingCandidates.filter((c) => c.testId === testId);
    let count = 0;

    candidatesInTest.forEach((cand) => {
      if (cand.status === 'Passed' || (cand.totalScore && cand.totalScore >= 70 && cand.status !== 'Failed')) {
        promoteCandidate(cand.id);
        count++;
      }
    });

    setGradingTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          const updatedT: GradingTest = { ...t, status: 'Completed' };
          saveGradingTestToFirestore(updatedT).catch((err) => console.warn('Batch promote test cloud error:', err));
          return updatedT;
        }
        return t;
      })
    );

    logAudit('BATCH_BELT_PROMOTION', `Completed test ${testId} and batch-promoted ${count} passing candidate(s).`);
    return count;
  };

  const deleteGradingTest = (testId: string) => {
    setGradingTests((prev) => prev.filter((t) => t.id !== testId));
    setGradingCandidates((prev) => prev.filter((c) => c.testId !== testId));
    deleteGradingTestFromFirestore(testId).catch((err) => console.warn('Delete grading test cloud error:', err));
    logAudit('DELETE_GRADING_TEST', `Deleted grading examination session ${testId}.`);
  };

  const updateCandidateFederationCertificate = (candidateId: string, url: string) => {
    let updatedCand: GradingCandidate | undefined;
    setGradingCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          updatedCand = { ...c, federationCertificateUrl: url };
          return updatedCand;
        }
        return c;
      })
    );
    if (updatedCand) {
      saveGradingCandidateToFirestore(updatedCand).catch((err) => console.warn('Federation cert cloud save error:', err));
    }
    logAudit('UPDATE_FEDERATION_CERTIFICATE', `Updated Federation Certificate for candidate ${candidateId}.`);
  };

  const updateStudentPhoto = async (studentId: string, photoUrl: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;
    const updatedStudent: Student = { ...targetStudent, photo: photoUrl };
    setStudents((prev) => prev.map((s) => (s.id === studentId ? updatedStudent : s)));
    saveStudentToFirestore(updatedStudent).catch((err) => console.warn('Student photo cloud save error:', err));
    logAudit('UPDATE_STUDENT_PHOTO', `Updated profile photo for student ${studentId}.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentTenant,
        selectedBranchId,
        darkMode,
        activeTab,
        isSidebarOpen,
        isAuthenticated,
        login,
        logout,
        toggleDarkMode,
        setActiveTab,
        setIsSidebarOpen,
        toggleSidebar,
        setCurrentUser,
        setSelectedBranchId,
        tenants,
        branches,
        users,
        students,
        attendance,
        bills,
        inventory,
        expenses,
        auditLogs,
        notifications,
        gradingTests,
        gradingCandidates,
        visibleBranches,
        visibleStudents,
        visibleAttendance,
        visibleBills,
        visibleInventory,
        visibleExpenses,
        visibleNotifications,
        visibleUsers,
        visibleAuditLogs,
        visibleGradingTests,
        visibleGradingCandidates,
        addStudent,
        updateStudent,
        deleteStudent,
        deactivateStudent,
        permanentDeleteStudent,
        toggleStudentStatus,
        restoreStudent,
        markAttendance,
        createBill,
        updateBillStatus,
        addInventoryItem,
        updateInventoryStock,
        addExpense,
        createBranch,
        updateBranch,
        deleteBranch,
        toggleBranchStatus,
        updateDojangSettings,
        updateUserProfile,
        transferStudent,
        transferInventory,
        transferStaff,
        switchUserRole,
        resetUserPassword,
        registerMasterAccount,
        registerBranchManager,
        deleteBranchManager,
        toggleBranchManagerStatus,
        approveTenant,
        toggleUserStatus,
        toggleTenantStatus,
        registerNewTenant,
        markNotificationRead,
        logAudit,
        createGradingTest,
        updateCandidateScores,
        promoteCandidate,
        batchPromotePassedCandidates,
        deleteGradingTest,
        updateCandidateFederationCertificate,
        updateStudentPhoto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
