"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, Loader2, Mail, Phone, MapPin, Globe } from "lucide-react";

interface ReceiptContentProps {
  data: any;
  type: "STUDENT COPY" | "OFFICE COPY";
}

function ReceiptContent({ data, type }: ReceiptContentProps) {
  const { fee, ...transaction } = data;
  const student = fee.student;

  return (
    <div className="bg-white p-8 relative overflow-hidden flex flex-col h-[140mm] border-b-2 border-dashed border-gray-200 last:border-0 print:h-[135mm] print:border-gray-400">
      {/* Watermark/Copy Type Label */}
      <div className="absolute top-4 right-8 px-3 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-400 tracking-widest border border-gray-200 print:bg-white print:border-gray-400">
        {type}
      </div>

      {/* Header Section */}
      <div className="flex justify-between items-start border-b-2 border-primary-600 pb-6 mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-primary-600 uppercase">AAROH</h1>
          <p className="text-[10px] text-gray-500 font-bold leading-tight uppercase tracking-wider">
            Advanced Academy of Research & Higher Studies
          </p>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">FEE RECEIPT</h2>
          <div className="text-[10px] font-bold text-gray-600 space-y-0.5">
            <p>Receipt No: <span className="text-gray-900 font-mono">{transaction.receiptNumber}</span></p>
            <p>Date: <span className="text-gray-900">{formatDate(transaction.paymentDate)}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Student Info */}
        <div className="space-y-3">
          <h3 className="text-[9px] font-black text-primary-600 uppercase tracking-widest border-b border-primary-100 pb-1">Student Details</h3>
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-gray-900 uppercase">{student.firstName} {student.lastName}</p>
            <p className="text-[10px] text-gray-600 font-medium">Student ID: <span className="text-gray-900 font-bold">{student.studentId}</span></p>
            <p className="text-[10px] text-gray-600 font-medium">Course: <span className="text-primary-700 font-bold">{student.course?.name}</span></p>
            <p className="text-[10px] text-gray-600 font-medium">Batch: <span className="font-bold">{student.batch?.batchName || "N/A"}</span></p>
          </div>
        </div>

        {/* Institute Info */}
        <div className="space-y-3">
          <h3 className="text-[9px] font-black text-primary-600 uppercase tracking-widest border-b border-primary-100 pb-1">Institute Contact</h3>
          <div className="space-y-0.5 text-[9px] text-gray-600 font-medium">
            <p className="flex items-center gap-1.5"><MapPin className="w-2.5 h-2.5 text-primary-500" /> B-Block, Metro Plaza, Ground Floor</p>
            <p className="flex items-center gap-1.5"><Phone className="w-2.5 h-2.5 text-primary-500" /> +91 9140-XXXXXX</p>
            <p className="flex items-center gap-1.5"><Mail className="w-2.5 h-2.5 text-primary-500" /> aarohcomputerinstitute@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-200">
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-[11px]">
              <td className="px-4 py-3">
                <p className="font-bold text-gray-900">Course Fee Payment</p>
                <p className="text-[9px] text-gray-500 font-medium capitalize">Mode: {transaction.paymentMode.toLowerCase()}</p>
              </td>
              <td className="px-4 py-3 text-right font-black text-gray-900 text-sm">
                {formatCurrency(transaction.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Details */}
      <div className="grid grid-cols-2 gap-8 items-start flex-grow">
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">In Words</p>
            <p className="text-[10px] font-bold text-gray-800 italic uppercase">Rupees {transaction.amount.toLocaleString('en-IN')} Only</p>
          </div>
          <div className="px-1">
             <p className="text-[8px] font-black text-red-500 uppercase mb-1">Term & Conditions</p>
             <ul className="text-[8px] text-gray-400 space-y-0.5 list-disc pl-3">
                <li>Fee once paid is non-refundable.</li>
                <li>Keep this receipt for certificate issuance.</li>
             </ul>
          </div>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-medium text-gray-600 py-1 border-b border-gray-100">
              <span>Total Course Fee</span>
              <span className="font-bold text-gray-900">{formatCurrency(fee.finalFee)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-medium text-gray-600 py-1 border-b border-gray-100">
              <span>Amount Paid</span>
              <span className="font-bold text-green-600">{formatCurrency(fee.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-black text-gray-900 pt-1">
              <span className="uppercase tracking-tighter">Due Balance</span>
              <span className="text-red-600 font-mono">{formatCurrency(fee.dueAmount)}</span>
            </div>
            {fee.nextDueDate && (
              <div className="mt-2 text-right">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Next Due: {formatDate(fee.nextDueDate)}</span>
              </div>
            )}
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
        <div className="text-center w-32 border-t border-dotted border-gray-300 pt-1">
          <p className="text-[8px] font-bold text-gray-500 uppercase">Student's Sign</p>
        </div>
        <div className="text-center w-32 border-t border-dotted border-gray-300 pt-1 relative">
          <p className="text-[8px] font-bold text-gray-900 uppercase">Authorized Sign</p>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 border-2 border-primary-500/10 rounded-full flex items-center justify-center opacity-10 rotate-12 rotate-12">
             <span className="text-[6px] font-black text-primary-500 text-center uppercase tracking-tighter">AAROH<br/>OFFICIAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/fees/receipt/${params.id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
        <p className="text-gray-500 font-medium tracking-tight whitespace-nowrap">Generating dual-copy receipt...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return <div className="p-8 text-center text-red-500 font-semibold uppercase tracking-widest">Error: {data?.error || "Receipt not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button 
            onClick={() => window.history.back()}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 uppercase tracking-wider"
          >
            &larr; Back
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print Receipt (A4)
          </button>
        </div>

        {/* Dual Receipt Container */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <ReceiptContent data={data} type="STUDENT COPY" />
          
          {/* Sissor Line */}
          <div className="relative h-2 print:h-4 bg-gray-50 print:bg-white flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
            <div className="absolute left-4 bg-white px-2 py-0.5 border border-gray-200 rounded text-[8px] font-bold text-gray-400 print:hidden uppercase">
              Cut here to separate
            </div>
          </div>

          <ReceiptContent data={data} type="OFFICE COPY" />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .mx-auto {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
          }
          @page {
            size: A4;
            margin: 0cm;
          }
          header, footer, nav, .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
