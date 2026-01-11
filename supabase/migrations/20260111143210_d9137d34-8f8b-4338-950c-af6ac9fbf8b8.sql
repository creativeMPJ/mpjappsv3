-- Create table to track follow-up actions by regional admins
CREATE TABLE public.follow_up_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  claim_id UUID NOT NULL REFERENCES public.pesantren_claims(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES public.regions(id),
  action_type TEXT NOT NULL DEFAULT 'whatsapp_followup',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_up_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view follow-up logs in their region
CREATE POLICY "Admin regional can view region follow-up logs"
ON public.follow_up_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin_regional') 
  AND get_user_status(auth.uid()) = 'active'
  AND region_id = get_user_region_id(auth.uid())
);

-- Policy: Admins can insert their own follow-up logs
CREATE POLICY "Admin regional can insert own follow-up logs"
ON public.follow_up_logs
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin_regional') 
  AND get_user_status(auth.uid()) = 'active'
  AND admin_id = auth.uid()
  AND region_id = get_user_region_id(auth.uid())
);

-- Policy: Admin pusat can view all follow-up logs
CREATE POLICY "Admin pusat can view all follow-up logs"
ON public.follow_up_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin_pusat') 
  AND get_user_status(auth.uid()) = 'active'
);

-- Create index for performance
CREATE INDEX idx_follow_up_logs_region ON public.follow_up_logs(region_id);
CREATE INDEX idx_follow_up_logs_admin ON public.follow_up_logs(admin_id);
CREATE INDEX idx_follow_up_logs_created ON public.follow_up_logs(created_at);