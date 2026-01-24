import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(
  { verifyJWT: false },
  async (_req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response("Missing env vars", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Tüm kullanıcıları al
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error || !data) {
      return new Response(
        error?.message ?? "Failed to list users",
        { status: 500 }
      );
    }

    const now = Date.now();
    let deletedCount = 0;

    for (const user of data.users) {
      if (
        !user.email_confirmed_at &&
        user.created_at &&
        now - new Date(user.created_at).getTime() > 30 * 60 * 1000
      ) {
        // önce public.users
        await supabase.from("users").delete().eq("id", user.id);

        // sonra auth.users
        await supabase.auth.admin.deleteUser(user.id);

        deletedCount++;
      }
    }

    return new Response(
      `OK - deleted ${deletedCount} users`,
      { status: 200 }
    );
  }
);
