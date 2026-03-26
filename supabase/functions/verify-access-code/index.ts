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
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Phone and code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify access code
    const { data: accessCode, error: codeError } = await supabase
      .from("household_access_codes")
      .select("*, households(name, section)")
      .eq("phone", phone)
      .eq("access_code", code)
      .eq("is_active", true)
      .single();

    if (codeError || !accessCode) {
      return new Response(JSON.stringify({ error: "Invalid phone number or access code" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update last_used_at
    await supabase
      .from("household_access_codes")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", accessCode.id);

    // Create or get a special user for this household head
    const email = `hh-${accessCode.household_id}@tshivhilwi.local`;
    
    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.admin.getUserByEmail(email);
    
    let userId: string;
    
    if (signInError || !signInData?.user) {
      // Create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: `hh-${accessCode.household_id}-${code}`,
        email_confirm: true,
        user_metadata: {
          full_name: `Household: ${(accessCode as any).households?.name || 'Member'}`,
          household_id: accessCode.household_id,
          is_household_head: true,
        },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    } else {
      userId = signInData.user.id;
      // Update password in case code changed
      await supabase.auth.admin.updateUserById(userId, {
        password: `hh-${accessCode.household_id}-${code}`,
      });
    }

    // Sign in the user by generating a session
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    // Use signInWithPassword instead for reliable session
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!);
    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email,
      password: `hh-${accessCode.household_id}-${code}`,
    });

    if (loginError) throw loginError;

    return new Response(JSON.stringify({
      session: loginData.session,
      household_id: accessCode.household_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
