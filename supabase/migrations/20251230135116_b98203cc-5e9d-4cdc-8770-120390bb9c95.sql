-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create claim_status enum for pesantren claims workflow
CREATE TYPE public.claim_status AS ENUM (
  'pending',
  'regional_approved', 
  'pusat_approved',
  'approved',
  'rejected'
);

-- Create pesantren_claims table to track 1 User = 1 Pesantren
CREATE TABLE public.pesantren_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pesantren_name TEXT NOT NULL,
  status claim_status NOT NULL DEFAULT 'pending',
  region_id UUID REFERENCES public.regions(id),
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- CRITICAL: One user can only have ONE claim (1 User = 1 Pesantren)
);

-- Enable RLS
ALTER TABLE public.pesantren_claims ENABLE ROW LEVEL SECURITY;

-- Security definer function to check claim status
CREATE OR REPLACE FUNCTION public.get_user_claim_status(_user_id UUID)
RETURNS claim_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status
  FROM public.pesantren_claims
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Security definer function to check if user has approved claim
CREATE OR REPLACE FUNCTION public.has_approved_claim(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pesantren_claims
    WHERE user_id = _user_id
      AND status IN ('approved', 'pusat_approved')
  )
$$;

-- RLS Policies

-- Users can view their own claims
CREATE POLICY "Users can view own claims"
ON public.pesantren_claims
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own claim (only if no existing claim)
CREATE POLICY "Users can create own claim"
ON public.pesantren_claims
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.pesantren_claims WHERE user_id = auth.uid()
  )
);

-- Admin pusat can view all claims
CREATE POLICY "Admin pusat can view all claims"
ON public.pesantren_claims
FOR SELECT
USING (
  has_role(auth.uid(), 'admin_pusat') 
  AND get_user_status(auth.uid()) = 'active'
);

-- Admin pusat can update any claim
CREATE POLICY "Admin pusat can update claims"
ON public.pesantren_claims
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin_pusat') 
  AND get_user_status(auth.uid()) = 'active'
);

-- Admin regional can view claims in their region
CREATE POLICY "Admin regional can view region claims"
ON public.pesantren_claims
FOR SELECT
USING (
  has_role(auth.uid(), 'admin_regional')
  AND get_user_status(auth.uid()) = 'active'
  AND region_id = get_user_region_id(auth.uid())
);

-- Admin regional can update claims in their region
CREATE POLICY "Admin regional can update region claims"
ON public.pesantren_claims
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin_regional')
  AND get_user_status(auth.uid()) = 'active'
  AND region_id = get_user_region_id(auth.uid())
);

-- Trigger to update updated_at
CREATE TRIGGER update_pesantren_claims_updated_at
BEFORE UPDATE ON public.pesantren_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();