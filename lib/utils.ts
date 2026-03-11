import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export function generateReceiptNumber(): string {
  const prefix = "RCP";
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
}

export function generateCertificateNumber(): string {
  const prefix = "AAROH";
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}/${year}/${random}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    FOLLOWUP: "bg-yellow-100 text-yellow-700",
    CONVERTED: "bg-green-100 text-green-700",
    NOT_INTERESTED: "bg-red-100 text-red-700",
    ACTIVE: "bg-green-100 text-green-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    LEAVE: "bg-orange-100 text-orange-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}
