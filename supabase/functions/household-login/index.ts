import { createClient } from "npm:@supabase/supabase-js@2";

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
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Normalize stand number - trim and try multiple patterns
    const trimmed = stand_number.trim();
    
    // Try exact match first, then partial/ilike
    let household: any = null;
    let hhError: any = null;

    // Try ilike with the raw input
    const result = await adminClient
      .from("households")
      .select("id, name, contact_person, section, stand_number")
      .ilike("stand_number", `%${trimmed}%`);

    if (result.error || !result.data || result.data.length === 0) {
      return new Response(
        JSON.stringify({ error: "No household found with that stand number. Please check your stand number and try again." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If multiple matches, try exact match
    household = result.data.length === 1 
      ? result.data[0] 
      : result.data.find((h: any) => 
          h.stand_number?.trim().toLowerCase() === trimmed.toLowerCase()
        ) || result.data[0];

    // Find member by ID number in that household
    const { data: member, error: memError } = await adminClient
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

    // Check if user already exists
    const { data: listData } = await adminClient.auth.admin.listUsers();
    const existingUser = listData?.users?.find((u: any) => u.email === shadowEmail);

    let userId: string;

    if (existingUser) {
      await adminClient.auth.admin.updateUser(existingUser.id, { password: shadowPassword });
      userId = existingUser.id;
    } else {
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
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
    await adminClient.from("user_roles").upsert(
      { user_id: userId, role: "household_head" },
      { onConflict: "user_id,role" }
    );

    // Link household to user
    await adminClient.from("households").update({ head_user_id: userId }).eq("id", household.id);

    // Update profile
    await adminClient.from("profiles").upsert(
      { user_id: userId, full_name: member.full_name },
      { onConflict: "user_id" }
    );

    // Generate session token using anon client
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
