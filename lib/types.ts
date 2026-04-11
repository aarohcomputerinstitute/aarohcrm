// ============================================================
// AAROH CRM — Shared TypeScript Interfaces
// ============================================================

// ---- Enums (mirroring Prisma) ----

export type Role = "ADMIN" | "COUNSELOR" | "ACCOUNTANT" | "TRAINER" | "EMITRA";
export type InquiryStatus = "NEW" | "FOLLOWUP" | "CONVERTED" | "NOT_INTERESTED";
export type InquirySource = "GOOGLE" | "WEBSITE" | "WALK_IN" | "REFERRAL" | "SOCIAL_MEDIA" | "OTHER";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type CourseLevel = "BASIC" | "MODERATE" | "ADVANCE";
export type BatchPreference = "MORNING" | "AFTERNOON" | "EVENING";
export type BatchStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";
export type PaymentMode = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";
export type CommissionStatus = "PENDING" | "PAID" | "CANCELLED";

// ---- API Response Helpers ----

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  details?: string;
}

// ---- User ----

export interface UserSafe {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  isActive: boolean;
  createdAt: Date;
}

// ---- Student ----

export interface StudentListItem {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string | null;
  photoUrl?: string | null;
  admissionDate: Date;
  isActive: boolean;
  course?: { id: string; name: string } | null;
  batch?: { id: string; batchName: string } | null;
  fee?: { dueAmount: number; paidAmount: number; finalFee: number } | null;
}

export interface StudentDetail extends StudentListItem {
  fatherName?: string | null;
  motherName?: string | null;
  dob?: Date | null;
  gender?: Gender | null;
  category?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  parentName?: string | null;
  parentOccupation?: string | null;
  parentMobile?: string | null;
  aadhaarNumber?: string | null;
  aadhaarUrl?: string | null;
  courseLevel?: CourseLevel | null;
  batchPreference?: BatchPreference | null;
  referredById?: string | null;
  inquiryId?: string | null;
}

// ---- Inquiry ----

export interface InquiryListItem {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  source: InquirySource;
  status: InquiryStatus;
  followupDate?: Date | null;
  notes?: string | null;
  feeOffered?: number | null;
  createdAt: Date;
  course?: { id: string; name: string } | null;
  counselor?: { id: string; name: string } | null;
  referrer?: { id: string; name: string } | null;
}

// ---- Course ----

export interface CourseItem {
  id: string;
  name: string;
  duration: string;
  fee: number;
  description?: string | null;
  isActive: boolean;
  _count?: { students: number; batches: number };
}

// ---- Batch ----

export interface BatchItem {
  id: string;
  courseId: string;
  batchName: string;
  trainer: string;
  startTime: string;
  endTime: string;
  startDate?: Date | null;
  status: BatchStatus;
  course?: { id: string; name: string };
  _count?: { students: number };
}

// ---- Fee ----

export interface FeeRecord {
  id: string;
  studentId: string;
  totalFee: number;
  discount: number;
  finalFee: number;
  paidAmount: number;
  dueAmount: number;
  nextDueDate?: Date | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    photoUrl?: string | null;
    course?: { name: string } | null;
    batch?: { batchName: string } | null;
  };
  transactions?: FeeTransactionItem[];
}

export interface FeeTransactionItem {
  id: string;
  feeId: string;
  studentId: string;
  amount: number;
  paymentMode: PaymentMode;
  receiptNumber: string;
  paymentDate: Date;
  notes?: string | null;
}

// ---- Attendance ----

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

// ---- Certificate ----

export interface CertificateItem {
  id: string;
  studentId: string;
  courseId: string;
  completionDate: Date;
  certificateNo: string;
  issuedAt: Date;
  student: {
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    courseLevel?: CourseLevel | null;
  };
}

// ---- Commission ----

export interface CommissionItem {
  id: string;
  studentId: string;
  userId: string;
  amount: number;
  status: CommissionStatus;
  notes?: string | null;
  paidAt?: Date | null;
  paymentMode?: PaymentMode | null;
  transactionId?: string | null;
  createdAt: Date;
  user?: { name: string; email: string };
  student?: {
    firstName: string;
    lastName: string;
    course?: { name: string } | null;
  };
}

// ---- Dashboard Stats ----

export interface DashboardStats {
  totalInquiries: number;
  todayInquiries: number;
  totalStudents: number;
  totalCourses: number;
  activeBatches: number;
  feesCollected: number;
  feesDue: number;
}

export interface EmitraDashboardStats {
  totalReferrals: number;
  totalAdmissions: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
}
