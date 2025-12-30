-- Create enum for registration type
CREATE TYPE public.registration_type AS ENUM ('klaim', 'pesantren_baru');

-- Add jenis_pengajuan column to pesantren_claims
ALTER TABLE public.pesantren_claims 
ADD COLUMN jenis_pengajuan public.registration_type NOT NULL DEFAULT 'pesantren_baru';

-- Create enum for payment verification status
CREATE TYPE public.payment_verification_status AS ENUM ('pending_payment', 'pending_verification', 'verified', 'rejected');

-- Create system_settings table for dynamic pricing
CREATE TABLE public.system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (for pricing display)
CREATE POLICY "Anyone can read settings"
ON public.system_settings FOR SELECT
USING (true);

-- Only admin_pusat can manage settings
CREATE POLICY "Admin pusat can manage settings"
ON public.system_settings FOR ALL
USING (has_role(auth.uid(), 'admin_pusat'))
WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

-- Create payments table
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pesantren_claim_id uuid NOT NULL REFERENCES public.pesantren_claims(id) ON DELETE CASCADE,
    base_amount integer NOT NULL,
    unique_code integer NOT NULL CHECK (unique_code >= 100 AND unique_code <= 999),
    total_amount integer NOT NULL,
    proof_file_url text,
    status public.payment_verification_status NOT NULL DEFAULT 'pending_payment',
    rejection_reason text,
    verified_by uuid REFERENCES auth.users(id),
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, pesantren_claim_id)
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view own payments
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own payment
CREATE POLICY "Users can insert own payment"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own pending payment (upload proof)
CREATE POLICY "Users can update own pending payment"
ON public.payments FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending_payment', 'pending_verification'))
WITH CHECK (auth.uid() = user_id);

-- Admin pusat and finance can view all payments
CREATE POLICY "Admin pusat can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');

CREATE POLICY "Admin finance can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active');

-- Admin pusat and finance can update payments (verify/reject)
CREATE POLICY "Admin pusat can update payments"
ON public.payments FOR UPDATE
USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active')
WITH CHECK (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');

CREATE POLICY "Admin finance can update payments"
ON public.payments FOR UPDATE
USING (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active')
WITH CHECK (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active');

-- Add updated_at triggers
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing settings (in Rupiah)
INSERT INTO public.system_settings (key, value, description) VALUES
('registration_base_price', '50000', 'Harga dasar pendaftaran pesantren baru (Rp)'),
('claim_base_price', '20000', 'Harga dasar klaim akun legacy (Rp)');

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('payment-proofs', 'payment-proofs', false, 204800);

-- Storage policies for payment proofs
CREATE POLICY "Users can upload own payment proof"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'payment-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own payment proof"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'payment-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'payment-proofs' 
    AND (has_role(auth.uid(), 'admin_pusat') OR has_role(auth.uid(), 'admin_finance'))
);