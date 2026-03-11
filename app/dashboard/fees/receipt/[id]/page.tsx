"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, Loader2, Mail, Phone, MapPin, Globe } from "lucide-react";

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
        <p className="text-gray-500 font-medium tracking-tight">Generating professional receipt...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return <div className="p-8 text-center text-red-500 font-semibold">Error: {data?.error || "Receipt not found"}</div>;
  }

  const { fee, ...transaction } = data;
  const student = fee.student;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto">
        {/* Action Bar - Hidden during print */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button 
            onClick={() => window.history.back()}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            &larr; Back to Dashboard
          </button>
          <button 
            onClick={() => window.print()}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>

        {/* Professional Receipt Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 print:shadow-none print:border-none print:rounded-none">
          
          {/* Header Section */}
          <div className="bg-primary-600 px-10 py-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:bg-white print:text-black print:px-0 print:py-6 print:border-b-2 print:border-gray-800">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter uppercase">AAROH</h1>
              <p className="text-sm text-primary-100 print:text-gray-600 max-w-xs leading-relaxed font-medium">
                Advanced Academy of Research & Higher Studies
              </p>
            </div>
            <div className="text-left md:text-right space-y-2">
              <h2 className="text-2xl font-bold tracking-tight mb-2 opacity-90 print:opacity-100">FEE RECEIPT</h2>
              <div className="flex flex-col gap-1 text-sm font-medium opacity-80 print:opacity-100">
                <span className="flex items-center md:justify-end gap-2">
                   Receipt No: <span className="font-bold underline tracking-wider">{transaction.receiptNumber}</span>
                </span>
                <span className="flex items-center md:justify-end gap-2">
                   Date: <span className="font-bold">{formatDate(transaction.paymentDate)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-10 print:p-0 print:pt-8 print:pb-12">
            
            {/* Student Info & Institute Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Student Information</h3>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-900">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-600">ID: <span className="font-mono font-bold bg-gray-100 px-1 rounded">{student.studentId}</span></p>
                    <p className="text-sm text-gray-600 mt-2 font-medium">Course: <span className="text-primary-700">{student.course?.name}</span></p>
                    <p className="text-sm text-gray-600">Batch: <span>{student.batch?.batchName || "N/A"}</span></p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Institute Contact</h3>
                  <div className="space-y-2 text-sm text-gray-600 font-medium">
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary-500" /> Ground Floor, B-Block, Metro Plaza</p>
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary-500" /> +91 9999-XXXXXX</p>
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-primary-500" /> accounts@aaroh.edu.in</p>
                    <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-primary-500" /> www.aaroh.edu.in</p>
                  </div>
                </div>
            </div>

            {/* Payment Details Table */}
            <div className="mb-10 overflow-hidden rounded-xl border border-gray-100 print:rounded-none">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 print:bg-white print:border-b-2 print:border-gray-800">
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold text-gray-500 uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">Course Fee Payment</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">Payment Mode: {transaction.paymentMode}</p>
                      {transaction.notes && <p className="text-xs text-gray-400 mt-1 italic italic">Note: {transaction.notes}</p>}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-lg text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
              <div className="max-w-sm space-y-4">
                 <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 print:bg-white print:border-solid">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-tighter">Amount in words</p>
                    <p className="text-sm font-bold text-gray-900 italic">Rupees {transaction.amount.toLocaleString('en-IN')} Only</p>
                 </div>
                 <div className="p-4">
                    <p className="text-xs font-bold text-red-500 uppercase mb-2">Important Note</p>
                    <ul className="text-[10px] text-gray-500 list-disc pl-4 space-y-1 font-medium">
                      <li>Fee once paid is non-refundable and non-transferable.</li>
                      <li>Please keep this receipt safe for future reference.</li>
                      <li>Cheque payments are subject to realization.</li>
                    </ul>
                 </div>
              </div>

              <div className="w-full md:w-64 space-y-3">
                <div className="flex justify-between text-sm py-2 border-b border-gray-100 group">
                  <span className="text-gray-500 font-medium">Course Total</span>
                  <span className="font-bold text-gray-900">{formatCurrency(fee.finalFee)}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Total Paid</span>
                  <span className="font-bold text-green-600">{formatCurrency(fee.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-lg pt-3">
                  <span className="text-gray-900 font-black uppercase tracking-tighter">Balance Due</span>
                  <span className="font-black text-red-600 underline underline-offset-4 decoration-2">{formatCurrency(fee.dueAmount)}</span>
                </div>
                {fee.nextDueDate && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg text-center print:bg-white print:border print:border-red-200">
                    <p className="text-[10px] text-red-600 font-extrabold uppercase tracking-widest mb-1">Next Installment Due</p>
                    <p className="text-sm font-black text-red-700">{formatDate(fee.nextDueDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="flex justify-between items-end mt-20">
               <div className="text-center w-48 pt-4 border-t-2 border-dotted border-gray-300">
                 <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Student Signature</p>
               </div>
               <div className="text-right">
                  <div className="w-48 pt-4 border-t-2 border-dotted border-gray-300 text-center relative">
                    <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Authorized Signatory</p>
                    {/* Placeholder for stamp */}
                    <div className="absolute -top-16 right-0 w-24 h-24 border-4 border-primary-200/20 rounded-full flex items-center justify-center opacity-10 rotate-12 pointer-events-none print:opacity-5">
                       <span className="text-[8px] font-black text-primary-500 text-center uppercase tracking-tighter">AAROH ACADEMY<br/>OFFICIAL STAMP</span>
                    </div>
                  </div>
               </div>
            </div>

          </div>

          <div className="bg-gray-50 p-6 text-center print:bg-white print:pt-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              This is a computer generated receipt. No physical signature is required.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .mx-auto {
            max-width: 100% !important;
            margin: 0 !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          header, footer, nav, .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
