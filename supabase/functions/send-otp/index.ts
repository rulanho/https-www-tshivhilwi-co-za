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
    const { phone } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Normalize phone: strip spaces
    const normalizedPhone = phone.replace(/\s+/g, "");

    // Check if this phone exists in households
    const { data: household, error: hhError } = await supabase
      .from("households")
      .select("id, name, phone")
      .eq("phone", normalizedPhone)
      .eq("status", "active")
      .single();

    if (hhError || !household) {
      // Also check members phone_1 / phone_2
      const { data: member } = await supabase
        .from("members")
        .select("id, household_id, phone_1, phone_2")
        .or(`phone_1.eq.${normalizedPhone},phone_2.eq.${normalizedPhone}`)
        .eq("status", "active")
        .single();

      if (!member) {
        return new Response(
          JSON.stringify({ error: "Phone number not registered in any household. Contact your community leader." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use member's household
      return await generateAndSendCode(supabase, member.household_id, normalizedPhone);
    }

    return await generateAndSendCode(supabase, household.id, normalizedPhone);
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateAndSendCode(
  supabase: any,
  householdId: string,
  phone: string
) {
  // Generate a 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));

  // Upsert into household_access_codes (deactivate old, create new)
  await supabase
    .from("household_access_codes")
    .update({ is_active: false })
    .eq("phone", phone);

  const { error: insertError } = await supabase
    .from("household_access_codes")
    .insert({
      household_id: householdId,
      phone,
      access_code: code,
      is_active: true,
    });

  if (insertError) {
    return new Response(JSON.stringify({ error: "Failed to generate code" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }

  // Try to send SMS via Twilio if configured
  let smsSent = false;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

  if (LOVABLE_API_KEY && TWILIO_API_KEY && TWILIO_FROM_NUMBER) {
    try {
      const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
      // Format phone for E.164 (South African numbers)
      let e164Phone = phone;
      if (phone.startsWith("0")) {
        e164Phone = "+27" + phone.substring(1);
      } else if (!phone.startsWith("+")) {
        e164Phone = "+27" + phone;
      }

      const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: e164Phone,
          From: TWILIO_FROM_NUMBER,
          Body: `Your Tshivhilwi Village login code is: ${code}. This code expires in 10 minutes.`,
        }),
      });

      if (response.ok) {
        smsSent = true;
      } else {
        console.error("Twilio SMS failed:", await response.text());
      }
    } catch (e) {
      console.error("SMS send error:", e);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      smsSent,
      // Only return code if SMS was NOT sent (for testing/display)
      ...(smsSent ? {} : { code }),
      message: smsSent
        ? "A verification code has been sent to your phone."
        : "Your verification code has been generated. Please check with your community leader if you don't receive it.",
    }),
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    }
  );
}
