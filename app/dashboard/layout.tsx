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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar userEmail={user.email || ""} userName={displayName} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:ml-64 pb-20 md:pb-0">
        <div className="p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}