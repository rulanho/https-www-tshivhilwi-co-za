import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stand_number, id_number } = await req.json();

    if (!stand_number || !id_number) {
      return new Response(
        JSON.stringify({ error: "Stand number and ID number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find household by stand number
    const { data: household, error: hhError } = await supabase
      .from("households")
      .select("id, name, contact_person, section, stand_number")
      .ilike("stand_number", stand_number.trim())
      .single();

    if (hhError || !household) {
      return new Response(
        JSON.stringify({ error: "No household found with that stand number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find member by ID number in that household
    const { data: member, error: memError } = await supabase
      .from("members")
      .select("id, full_name, id_number, email")
      .eq("household_id", household.id)
      .eq("id_number", id_number.trim())
      .single();

    if (memError || !member) {
      return new Response(
        JSON.stringify({ error: "No member found with that ID number in this household" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create or find shadow auth user for this household member
    const shadowEmail = `hh-${household.stand_number?.replace(/\s+/g, '-').toLowerCase()}@tshivhilwi.local`;
    const shadowPassword = `hh-${id_number}-${household.id.slice(0, 8)}`;

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.admin.listUsers();
    const existingUser = signInData?.users?.find(u => u.email === shadowEmail);

    let userId: string;

    if (existingUser) {
      // Update password in case ID changed
      await supabase.auth.admin.updateUser(existingUser.id, { password: shadowPassword });
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: shadowEmail,
        password: shadowPassword,
        email_confirm: true,
        user_metadata: { full_name: member.full_name, is_household_login: true },
      });
      if (createError || !newUser.user) {
        return new Response(
          JSON.stringify({ error: "Failed to create login session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = newUser.user.id;
    }

    // Ensure household_head role
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: "household_head" },
      { onConflict: "user_id,role" }
    );

    // Link household to user
    await supabase.from("households").update({ head_user_id: userId }).eq("id", household.id);

    // Update profile
    await supabase.from("profiles").upsert(
      { user_id: userId, full_name: member.full_name },
      { onConflict: "user_id" }
    );

    // Generate session token
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: session, error: sessionError } = await anonClient.auth.signInWithPassword({
      email: shadowEmail,
      password: shadowPassword,
    });

    if (sessionError || !session.session) {
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        session: session.session,
        household_id: household.id,
        household_name: household.name,
        member_name: member.full_name,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
