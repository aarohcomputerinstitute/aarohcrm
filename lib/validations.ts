// ============================================================
// AAROH CRM — Zod Validation Schemas for ALL API inputs
// ============================================================

import { z } from "zod";

// ---- Shared validators ----

const mobileRegex = /^[0-9]{10}$/;
const pincodeRegex = /^[0-9]{6}$/;

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

// ---- Student ----

export const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).trim(),
  lastName: z.string().min(1, "Last name is required").max(100).trim(),
  fatherName: z.string().max(100).trim().optional().nullable(),
  motherName: z.string().max(100).trim().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  mobile: z.string().regex(mobileRegex, "Mobile must be 10 digits"),
  whatsapp: z.string().regex(mobileRegex, "WhatsApp must be 10 digits").optional().nullable().or(z.literal("")),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(pincodeRegex, "Pincode must be 6 digits").optional().nullable().or(z.literal("")),
  parentName: z.string().max(100).optional().nullable(),
  parentOccupation: z.string().max(100).optional().nullable(),
  parentMobile: z.string().regex(mobileRegex).optional().nullable().or(z.literal("")),
  aadhaarNumber: z.string().max(12).optional().nullable(),
  aadhaarUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  photoUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  courseId: z.string().cuid().optional().nullable().or(z.literal("")),
  batchId: z.string().cuid().optional().nullable().or(z.literal("")),
  courseLevel: z.enum(["BASIC", "MODERATE", "ADVANCE"]).optional().nullable(),
  batchPreference: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional().nullable(),
  admissionDate: z.string().optional().nullable(),
  inquiryId: z.string().cuid().optional().nullable().or(z.literal("")),
  referredById: z.string().cuid().optional().nullable().or(z.literal("")),
  totalFee: z.union([z.string(), z.number()]).optional().nullable(),
  discount: z.union([z.string(), z.number()]).optional().nullable(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  mobile: z.string().regex(mobileRegex, "Mobile must be 10 digits"),
});

// ---- Inquiry ----

export const createInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(200).trim(),
  mobile: z.string().regex(mobileRegex, "Mobile must be 10 digits"),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  courseId: z.string().cuid().optional().nullable().or(z.literal("")),
  source: z.enum(["GOOGLE", "WEBSITE", "WALK_IN", "REFERRAL", "SOCIAL_MEDIA", "OTHER"]).optional(),
  status: z.enum(["NEW", "FOLLOWUP", "CONVERTED", "NOT_INTERESTED"]).optional(),
  followupDate: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  counselorId: z.string().cuid().optional().nullable().or(z.literal("")),
  feeOffered: z.union([z.string(), z.number()]).optional().nullable(),
  referredById: z.string().cuid().optional().nullable().or(z.literal("")),
});

export const updateInquirySchema = createInquirySchema.partial().extend({
  name: z.string().min(1).max(200).trim(),
  mobile: z.string().regex(mobileRegex),
});

// ---- Course ----

export const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(200).trim(),
  duration: z.string().min(1, "Duration is required").max(100).trim(),
  fee: z.union([z.string(), z.number()]).refine(
    (val) => Number(val) >= 0 && Number(val) <= 1000000,
    { message: "Fee must be between 0 and 10,00,000" }
  ),
  description: z.string().max(1000).optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ---- Batch ----

export const createBatchSchema = z.object({
  courseId: z.string().cuid("Invalid course ID"),
  batchName: z.string().min(1, "Batch name is required").max(200).trim(),
  trainer: z.string().min(1, "Trainer is required").max(200).trim(),
  startTime: z.string().min(1, "Start time is required").max(10),
  endTime: z.string().min(1, "End time is required").max(10),
  startDate: z.string().optional().nullable(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]).optional(),
});

export const updateBatchSchema = createBatchSchema.partial();

// ---- Fee Transaction ----

export const createFeeTransactionSchema = z.object({
  studentId: z.string().cuid("Invalid student ID"),
  amount: z.union([z.string(), z.number()]).refine(
    (val) => Number(val) > 0 && Number(val) <= 1000000,
    { message: "Amount must be between ₹1 and ₹10,00,000" }
  ),
  paymentMode: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]).optional(),
  paymentDate: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  offlineReceiptNo: z.string().max(100).optional().nullable(),
  nextDueDate: z.string().optional().nullable(),
});

export const updateFeeSchema = z.object({
  id: z.string().cuid("Invalid fee ID"),
  nextDueDate: z.string().optional().nullable(),
});

// ---- Certificate ----

export const createCertificateSchema = z.object({
  studentId: z.string().cuid("Invalid student ID"),
  courseId: z.string().cuid("Invalid course ID"),
  completionDate: z.string().min(1, "Completion date is required"),
});

// ---- Attendance ----

export const attendanceRecordSchema = z.object({
  studentId: z.string().cuid(),
  status: z.enum(["PRESENT", "ABSENT", "LEAVE"]),
});

export const saveAttendanceSchema = z.object({
  batchId: z.string().cuid("Invalid batch ID"),
  date: z.string().min(1, "Date is required"),
  records: z.array(attendanceRecordSchema).min(1, "At least one record required"),
});

// ---- User ----

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).trim(),
  email: z.string().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  role: z.enum(["ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER", "EMITRA"]),
  phone: z.string().regex(mobileRegex).optional().nullable().or(z.literal("")),
  commissionRate: z.union([z.string(), z.number()]).optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  email: z.string().email().max(255).optional(),
  role: z.enum(["ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER", "EMITRA"]).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().regex(mobileRegex).optional().nullable().or(z.literal("")),
  commissionRate: z.union([z.string(), z.number()]).optional().nullable(),
});

// ---- Commission ----

export const updateCommissionSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
  paymentMode: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]).optional().nullable(),
  transactionId: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// ---- Helper: Parse and validate body ----

export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return {
        data: null,
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }
    return { data: result.data, error: null };
  } catch {
    return { data: null, error: "Invalid JSON body" };
  }
}

/**
 * Validate request body and throw if invalid.
 * Use this in routes where you want clean code without null checks.
 */
export async function parseBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new ValidationError(`${firstError.path.join(".")}: ${firstError.message}`);
  }
  return result.data;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
