import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AuditLog,
  AttendanceRecord,
  Bill,
  Branch,
  DojangTenant,
  Expense,
  GradingCandidate,
  GradingTest,
  InventoryItem,
  Student,
  UserAccount,
} from '../types';

// Collections References
export const COLLECTIONS = {
  TENANTS: 'tenants',
  BRANCHES: 'branches',
  USERS: 'users',
  STUDENTS: 'students',
  ATTENDANCE: 'attendance',
  BILLS: 'bills',
  INVENTORY: 'inventory',
  EXPENSES: 'expenses',
  GRADING_TESTS: 'grading_tests',
  GRADING_CANDIDATES: 'grading_candidates',
  AUDIT_LOGS: 'audit_logs',
};

// Generic clean helper to remove undefined fields which Firestore rejects
export const cleanForFirestore = <T extends Record<string, any>>(obj: T): T => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = cleanForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

// ==========================================
// REAL-TIME SYNC LISTENERS
// ==========================================

export const subscribeToCollection = <T>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as T);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`Error subscribing to ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
};

// ==========================================
// TENANTS & BRANCHES
// ==========================================

export const saveTenantToFirestore = async (tenant: DojangTenant): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.TENANTS, tenant.id);
  await setDoc(docRef, cleanForFirestore(tenant), { merge: true });
};

export const saveBranchToFirestore = async (branch: Branch): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BRANCHES, branch.id);
  await setDoc(docRef, cleanForFirestore(branch), { merge: true });
};

export const deleteBranchFromFirestore = async (branchId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BRANCHES, branchId);
  await deleteDoc(docRef);
};

// ==========================================
// USERS / ACCOUNTS
// ==========================================

export const saveUserToFirestore = async (user: UserAccount): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.USERS, user.id);
  await setDoc(docRef, cleanForFirestore(user), { merge: true });
};

export const deleteUserFromFirestore = async (userId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  await deleteDoc(docRef);
};

// ==========================================
// STUDENTS
// ==========================================

export const saveStudentToFirestore = async (student: Student): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.STUDENTS, student.id);
  await setDoc(docRef, cleanForFirestore(student), { merge: true });
};

export const deleteStudentFromFirestore = async (studentId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentId);
  await deleteDoc(docRef);
};

export const batchSaveStudentsToFirestore = async (students: Student[]): Promise<void> => {
  const batch = writeBatch(db);
  students.forEach((student) => {
    const docRef = doc(db, COLLECTIONS.STUDENTS, student.id);
    batch.set(docRef, cleanForFirestore(student), { merge: true });
  });
  await batch.commit();
};

// ==========================================
// ATTENDANCE
// ==========================================

export const saveAttendanceRecordToFirestore = async (record: AttendanceRecord): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
  await setDoc(docRef, cleanForFirestore(record), { merge: true });
};

export const batchSaveAttendanceToFirestore = async (records: AttendanceRecord[]): Promise<void> => {
  const batch = writeBatch(db);
  records.forEach((record) => {
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
    batch.set(docRef, cleanForFirestore(record), { merge: true });
  });
  await batch.commit();
};

// ==========================================
// BILLING / INVOICES
// ==========================================

export const saveBillToFirestore = async (bill: Bill): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BILLS, bill.id);
  await setDoc(docRef, cleanForFirestore(bill), { merge: true });
};

export const deleteBillFromFirestore = async (billId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BILLS, billId);
  await deleteDoc(docRef);
};

// ==========================================
// INVENTORY
// ==========================================

export const saveInventoryItemToFirestore = async (item: InventoryItem): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INVENTORY, item.id);
  await setDoc(docRef, cleanForFirestore(item), { merge: true });
};

export const deleteInventoryItemFromFirestore = async (itemId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INVENTORY, itemId);
  await deleteDoc(docRef);
};

// ==========================================
// EXPENSES
// ==========================================

export const saveExpenseToFirestore = async (expense: Expense): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EXPENSES, expense.id);
  await setDoc(docRef, cleanForFirestore(expense), { merge: true });
};

export const deleteExpenseFromFirestore = async (expenseId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
  await deleteDoc(docRef);
};

// ==========================================
// GRADING TESTS & CANDIDATES
// ==========================================

export const saveGradingTestToFirestore = async (test: GradingTest): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.GRADING_TESTS, test.id);
  await setDoc(docRef, cleanForFirestore(test), { merge: true });
};

export const deleteGradingTestFromFirestore = async (testId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.GRADING_TESTS, testId);
  await deleteDoc(docRef);
};

export const saveGradingCandidateToFirestore = async (candidate: GradingCandidate): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.GRADING_CANDIDATES, candidate.id);
  await setDoc(docRef, cleanForFirestore(candidate), { merge: true });
};

export const deleteGradingCandidateFromFirestore = async (candidateId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.GRADING_CANDIDATES, candidateId);
  await deleteDoc(docRef);
};

// ==========================================
// AUDIT LOGS
// ==========================================

export const saveAuditLogToFirestore = async (log: AuditLog): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.AUDIT_LOGS, log.id);
  await setDoc(docRef, cleanForFirestore(log), { merge: true });
};

// ==========================================
// INITIAL DATABASE SEEDING
// ==========================================

export const seedInitialCloudDataIfNeeded = async (
  defaultTenants: DojangTenant[],
  defaultBranches: Branch[],
  defaultUsers: UserAccount[],
  defaultStudents: Student[],
  defaultBills: Bill[],
  defaultInventory: InventoryItem[],
  defaultExpenses: Expense[],
  defaultTests: GradingTest[],
  defaultCandidates: GradingCandidate[]
): Promise<void> => {
  try {
    const tenantsSnap = await getDocs(collection(db, COLLECTIONS.TENANTS));
    if (tenantsSnap.empty) {
      // Cloud database is empty, seed initial data for seamless first run
      const batch = writeBatch(db);

      defaultTenants.forEach((t) => {
        batch.set(doc(db, COLLECTIONS.TENANTS, t.id), cleanForFirestore(t));
      });
      defaultBranches.forEach((b) => {
        batch.set(doc(db, COLLECTIONS.BRANCHES, b.id), cleanForFirestore(b));
      });
      defaultUsers.forEach((u) => {
        batch.set(doc(db, COLLECTIONS.USERS, u.id), cleanForFirestore(u));
      });
      defaultStudents.forEach((s) => {
        batch.set(doc(db, COLLECTIONS.STUDENTS, s.id), cleanForFirestore(s));
      });
      defaultBills.forEach((b) => {
        batch.set(doc(db, COLLECTIONS.BILLS, b.id), cleanForFirestore(b));
      });
      defaultInventory.forEach((i) => {
        batch.set(doc(db, COLLECTIONS.INVENTORY, i.id), cleanForFirestore(i));
      });
      defaultExpenses.forEach((e) => {
        batch.set(doc(db, COLLECTIONS.EXPENSES, e.id), cleanForFirestore(e));
      });
      defaultTests.forEach((t) => {
        batch.set(doc(db, COLLECTIONS.GRADING_TESTS, t.id), cleanForFirestore(t));
      });
      defaultCandidates.forEach((c) => {
        batch.set(doc(db, COLLECTIONS.GRADING_CANDIDATES, c.id), cleanForFirestore(c));
      });

      await batch.commit();
      console.log('Firebase Cloud database successfully initialized with initial data.');
    }
  } catch (err) {
    console.warn('Notice: Firebase auto-seed check skipped or already seeded:', err);
  }
};
