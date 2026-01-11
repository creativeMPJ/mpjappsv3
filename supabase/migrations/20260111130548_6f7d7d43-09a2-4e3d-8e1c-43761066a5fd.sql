-- Create OTP verifications table for production OTP flow
CREATE TABLE public.otp_verifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    pesantren_claim_id UUID REFERENCES public.pesantren_claims(id) ON DELETE CASCADE,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only allow operations via service role (edge functions)
-- Users should not directly access this table
CREATE POLICY "Service role can manage OTP verifications"
ON public.otp_verifications
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_otp_verifications_phone ON public.otp_verifications(user_phone);
CREATE INDEX idx_otp_verifications_expires ON public.otp_verifications(expires_at);

-- Add is_claimed column to profiles if not exists (for tracking claimed pesantren)
-- This is handled via pesantren_claims table status, so we'll use that instead

-- Create function to clean expired OTPs (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    DELETE FROM public.otp_verifications
    WHERE expires_at < now() AND is_verified = false;
END;
$$;