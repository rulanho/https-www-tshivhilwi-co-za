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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const trimmed = stand_number.trim();

    // Find household by stand number (fuzzy match)
    const { data: households, error: hhError } = await adminClient
      .from("households")
      .select("id, name, contact_person, section, stand_number")
      .ilike("stand_number", `%${trimmed}%`);

    if (hhError || !households || households.length === 0) {
      return new Response(
        JSON.stringify({ error: "No household found with that stand number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const household = households.length === 1
      ? households[0]
      : households.find(h => h.stand_number?.trim().toLowerCase() === trimmed.toLowerCase()) || households[0];

    // Find member by ID number
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

    // Deterministic shadow credentials
    const shadowEmail = `hh-${household.stand_number?.replace(/[^a-z0-9]/gi, '-').toLowerCase()}@tshivhilwi.local`;
    const shadowPassword = `hh-${household.id.slice(0, 8)}-${id_number.trim().slice(0, 6)}`;

    // Try sign in first with anon client
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: signInResult, error: signInError } = await anonClient.auth.signInWithPassword({
      email: shadowEmail,
      password: shadowPassword,
    });

    if (signInResult?.session) {
      // Update profile and links
      await adminClient.from("households").update({ head_user_id: signInResult.user.id }).eq("id", household.id);
      
      return new Response(
        JSON.stringify({
          session: signInResult.session,
          household_id: household.id,
          household_name: household.name,
          member_name: member.full_name,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User doesn't exist or password mismatch - use admin API via REST
    // Create user via REST API
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
        "apikey": serviceRoleKey,
      },
      body: JSON.stringify({
        email: shadowEmail,
        password: shadowPassword,
        email_confirm: true,
        user_metadata: { full_name: member.full_name, is_household_login: true },
      }),
    });

    const createBody = await createRes.json();

    if (!createRes.ok) {
      // If user already exists (email taken), try to update password via REST
      if (createBody?.msg?.includes("already been registered") || createBody?.code === "email_exists") {
        // List users to find existing one
        const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(shadowEmail)}`, {
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
          },
        });
        const listBody = await listRes.json();
        const existingUser = listBody?.users?.find((u: any) => u.email === shadowEmail);

        if (existingUser) {
          // Update password via REST
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${existingUser.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceRoleKey}`,
              "apikey": serviceRoleKey,
            },
            body: JSON.stringify({ password: shadowPassword }),
          });

          // Now sign in
          const { data: retrySignIn, error: retryErr } = await anonClient.auth.signInWithPassword({
            email: shadowEmail,
            password: shadowPassword,
          });

          if (retryErr || !retrySignIn?.session) {
            return new Response(
              JSON.stringify({ error: "Failed to create session. Please try again." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          await adminClient.from("user_roles").upsert(
            { user_id: retrySignIn.user.id, role: "household_head" },
            { onConflict: "user_id,role" }
          );
          await adminClient.from("households").update({ head_user_id: retrySignIn.user.id }).eq("id", household.id);

          return new Response(
            JSON.stringify({
              session: retrySignIn.session,
              household_id: household.id,
              household_name: household.name,
              member_name: member.full_name,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Failed to create login. Please contact admin." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = createBody.id;

    // Set role and link household
    await adminClient.from("user_roles").upsert(
      { user_id: userId, role: "household_head" },
      { onConflict: "user_id,role" }
    );
    await adminClient.from("households").update({ head_user_id: userId }).eq("id", household.id);
    await adminClient.from("profiles").upsert(
      { user_id: userId, full_name: member.full_name },
      { onConflict: "user_id" }
    );

    // Sign in
    const { data: newSession, error: newSessionErr } = await anonClient.auth.signInWithPassword({
      email: shadowEmail,
      password: shadowPassword,
    });

    if (newSessionErr || !newSession?.session) {
      return new Response(
        JSON.stringify({ error: "Account created but login failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        session: newSession.session,
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
