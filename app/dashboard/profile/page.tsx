import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Server Action to update the profile
async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard", "layout"); // Refreshes the Sidebar name
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p className="mt-2 text-slate-600">Manage your account details and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={updateProfile} className="p-8 space-y-6">

          {/* Uneditable Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              disabled
              defaultValue={profile?.email || user.email}
              className="mt-2 block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 sm:text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">Your email cannot be changed here.</p>
          </div>

          {/* Editable Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={profile?.full_name || ""}
              placeholder="e.g. John Doe"
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          {/* Editable Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number (Optional)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone || ""}
              placeholder="+1 (555) 000-0000"
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}