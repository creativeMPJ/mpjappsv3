-- Add role column to profiles table as SINGLE SOURCE OF TRUTH
ALTER TABLE public.profiles 
ADD COLUMN role public.app_role NOT NULL DEFAULT 'user'::app_role;

-- Sync existing roles from user_roles to profiles
UPDATE public.profiles p
SET role = ur.role
FROM public.user_roles ur
WHERE p.id = ur.user_id;

-- Update handle_new_user function to set role in profiles directly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile with default role
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, 'user');
    
    -- Also insert into user_roles for backward compatibility
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Create function to keep user_roles and profiles.role in sync
CREATE OR REPLACE FUNCTION public.sync_role_to_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.profiles
        SET role = NEW.role, updated_at = now()
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Create trigger to sync role changes from user_roles to profiles
DROP TRIGGER IF EXISTS sync_role_trigger ON public.user_roles;
CREATE TRIGGER sync_role_trigger
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_role_to_profiles();

-- Update RLS policies to use profiles.role where appropriate
-- Add policy for profiles to use new role column in select
DROP POLICY IF EXISTS "Users can view own profile regardless of status" ON public.profiles;

CREATE POLICY "Users can view own profile regardless of status"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status_account ON public.profiles(status_account);