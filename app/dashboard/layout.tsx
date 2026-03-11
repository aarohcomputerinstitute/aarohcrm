import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="main-content flex-1">
        <Header userName={session.name} userRole={session.role} />
        <main className="content-area animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
