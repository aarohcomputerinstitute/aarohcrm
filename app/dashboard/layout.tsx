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
      <div className="no-print">
        <Sidebar userRole={session.role} />
      </div>
      <div className="main-content flex-1 print:m-0 print:p-0 print:bg-white print:w-full">
        <div className="no-print">
          <Header userName={session.name} userRole={session.role} />
        </div>
        <main className="content-area animate-fade-in print:p-0 print:m-0">{children}</main>
      </div>
    </div>
  );
}
