import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OTPSendRequest {
  phone: string;
  pesantren_claim_id?: string;
}

// Indonesian phone number validation
const PHONE_REGEX = /^(\+?62|0)\d{9,13}$/;

// Max OTP requests per phone per hour
const MAX_OTP_PER_HOUR = 3;

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication Check ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;

    // --- Input Validation ---
    let body: OTPSendRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { phone, pesantren_claim_id } = body;

    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ error: "Nomor telepon diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate phone format (Indonesian numbers)
    const cleanPhone = phone.trim();
    if (!PHONE_REGEX.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: "Format nomor telepon tidak valid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate pesantren_claim_id format if provided
    if (pesantren_claim_id && typeof pesantren_claim_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid claim ID format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- Rate Limiting ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("otp_verifications")
      .select("*", { count: "exact", head: true })
      .eq("user_phone", cleanPhone)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Rate limit check error:", countError.message);
      return new Response(
        JSON.stringify({ error: "Terjadi kesalahan server" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if ((count ?? 0) >= MAX_OTP_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: "Terlalu banyak permintaan OTP. Coba lagi dalam 1 jam." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate any existing unused OTPs for this phone
    await supabase
      .from("otp_verifications")
      .update({ is_verified: true })
      .eq("user_phone", cleanPhone)
      .eq("is_verified", false);

    // Insert new OTP
    const { data: otpData, error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        user_phone: cleanPhone,
        otp_code: otpCode,
        pesantren_claim_id: pesantren_claim_id || null,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting OTP:", insertError.message);
      return new Response(
        JSON.stringify({ error: "Gagal membuat kode OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log only that OTP was generated (no sensitive data)
    console.log(`OTP generated for user ${userId}, phone ending ...${cleanPhone.slice(-4)}`);

    // TODO: Integrate with WhatsApp API here
    // await sendWhatsAppOTP(cleanPhone, otpCode);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Kode OTP telah dikirim ke nomor WhatsApp yang terdaftar",
        otp_id: otpData.id,
        expires_at: expiresAt,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in otp-send function:", error.message);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan server" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
