-- Add regional_approved_at column to track when regional admin approved the claim
ALTER TABLE public.pesantren_claims 
ADD COLUMN IF NOT EXISTS regional_approved_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of late payments
CREATE INDEX IF NOT EXISTS idx_pesantren_claims_regional_approved_at 
ON public.pesantren_claims (regional_approved_at) 
WHERE regional_approved_at IS NOT NULL;

-- Update existing regional_approved claims to have the approved_at as fallback
UPDATE public.pesantren_claims 
SET regional_approved_at = COALESCE(approved_at, updated_at)
WHERE status IN ('regional_approved', 'pusat_approved', 'approved') 
  AND regional_approved_at IS NULL;