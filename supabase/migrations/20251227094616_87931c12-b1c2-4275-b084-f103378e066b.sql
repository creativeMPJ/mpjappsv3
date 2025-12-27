-- Update RLS policy: Allow users to view their own profile regardless of status
-- (so they can check if they're pending/active/rejected)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile regardless of status"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create secure function for legacy claim activation (after OTP verification)
CREATE OR REPLACE FUNCTION public.activate_legacy_claim(
    p_user_id UUID,
    p_city_id UUID,
    p_region_id UUID,
    p_nama_pesantren TEXT,
    p_nama_pengasuh TEXT,
    p_alamat_singkat TEXT,
    p_no_wa_pendaftar TEXT,
    p_nip TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- SECURITY: Only the user themselves can activate their own legacy claim
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'UNAUTHORIZED: You can only activate your own account.';
    END IF;
    
    -- Validate city belongs to region
    IF NOT EXISTS (
        SELECT 1 FROM public.cities 
        WHERE id = p_city_id AND region_id = p_region_id
    ) THEN
        RAISE EXCEPTION 'INVALID DATA: city_id does not belong to the specified region_id.';
    END IF;
    
    -- Check user is currently pending (can't reactivate)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id AND status_account = 'pending'
    ) THEN
        RAISE EXCEPTION 'INVALID STATE: Only pending accounts can be activated via legacy claim.';
    END IF;
    
    -- Set bypass flag for immutability trigger
    PERFORM set_config('app.bypass_region_lock', 'true', true);
    
    -- Activate the account with legacy data
    UPDATE public.profiles
    SET 
        city_id = p_city_id,
        region_id = p_region_id,
        nama_pesantren = p_nama_pesantren,
        nama_pengasuh = p_nama_pengasuh,
        alamat_singkat = p_alamat_singkat,
        no_wa_pendaftar = p_no_wa_pendaftar,
        nip = p_nip,
        status_account = 'active',  -- AUTO-ACTIVATE for legacy claims
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Reset bypass flag
    PERFORM set_config('app.bypass_region_lock', 'false', true);
    
    RETURN TRUE;
END;
$$;

-- Create function for admin to approve/reject pending users
CREATE OR REPLACE FUNCTION public.admin_update_account_status(
    p_target_user_id UUID,
    p_new_status account_status
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_region_id UUID;
    v_target_region_id UUID;
BEGIN
    -- SECURITY: Only admin_pusat or admin_regional can change status
    IF NOT (has_role(auth.uid(), 'admin_pusat') OR has_role(auth.uid(), 'admin_regional')) THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only admins can update account status.';
    END IF;
    
    -- Get regions for authorization check
    SELECT region_id INTO v_caller_region_id FROM public.profiles WHERE id = auth.uid();
    SELECT region_id INTO v_target_region_id FROM public.profiles WHERE id = p_target_user_id;
    
    -- Admin regional can only approve users in their region
    IF has_role(auth.uid(), 'admin_regional') AND NOT has_role(auth.uid(), 'admin_pusat') THEN
        IF v_caller_region_id IS DISTINCT FROM v_target_region_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED: Admin regional can only manage users in their region.';
        END IF;
    END IF;
    
    -- Perform the status update
    UPDATE public.profiles
    SET 
        status_account = p_new_status,
        updated_at = now()
    WHERE id = p_target_user_id;
    
    RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.activate_legacy_claim TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_account_status TO authenticated;