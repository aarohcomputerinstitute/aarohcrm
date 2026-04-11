"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  ClipboardCheck,
  Award,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inquiries",
    href: "/dashboard/inquiries",
    icon: UserPlus,
  },
  {
    label: "Admissions",
    href: "/dashboard/admissions",
    icon: GraduationCap,
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    label: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    label: "Batches",
    href: "/dashboard/batches",
    icon: Calendar,
  },
  {
    label: "Fees",
    href: "/dashboard/fees",
    icon: CreditCard,
  },
  {
    label: "Commissions",
    href: "/dashboard/commissions",
    icon: CreditCard,
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Certificates",
    href: "/dashboard/certificates",
    icon: Award,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    label: "Staff Members",
    href: "/dashboard/settings/users",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Partner Dashboard",
    href: "/dashboard/emitra",
    icon: LayoutDashboard,
  },
  {
    label: "New Admission Lead",
    href: "/dashboard/emitra/admissions/new",
    icon: UserPlus,
  },
  {
    label: "My Commissions",
    href: "/dashboard/emitra/commissions",
    icon: CreditCard,
  },
];

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    // Trainer can only see Dashboard and Attendance
    if (userRole === "TRAINER") {
      return ["/dashboard", "/dashboard/attendance"].includes(item.href);
    }
    // Only Admin can see Staff Members and Settings
    if (["/dashboard/settings/users", "/dashboard/settings"].includes(item.href)) {
      return userRole === "ADMIN";
    }
    // Only Admin and Accountant can see Fees, Reports and Commissions
    if (["/dashboard/fees", "/dashboard/reports", "/dashboard/commissions"].includes(item.href)) {
      return userRole === "ADMIN" || userRole === "ACCOUNTANT";
    }
    // Partner can only see Partner specific links
    if (userRole === "EMITRA") {
      return item.href.startsWith("/dashboard/emitra");
    }
    // Filter out Partner links for other roles
    if (item.href.startsWith("/dashboard/emitra")) {
      return false;
    }
    return true; // Everyone else can see the rest
  });

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">
              Aaroh Tech & AI
            </p>
            <p className="text-primary-400 text-xs">CRM System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="space-y-0.5">
          {filteredNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "sidebar-link",
                    isActive && "active"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Version */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <p className="text-xs text-sidebar-text/40 text-center">
          v1.0.0 · Aaroh CRM
        </p>
      </div>
    </aside>
  );
}
