export type UserRole = 'SUPER_ADMIN' | 'MASTER' | 'BRANCH_MANAGER';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'billing'
  | 'inventory'
  | 'financials'
  | 'expenses'
  | 'branches'
  | 'reports'
  | 'settings'
  | 'profile'
  | 'admin'
  | 'logs'
  | 'grading';

export interface RegisterMasterInput {
  masterName: string;
  dojangName: string;
  phone: string;
  email: string;
  password?: string;
  address: string;
  city: string;
  country: string;
  danRank: string;
  danCertificateNumber: string;
  motto: string;
  passportPhoto: string;
  logo: string;
  stampSeal: string;
  signature?: string;
}

export type BeltRank =
  | 'White'
  | 'Yellow Stripe'
  | 'Yellow'
  | 'Green Stripe'
  | 'Green'
  | 'Blue Stripe'
  | 'Blue'
  | 'Brown Stripe'
  | 'Brown'
  | 'Red Stripe'
  | 'Red'
  | 'Black Stripe'
  | 'Black'
  | '1st Dan'
  | '2nd Dan'
  | '3rd Dan'
  | '4th Dan'
  | '5th Dan'
  | '6th Dan'
  | '7th Dan'
  | '8th Dan'
  | '9th Dan';

export const ALL_BELT_RANKS: BeltRank[] = [
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

export type Gender = 'Male' | 'Female' | 'Other';

export type StudentStatus = 'Active' | 'Inactive' | 'Suspended' | 'Graduated';

export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Absent';

export type BillingStatus = 'Paid' | 'Pending' | 'Sponsored' | 'Cancelled';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Mobile Money' | 'Check';

export interface DojangTenant {
  id: string; // tenantId (e.g. dojang-1)
  masterId: string;
  name: string;
  logo: string; // Base64 or image URL
  stampSeal: string; // Base64 or image URL
  signature?: string; // Base64 or image URL
  motto: string;
  registrationNumber: string;
  danCertificateNumber: string;
  danRank: BeltRank;
  passportPhoto: string;
  masterName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
  status: 'Active' | 'Disabled' | 'Pending Approval';
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  managerId?: string; // User account ID
  managerName?: string;
  logo?: string;
  stampSeal?: string;
  signature?: string;
  status?: 'Active' | 'Inactive';
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  tenantId?: string; // undefined for SUPER_ADMIN
  branchId?: string; // set for BRANCH_MANAGER
  phone: string;
  photoUrl?: string;
  danRank?: BeltRank;
  signature?: string;
  status: 'Active' | 'Disabled';
  createdAt: string;
}

export interface Student {
  id: string; // Student ID e.g., TKD-2026-001
  tenantId: string;
  branchId: string;
  firstName: string; // Student's Given Name
  fatherName?: string; // Father's Name
  grandFatherName?: string; // Grandfather's Name
  middleName?: string;
  lastName: string;
  photo: string;
  gender: Gender;
  dob: string;
  registrationDate: string;
  beltRank: BeltRank;
  bloodGroup: string;
  phone?: string;
  hivStatus?: string;
  medicalRecords?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string;
  emergencyContact: string;
  status: StudentStatus;
  notes?: string;
  isDeleted?: boolean;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  branchId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  notes?: string;
}

export interface Bill {
  id: string; // e.g. INV-2026-101
  tenantId: string;
  branchId: string;
  studentId: string;
  reason: string; // e.g. "Monthly Tuition - July 2026", "Belt Exam Fee"
  feeType?: 'Tuition' | 'Belt Exam' | 'Uniform' | 'Equipment' | 'Other';
  billingMonth?: string; // e.g. "2026-07" (YYYY-MM)
  amount: number;
  billingDate: string;
  dueDate: string;
  status: BillingStatus;
  paymentMethod?: PaymentMethod;
  paidDate?: string;
  receiptNumber?: string;
  notes?: string;
  isDeleted?: boolean;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  category: 'Dobok/Uniform' | 'Belts' | 'Protective Gear' | 'Training Equipment' | 'Merchandise' | 'Certificates';
  quantityIn: number;
  quantityOut: number;
  currentStock: number; // QtyIn - QtyOut
  minStockAlert: number;
  unitCost: number;
  sellingPrice: number;
  lastUpdated: string;
  isDeleted?: boolean;
}

export interface Expense {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  category: 'Rent' | 'Utilities' | 'Staff Salary' | 'Equipment' | 'Tournament/Event' | 'Maintenance' | 'Marketing' | 'Other';
  amount: number;
  date: string;
  description?: string;
  receiptUrl?: string;
  isDeleted?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  tenantId?: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface SystemNotification {
  id: string;
  tenantId?: string;
  type: 'belt_test' | 'payment' | 'stock' | 'birthday' | 'attendance' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ReportFilter {
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  branchId?: string;
  beltRank?: string;
  status?: string;
}

export interface CandidateScores {
  poomsae?: number; // 0-100 (Forms / Patterns)
  sparring?: number; // 0-100 (Kyorugi)
  breaking?: number; // 0-100 (Kyokpa)
  discipline?: number; // 0-100 (Etiquette / Focus)
  fitness?: number; // 0-100 (Stamina & Basics)
}

export interface GradingCandidate {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  gender?: string;
  currentBelt: BeltRank;
  targetBelt: BeltRank;
  status: 'Registered' | 'Passed' | 'Failed' | 'Pending';
  scores: CandidateScores;
  totalScore?: number;
  remarks?: string;
  promotedDate?: string;
  certificateNo?: string;
  federationCertificateUrl?: string;
}

export interface GradingTest {
  id: string;
  tenantId: string;
  branchId: string;
  testName: string;
  testDate: string;
  examinerName: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  candidatesCount: number;
  passedCount: number;
  location?: string;
  notes?: string;
}
