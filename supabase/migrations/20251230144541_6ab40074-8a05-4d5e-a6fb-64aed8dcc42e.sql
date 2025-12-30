-- Add mpj_id_number to pesantren_claims for NIP storage
ALTER TABLE public.pesantren_claims 
ADD COLUMN IF NOT EXISTS mpj_id_number TEXT UNIQUE;

-- Create jabatan_codes table for dynamic role codes
CREATE TABLE IF NOT EXISTS public.jabatan_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on jabatan_codes
ALTER TABLE public.jabatan_codes ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read jabatan codes
CREATE POLICY "Anyone can read jabatan codes"
ON public.jabatan_codes
FOR SELECT
USING (true);

-- RLS: Admin pusat can manage jabatan codes
CREATE POLICY "Admin pusat can manage jabatan codes"
ON public.jabatan_codes
FOR ALL
USING (has_role(auth.uid(), 'admin_pusat'))
WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

-- Add niam to crews table
ALTER TABLE public.crews
ADD COLUMN IF NOT EXISTS niam TEXT UNIQUE;

-- Add jabatan_code_id to crews for linking to jabatan_codes
ALTER TABLE public.crews
ADD COLUMN IF NOT EXISTS jabatan_code_id UUID REFERENCES public.jabatan_codes(id);

-- Insert default jabatan codes
INSERT INTO public.jabatan_codes (name, code, description) VALUES
('Admin Media', 'AM', 'Administrator/Koordinator Media Pesantren'),
('Anggota', 'AN', 'Anggota Tim Media'),
('Desainer', 'DS', 'Desainer Grafis'),
('Videografer', 'VG', 'Videografer/Editor Video'),
('Fotografer', 'FG', 'Fotografer'),
('Content Creator', 'CC', 'Content Creator/Writer'),
('Militan', 'DM', 'Dewan Militan')
ON CONFLICT (name) DO NOTHING;

-- Create function to generate NIP
CREATE OR REPLACE FUNCTION public.generate_nip(
    p_claim_id UUID,
    p_region_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_year TEXT;
    v_region_code TEXT;
    v_sequence INTEGER;
    v_nip TEXT;
BEGIN
    -- Get 2-digit year
    v_year := TO_CHAR(NOW(), 'YY');
    
    -- Get region code (must be exactly 2 digits)
    SELECT code INTO v_region_code
    FROM public.regions
    WHERE id = p_region_id;
    
    -- Validate region code is 2 digits
    IF v_region_code IS NULL OR LENGTH(v_region_code) != 2 OR v_region_code !~ '^[0-9]{2}$' THEN
        RAISE EXCEPTION 'Region code must be exactly 2 digits. Please configure the region code first.';
    END IF;
    
    -- Get next sequence number for this region (count approved claims in this region)
    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequence
    FROM public.pesantren_claims
    WHERE region_id = p_region_id
      AND mpj_id_number IS NOT NULL;
    
    -- Format NIP: YY.RR.XXX
    v_nip := v_year || '.' || v_region_code || '.' || LPAD(v_sequence::TEXT, 3, '0');
    
    -- Update the claim with the NIP
    UPDATE public.pesantren_claims
    SET mpj_id_number = v_nip
    WHERE id = p_claim_id;
    
    RETURN v_nip;
END;
$$;

-- Create function to generate NIAM
CREATE OR REPLACE FUNCTION public.generate_niam(
    p_crew_id UUID,
    p_profile_id UUID,
    p_jabatan_code_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role_code TEXT;
    v_nip TEXT;
    v_sequence INTEGER;
    v_niam TEXT;
BEGIN
    -- Get role code from jabatan_codes
    SELECT code INTO v_role_code
    FROM public.jabatan_codes
    WHERE id = p_jabatan_code_id;
    
    IF v_role_code IS NULL THEN
        RAISE EXCEPTION 'Invalid jabatan code';
    END IF;
    
    -- Get NIP from pesantren_claims using profile_id
    SELECT pc.mpj_id_number INTO v_nip
    FROM public.pesantren_claims pc
    WHERE pc.user_id = p_profile_id
      AND pc.mpj_id_number IS NOT NULL
    LIMIT 1;
    
    IF v_nip IS NULL THEN
        RAISE EXCEPTION 'Institution NIP not found. Account must be activated first.';
    END IF;
    
    -- Get next sequence number for crew in this institution
    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequence
    FROM public.crews
    WHERE profile_id = p_profile_id
      AND niam IS NOT NULL;
    
    -- Format NIAM: ROLE.YY.RR.XXX.KK
    v_niam := v_role_code || '.' || v_nip || '.' || LPAD(v_sequence::TEXT, 2, '0');
    
    -- Update the crew with the NIAM
    UPDATE public.crews
    SET niam = v_niam, jabatan_code_id = p_jabatan_code_id
    WHERE id = p_crew_id;
    
    RETURN v_niam;
END;
$$;

-- Create function to regenerate NIAM when jabatan changes
CREATE OR REPLACE FUNCTION public.update_crew_niam()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role_code TEXT;
    v_nip TEXT;
    v_sequence_part TEXT;
    v_new_niam TEXT;
BEGIN
    -- Only run if jabatan_code_id changed
    IF OLD.jabatan_code_id IS DISTINCT FROM NEW.jabatan_code_id AND NEW.jabatan_code_id IS NOT NULL THEN
        -- Get new role code
        SELECT code INTO v_role_code
        FROM public.jabatan_codes
        WHERE id = NEW.jabatan_code_id;
        
        IF v_role_code IS NOT NULL AND OLD.niam IS NOT NULL THEN
            -- Extract the sequence part (last 2 digits) from existing NIAM
            v_sequence_part := SUBSTRING(OLD.niam FROM '\.([0-9]{2})$');
            
            -- Get NIP from the old NIAM (everything between first . and last .)
            v_nip := SUBSTRING(OLD.niam FROM '\.(.*)\.([0-9]{2})$');
            -- Extract just YY.RR.XXX part
            SELECT pc.mpj_id_number INTO v_nip
            FROM public.pesantren_claims pc
            WHERE pc.user_id = NEW.profile_id
              AND pc.mpj_id_number IS NOT NULL
            LIMIT 1;
            
            IF v_nip IS NOT NULL AND v_sequence_part IS NOT NULL THEN
                v_new_niam := v_role_code || '.' || v_nip || '.' || v_sequence_part;
                NEW.niam := v_new_niam;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic NIAM update on jabatan change
DROP TRIGGER IF EXISTS trigger_update_crew_niam ON public.crews;
CREATE TRIGGER trigger_update_crew_niam
    BEFORE UPDATE ON public.crews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_crew_niam();