"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  userName: string;
  userRole: string;
}

export default function Header({ userName, userRole }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrator",
    COUNSELOR: "Counselor",
    ACCOUNTANT: "Accountant",
    TRAINER: "Trainer",
  };

  const roleColor: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    COUNSELOR: "bg-blue-100 text-blue-700",
    ACCOUNTANT: "bg-green-100 text-green-700",
    TRAINER: "bg-orange-100 text-orange-700",
  };

  return (
    <header className="main-header">
      <div className="flex-1">
        <p className="text-sm text-gray-400">
          Welcome back, <span className="text-gray-900 font-semibold">{userName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(userName)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {userName}
              </p>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  roleColor[userRole] || "bg-gray-100 text-gray-700"
                }`}
              >
                {roleLabel[userRole] || userRole}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{roleLabel[userRole]}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
