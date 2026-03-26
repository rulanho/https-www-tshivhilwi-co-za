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
    const { household_id, amount, payment_month, type } = await req.json();

    if (!household_id) {
      return new Response(JSON.stringify({ error: "household_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get household phone
    const { data: household } = await supabase
      .from("households")
      .select("name, phone")
      .eq("id", household_id)
      .single();

    if (!household?.phone) {
      return new Response(
        JSON.stringify({ success: false, message: "No phone number for this household" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !TWILIO_FROM_NUMBER) {
      return new Response(
        JSON.stringify({ success: false, message: "SMS not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let e164Phone = household.phone.replace(/\s+/g, "");
    if (e164Phone.startsWith("0")) {
      e164Phone = "+27" + e164Phone.substring(1);
    } else if (!e164Phone.startsWith("+")) {
      e164Phone = "+27" + e164Phone;
    }

    const messageType = type === "payout" ? "payout" : "payment";
    const body =
      messageType === "payout"
        ? `Tshivhilwi Burial Society: A payout of R${amount} has been processed for household ${household.name}.`
        : `Tshivhilwi Burial Society: A payment of R${amount} for ${payment_month} has been recorded for household ${household.name}. Thank you.`;

    const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
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
        Body: body,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Twilio error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageSid: data.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
