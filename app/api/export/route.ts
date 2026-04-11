import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { formatDate } from "@/lib/utils";

// Simple CSV builder
function jsonToCsv(items: Record<string, unknown>[], headers: string[]): string {
  if (!items || !items.length) return headers.join(",") + "\n";
  
  const csvRows = [headers.join(",")];
  
  for (const item of items) {
    const values = headers.map(header => {
      let val = item[header];
      if (val === null || val === undefined) val = "";
      
      // Escape strings containing quotes or commas
      let strVal = String(val);
      if (strVal.includes(",") || strVal.includes('"') || strVal.includes("\n")) {
        strVal = `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}

export async function GET(request: NextRequest) {
  // Only admins can export data
  const { error: authError } = requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "students") {
      const students = await prisma.student.findMany({
        include: { course: true, batch: true },
        orderBy: { createdAt: "desc" }
      });

      const formattedData = students.map(s => ({
        Student_ID: s.studentId,
        First_Name: s.firstName,
        Last_Name: s.lastName,
        Email: s.email || "",
        Mobile: s.mobile,
        WhatsApp: s.whatsapp || "",
        Date_of_Birth: s.dob ? formatDate(s.dob) : "",
        Father_Name: s.fatherName || "",
        City: s.city || "",
        Course: s.course?.name || "",
        Batch: s.batch?.batchName || "",
        Admission_Date: s.admissionDate ? formatDate(s.admissionDate) : "",
        Active: s.isActive ? "Yes" : "No",
      }));

      const headers = ["Student_ID", "First_Name", "Last_Name", "Email", "Mobile", "WhatsApp", "Date_of_Birth", "Father_Name", "City", "Course", "Batch", "Admission_Date", "Active"];
      const csv = jsonToCsv(formattedData, headers);

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="students_backup_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (type === "fees") {
      const fees = await prisma.fee.findMany({
        include: { student: { include: { course: true } } },
        orderBy: { createdAt: "desc" }
      });

      const formattedData = fees.map(f => ({
        Student_ID: f.student.studentId,
        Student_Name: `${f.student.firstName} ${f.student.lastName}`,
        Course: f.student.course?.name || "",
        Total_Fee: f.finalFee,
        Paid_Amount: f.paidAmount,
        Due_Balance: f.dueAmount,
        Next_Due_Date: f.nextDueDate ? formatDate(f.nextDueDate) : "",
      }));

      const headers = ["Student_ID", "Student_Name", "Course", "Total_Fee", "Paid_Amount", "Due_Balance", "Next_Due_Date"];
      const csv = jsonToCsv(formattedData, headers);

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="fees_backup_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (type === "commissions") {
      const commissions = await prisma.commission.findMany({
        include: {
          student: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" }
      });

      const formattedData = commissions.map(c => ({
        Center_Name: c.user.name,
        Center_Email: c.user.email,
        Student_Name: `${c.student.firstName} ${c.student.lastName}`,
        Commission_Amount: c.amount,
        Percentage: c.percentage,
        Status: c.status,
        Paid_At: c.paidAt ? formatDate(c.paidAt) : "",
        Created_At: formatDate(c.createdAt),
      }));

      const headers = ["Center_Name", "Center_Email", "Student_Name", "Commission_Amount", "Percentage", "Status", "Paid_At", "Created_At"];
      const csv = jsonToCsv(formattedData, headers);

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="commissions_backup_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return new NextResponse("Invalid export type. Supported: students, fees, commissions", { status: 400 });

  } catch (error) {
    console.error("Export API Error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
