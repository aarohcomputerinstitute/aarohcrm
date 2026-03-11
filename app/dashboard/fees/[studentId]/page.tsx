"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Receipt, PlusCircle, User, Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate, generateReceiptNumber } from "@/lib/utils";

export default function StudentFeeManagePage({ params }: { params: { studentId: string } }) {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [paymentModal, setPaymentModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMode: "CASH",
    paymentDate: new Date().toISOString().split('T')[0],
    notes: "",
    nextDueDate: "",
  });

  const fetchStudentData = async () => {
    try {
      const res = await fetch(`/api/students/${params.studentId}`);
      setStudent(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.studentId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/fees/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: params.studentId,
          ...paymentData,
        }),
      });

      if (res.ok) {
        setPaymentModal(false);
        setPaymentData({
          amount: "",
          paymentMode: "CASH",
          paymentDate: new Date().toISOString().split('T')[0],
          notes: "",
          nextDueDate: "",
        });
        fetchStudentData(); // Refresh UI
      } else {
        alert("Payment failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="spinner text-primary-600 w-10 h-10" /></div>;
  }

  if (!student || !student.fee) {
    return <div className="text-center py-20 text-gray-500">Student or fee record not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/fees" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Fees</h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              {student.firstName} {student.lastName} — {student.course?.name || "No Course"}
            </p>
          </div>
        </div>

        {student.fee.dueAmount > 0 && (
          <button onClick={() => setPaymentModal(true)} className="btn-primary">
            <PlusCircle className="w-4 h-4" /> Collect Payment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="col-span-1 md:col-span-3 card bg-gradient-to-r from-primary-900 to-primary-800 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M45.7,-76.4C58.9,-69.1,69.5,-55.8,77.5,-41.4C85.5,-27,90.9,-11.5,88.7,3.3C86.5,18.1,76.6,32.2,65.7,44.2C54.8,56.2,42.8,66,28.8,72.7C14.7,79.4,-1.4,82.9,-16.9,80.1C-32.4,77.2,-47.3,67.9,-59.7,55.8C-72,43.6,-81.8,28.5,-85.4,12.2C-89.1,-4.2,-86.6,-21.8,-78.3,-36.8C-70.1,-51.8,-56.1,-64.1,-41.2,-70.7C-26.4,-77.3,-10.6,-78.2,3.3,-83.1C17.3,-88,32.5,-83.8,45.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="p-8 relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="w-full sm:w-auto">
              <p className="text-primary-200 text-sm font-medium mb-1 uppercase tracking-wider">Total Course Fee</p>
              <h2 className="text-4xl font-bold font-mono">{formatCurrency(student.fee.finalFee)}</h2>
            </div>
            
            <div className="flex bg-white/10 rounded-2xl border border-white/20 p-2 w-full sm:w-auto">
              <div className="px-6 py-2 text-center border-r border-white/20">
                <p className="text-primary-200 text-xs font-medium mb-1">Paid Amount</p>
                <p className="text-xl font-bold text-green-400 font-mono">{formatCurrency(student.fee.paidAmount)}</p>
              </div>
              <div className="px-6 py-2 text-center border-r border-white/20">
                <p className="text-primary-200 text-xs font-medium mb-1">Pending Due</p>
                <p className="text-xl font-bold text-red-400 font-mono">{formatCurrency(student.fee.dueAmount)}</p>
              </div>
              <div className="px-6 py-2 text-center">
                <p className="text-primary-200 text-xs font-medium mb-1">Next Due Date</p>
                <p className={`text-xl font-bold font-mono ${student.fee.nextDueDate && new Date(student.fee.nextDueDate) < new Date() ? 'text-red-500 animate-pulse' : 'text-primary-200'}`}>
                  {student.fee.nextDueDate ? formatDate(student.fee.nextDueDate) : "Not Set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="col-span-1 md:col-span-3 card">
          <div className="card-header border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-500" /> Installment & Payment History
            </h2>
            {student.fee.dueAmount === 0 && (
               <span className="badge bg-green-100 text-green-700 px-3 py-1 flex items-center gap-1">
                 <CheckCircle2 className="w-3.5 h-3.5" /> All Dues Cleared
               </span>
            )}
          </div>
          
          <div className="card-body p-0">
            {student.fee.transactions?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {student.fee.transactions.map((tx: any) => (
                  <div key={tx.id} className="p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50/50 transition-colors gap-4">
                    <div className="flex gap-4 items-center w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{formatCurrency(tx.amount)}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">{tx.paymentMode}</span>
                          <span className="text-xs text-gray-500">{formatDate(tx.paymentDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400 font-medium">Receipt No.</p>
                        <p className="text-sm font-mono font-medium text-gray-900">{tx.receiptNumber}</p>
                      </div>
                      <Link 
                        href={`/dashboard/fees/receipt/${tx.id}`} 
                        className="btn-secondary py-1.5 px-3 shadow-sm hover:shadow text-xs"
                      >
                        Print Receipt
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No payments recorded yet. 
                {student.fee.dueAmount > 0 && <p className="mt-2 text-sm">Click "Collect Payment" to record the first installment.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Record Fee Payment</h2>
              <button onClick={() => setPaymentModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handlePayment} className="p-6 space-y-4 overflow-y-auto w-full">
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-2">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Pending Amount</p>
                <p className="text-2xl font-mono font-bold text-blue-900">{formatCurrency(student.fee.dueAmount)}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Paying Amount (₹) *</label>
                <input 
                  required 
                  type="number" 
                  max={student.fee.dueAmount}
                  value={paymentData.amount} 
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})} 
                  className="form-input text-lg font-semibold font-mono h-12" 
                  placeholder="0" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select required value={paymentData.paymentMode} onChange={e => setPaymentData({...paymentData, paymentMode: e.target.value})} className="form-select">
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input required type="date" value={paymentData.paymentDate} onChange={e => setPaymentData({...paymentData, paymentDate: e.target.value})} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes/Transaction ID (Optional)</label>
                <input type="text" value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} className="form-input" placeholder="UPI Reference or Cheque number..." />
              </div>

              <div className="form-group">
                <label className="form-label text-red-600 font-bold">Next Installment Due Date</label>
                <input 
                  type="date" 
                  value={paymentData.nextDueDate} 
                  onChange={e => setPaymentData({...paymentData, nextDueDate: e.target.value})} 
                  className="form-input border-red-200 focus:ring-red-500" 
                />
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight font-medium">Setting this will trigger alerts when payment is overdue</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setPaymentModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={submitLoading || Number(paymentData.amount) <= 0 || Number(paymentData.amount) > student.fee.dueAmount} className="btn-primary">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
