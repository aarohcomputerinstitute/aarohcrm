import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole, requireRole } from "@/lib/api-auth";
import { createStudentSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  // Any authenticated user can view students (filtered appropriately)
  const { user, error: authError } = requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT", "EMITRA"]);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const batchId = searchParams.get("batchId");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { isActive: true };
    
    // e-Mitra can only see students they referred
    if (user.role === "EMITRA") {
      where.referredById = user.userId;
    }
    
    if (courseId) where.courseId = courseId;
    if (batchId) where.batchId = batchId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { admissionDate: "desc" },
        include: {
          course: { select: { id: true, name: true } },
          batch: { select: { id: true, batchName: true } },
          fee: { select: { dueAmount: true, paidAmount: true, finalFee: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({ students, total, page, limit });
  } catch (error) {
    console.error("Students GET error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Admin, Counselor, Accountant can create admissions directly
  // e-Mitra can create via their flow (requireRole handles it)
  const { user, error: authError } = requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT", "EMITRA"]);
  if (authError) return authError;

  // ---- Validate Input ----
  const { data, error: validationError } = await validateBody(request, createStudentSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    let referredById = data.referredById || null;

    // If converting from Inquiry, fetch its referrer
    if (data.inquiryId) {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: data.inquiryId },
        select: { referredById: true }
      });
      if (inquiry?.referredById) {
        referredById = inquiry.referredById;
      }
    }
    
    // If e-Mitra (pointed center) is creating, auto-set referrer to themselves
    if (user.role === "EMITRA") {
      referredById = user.userId;
    }

    const student = await prisma.student.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        dob: data.dob ? new Date(data.dob) : null,
        gender: data.gender || null,
        category: data.category || null,
        mobile: data.mobile,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        parentName: data.parentName || null,
        parentOccupation: data.parentOccupation || null,
        parentMobile: data.parentMobile || null,
        aadhaarNumber: data.aadhaarNumber || null,
        aadhaarUrl: data.aadhaarUrl || null,
        photoUrl: data.photoUrl || null,
        courseId: data.courseId || null,
        batchId: data.batchId || null,
        courseLevel: data.courseLevel || null,
        batchPreference: data.batchPreference || null,
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
        inquiryId: data.inquiryId || null,
        referredById,
      },
    });

    // Auto-create commission for the pointed center (e-Mitra) if referred
    if (referredById) {
      const referrer = await prisma.user.findUnique({
        where: { id: referredById },
        select: { role: true, isActive: true, commissionRate: true }
      });

      if (referrer?.role === "EMITRA" && referrer.isActive) {
        const totalFeeNum = data.totalFee ? parseFloat(String(data.totalFee)) : 0;
        const discountNum = data.discount ? parseFloat(String(data.discount)) : 0;
        const finalFee = Math.max(0, totalFeeNum - discountNum);

        const commissionPercentage = referrer.commissionRate || 10;
        const commissionAmount = finalFee > 0
          ? Math.round(finalFee * commissionPercentage / 100)
          : 500; // Default ₹500 if no fee specified

        await prisma.commission.create({
          data: {
            studentId: student.id,
            userId: referredById,
            amount: commissionAmount,
            percentage: commissionPercentage,
            status: "PENDING",
            notes: `Commission (${commissionPercentage}%) for referral: ${data.firstName} ${data.lastName}`,
          }
        });
      }
    }

    // Auto-create fee record if course fee provided
    if (data.courseId && data.totalFee) {
      const totalFeeNum = parseFloat(String(data.totalFee));
      const discountNum = parseFloat(String(data.discount)) || 0;
      const finalFee = Math.max(0, totalFeeNum - discountNum);
      
      await prisma.fee.create({
        data: {
          studentId: student.id,
          totalFee: totalFeeNum,
          discount: discountNum,
          finalFee,
          paidAmount: 0,
          dueAmount: finalFee,
        },
      });
    }

    // Mark inquiry as converted if linked
    if (data.inquiryId) {
      await prisma.inquiry.update({
        where: { id: data.inquiryId },
        data: { status: "CONVERTED" },
      });
    }

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Student POST error:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
