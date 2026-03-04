import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch the extended profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || "User";

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-900">
      {/* Sidebar Component handles both Desktop Sidebar & Mobile Navbars */}
      <Sidebar userEmail={user.email || ""} userName={displayName} />

      {/* Main Content Area */}
      {/* Added pt-20 for mobile top header and pb-24 for mobile bottom nav */}
      <main className="flex-1 overflow-y-auto md:ml-64 pt-20 pb-24 md:pt-0 md:pb-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}