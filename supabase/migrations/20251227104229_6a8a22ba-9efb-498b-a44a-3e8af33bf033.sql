-- Add RLS policy for admin_finance to update account status
CREATE POLICY "Admin finance can update account status" 
ON public.profiles 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin_finance'::app_role) 
  AND get_user_status(auth.uid()) = 'active'::account_status
)
WITH CHECK (
  has_role(auth.uid(), 'admin_finance'::app_role) 
  AND get_user_status(auth.uid()) = 'active'::account_status
);

-- Add RLS policy for admin_finance to view pending profiles
CREATE POLICY "Admin finance can view pending profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin_finance'::app_role) 
  AND get_user_status(auth.uid()) = 'active'::account_status
);