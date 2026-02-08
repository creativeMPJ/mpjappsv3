import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OTPVerifyRequest {
  phone: string;
  otp_code: string;
  otp_id?: string;
}

// Indonesian phone number validation
const PHONE_REGEX = /^(\+?62|0)\d{9,13}$/;

// OTP must be exactly 6 digits
const OTP_REGEX = /^\d{6}$/;

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
    let body: OTPVerifyRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { phone, otp_code, otp_id } = body;

    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ error: "Nomor telepon diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!otp_code || typeof otp_code !== "string") {
      return new Response(
        JSON.stringify({ error: "Kode OTP diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate phone format
    const cleanPhone = phone.trim();
    if (!PHONE_REGEX.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: "Format nomor telepon tidak valid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate OTP format (exactly 6 digits)
    if (!OTP_REGEX.test(otp_code)) {
      return new Response(
        JSON.stringify({ error: "Kode OTP harus 6 digit angka" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the OTP record
    let query = supabase
      .from("otp_verifications")
      .select("*")
      .eq("user_phone", cleanPhone)
      .eq("is_verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (otp_id && typeof otp_id === "string") {
      query = supabase
        .from("otp_verifications")
        .select("*")
        .eq("id", otp_id)
        .eq("is_verified", false)
        .gt("expires_at", new Date().toISOString());
    }

    const { data: otpRecords, error: fetchError } = await query;

    if (fetchError || !otpRecords || otpRecords.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Kode OTP tidak ditemukan atau sudah kadaluarsa",
          expired: true,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const otpRecord = otpRecords[0];

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      return new Response(
        JSON.stringify({
          error: "Terlalu banyak percobaan. Silakan minta kode OTP baru.",
          max_attempts: true,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify OTP code
    if (otpRecord.otp_code !== otp_code) {
      // Increment attempts
      await supabase
        .from("otp_verifications")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({
          error: "Kode OTP salah",
          attempts_remaining: 5 - (otpRecord.attempts + 1),
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // OTP is correct - mark as verified
    const { error: updateError } = await supabase
      .from("otp_verifications")
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("Error updating OTP:", updateError.message);
      return new Response(
        JSON.stringify({ error: "Gagal memverifikasi OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If there's an associated claim, update its status
    if (otpRecord.pesantren_claim_id) {
      await supabase
        .from("pesantren_claims")
        .update({
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", otpRecord.pesantren_claim_id);
    }

    console.log(`OTP verified for user ${userId}, phone ending ...${cleanPhone.slice(-4)}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verifikasi berhasil",
        pesantren_claim_id: otpRecord.pesantren_claim_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in otp-verify function:", error.message);
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
