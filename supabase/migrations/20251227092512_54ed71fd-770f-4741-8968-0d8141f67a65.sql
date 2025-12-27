-- =====================================================
-- PART 1: ROLE ENUM & USER ROLES TABLE (SECURITY FIRST)
-- =====================================================

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin_regional', 'admin_pusat');

-- Create account status enum
CREATE TYPE public.account_status AS ENUM ('pending', 'active', 'rejected');

-- Create profile level enum
CREATE TYPE public.profile_level AS ENUM ('basic', 'silver', 'gold', 'platinum');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: MASTER TABLES (REGIONS & CITIES)
-- =====================================================

-- Regions table
CREATE TABLE public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Cities table with region reference
CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: CORE PROFILES TABLE
-- =====================================================

CREATE TABLE public.profiles (
    -- Primary key linked to auth.users
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- IMMUTABLE FIELDS (enforced by trigger)
    city_id UUID REFERENCES public.cities(id) ON DELETE RESTRICT,
    region_id UUID REFERENCES public.regions(id) ON DELETE RESTRICT,
    
    -- Account fields
    status_account account_status NOT NULL DEFAULT 'pending',
    profile_level profile_level NOT NULL DEFAULT 'basic',
    nip TEXT UNIQUE,
    
    -- Step 1: Silver Level Data
    nama_pesantren TEXT,
    nama_pengasuh TEXT,
    alamat_singkat TEXT,
    no_wa_pendaftar TEXT,
    
    -- Step 2: Gold Level Data
    nama_media TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    logo_url TEXT,
    foto_pengasuh_url TEXT,
    sk_pesantren_url TEXT,
    social_links JSONB DEFAULT '{}',
    
    -- Step 3: Platinum Level Data
    sejarah TEXT,
    visi_misi TEXT,
    jumlah_santri INTEGER,
    tipe_pesantren TEXT,
    program_unggulan TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 4: CREWS TABLE
-- =====================================================

CREATE TABLE public.crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    jabatan TEXT,
    skill TEXT[],
    xp_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 5: SECURITY DEFINER FUNCTIONS (BYPASS RLS RECURSION)
-- =====================================================

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's region_id
CREATE OR REPLACE FUNCTION public.get_user_region_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT region_id
    FROM public.profiles
    WHERE id = _user_id
$$;

-- Function to get user's account status
CREATE OR REPLACE FUNCTION public.get_user_status(_user_id UUID)
RETURNS account_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT status_account
    FROM public.profiles
    WHERE id = _user_id
$$;

-- =====================================================
-- PART 6: REGION IMMUTABILITY TRIGGER (CRITICAL)
-- =====================================================

CREATE OR REPLACE FUNCTION public.enforce_region_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    derived_region_id UUID;
    bypass_flag TEXT;
BEGIN
    -- Check for bypass flag (ONLY for legacy migration function)
    bypass_flag := current_setting('app.bypass_region_lock', true);
    
    IF TG_OP = 'INSERT' THEN
        -- On INSERT: Derive region_id from city_id (FORCE OVERWRITE)
        IF NEW.city_id IS NOT NULL THEN
            SELECT region_id INTO derived_region_id
            FROM public.cities
            WHERE id = NEW.city_id;
            
            IF derived_region_id IS NULL THEN
                RAISE EXCEPTION 'Invalid city_id: city not found';
            END IF;
            
            -- FORCE the region_id regardless of frontend payload
            NEW.region_id := derived_region_id;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check bypass flag for legacy migration
        IF bypass_flag = 'true' THEN
            RETURN NEW;
        END IF;
        
        -- STRICT: Block ANY change to region_id
        IF OLD.region_id IS DISTINCT FROM NEW.region_id THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: region_id is immutable and cannot be changed.';
        END IF;
        
        -- STRICT: Block ANY change to city_id
        IF OLD.city_id IS DISTINCT FROM NEW.city_id THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: city_id is immutable and cannot be changed.';
        END IF;
        
        -- Update timestamp
        NEW.updated_at := now();
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Attach trigger to profiles table
CREATE TRIGGER trigger_enforce_region_immutability
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_region_immutability();

-- =====================================================
-- PART 7: LEGACY MIGRATION FUNCTION (CONTROLLED OVERRIDE)
-- =====================================================

CREATE OR REPLACE FUNCTION public.migrate_legacy_account(
    p_user_id UUID,
    p_city_id UUID,
    p_region_id UUID,
    p_nama_pesantren TEXT,
    p_nama_pengasuh TEXT,
    p_alamat_singkat TEXT,
    p_no_wa_pendaftar TEXT,
    p_status_account account_status DEFAULT 'active',
    p_nip TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- SECURITY CHECK: Only admin_pusat can call this function
    IF NOT public.has_role(auth.uid(), 'admin_pusat') THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only Admin Pusat can perform legacy migration.';
    END IF;
    
    -- Validate city and region match
    IF NOT EXISTS (
        SELECT 1 FROM public.cities 
        WHERE id = p_city_id AND region_id = p_region_id
    ) THEN
        RAISE EXCEPTION 'INVALID DATA: city_id does not belong to the specified region_id.';
    END IF;
    
    -- Set bypass flag for this transaction only
    PERFORM set_config('app.bypass_region_lock', 'true', true);
    
    -- Perform the migration update
    UPDATE public.profiles
    SET 
        city_id = p_city_id,
        region_id = p_region_id,
        nama_pesantren = p_nama_pesantren,
        nama_pengasuh = p_nama_pengasuh,
        alamat_singkat = p_alamat_singkat,
        no_wa_pendaftar = p_no_wa_pendaftar,
        status_account = p_status_account,
        nip = p_nip,
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Reset bypass flag
    PERFORM set_config('app.bypass_region_lock', 'false', true);
    
    RETURN TRUE;
END;
$$;

-- =====================================================
-- PART 8: RLS POLICIES - USER ROLES TABLE
-- =====================================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only admin_pusat can insert/update/delete roles
CREATE POLICY "Admin pusat can manage all roles"
    ON public.user_roles
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin_pusat'));

-- =====================================================
-- PART 9: RLS POLICIES - REGIONS & CITIES (READ-ONLY PUBLIC)
-- =====================================================

-- Everyone can read regions
CREATE POLICY "Anyone can read regions"
    ON public.regions
    FOR SELECT
    USING (true);

-- Everyone can read cities
CREATE POLICY "Anyone can read cities"
    ON public.cities
    FOR SELECT
    USING (true);

-- Only admin_pusat can modify regions/cities
CREATE POLICY "Admin pusat can manage regions"
    ON public.regions
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Admin pusat can manage cities"
    ON public.cities
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin_pusat'));

-- =====================================================
-- PART 10: RLS POLICIES - PROFILES TABLE (ZERO TRUST)
-- =====================================================

-- Regular users: Can SELECT only their own row (if active)
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (
        auth.uid() = id
        AND status_account = 'active'
    );

-- Regular users: Can UPDATE only allowed fields on their own row
CREATE POLICY "Users can update own profile (restricted fields)"
    ON public.profiles
    FOR UPDATE
    USING (
        auth.uid() = id
        AND status_account = 'active'
    )
    WITH CHECK (
        auth.uid() = id
        AND status_account = 'active'
    );

-- Admin Regional: Can SELECT profiles in their region
CREATE POLICY "Admin regional can view profiles in their region"
    ON public.profiles
    FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin_regional')
        AND region_id = public.get_user_region_id(auth.uid())
        AND public.get_user_status(auth.uid()) = 'active'
    );

-- Admin Regional: Can UPDATE only status_account and nip in their region
CREATE POLICY "Admin regional can update status in their region"
    ON public.profiles
    FOR UPDATE
    USING (
        public.has_role(auth.uid(), 'admin_regional')
        AND region_id = public.get_user_region_id(auth.uid())
        AND public.get_user_status(auth.uid()) = 'active'
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin_regional')
        AND region_id = public.get_user_region_id(auth.uid())
        AND public.get_user_status(auth.uid()) = 'active'
    );

-- Admin Pusat: Full SELECT access (global view)
CREATE POLICY "Admin pusat can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin_pusat')
        AND public.get_user_status(auth.uid()) = 'active'
    );

-- Admin Pusat: Can UPDATE all fields except region_id/city_id (trigger enforces)
CREATE POLICY "Admin pusat can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        public.has_role(auth.uid(), 'admin_pusat')
        AND public.get_user_status(auth.uid()) = 'active'
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin_pusat')
        AND public.get_user_status(auth.uid()) = 'active'
    );

-- Profile creation on signup (handled by trigger)
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- PART 11: RLS POLICIES - CREWS TABLE (REGION ISOLATED)
-- =====================================================

-- Users can view crews in their organization
CREATE POLICY "Users can view own organization crews"
    ON public.crews
    FOR SELECT
    USING (
        profile_id = auth.uid()
        AND public.get_user_status(auth.uid()) = 'active'
    );

-- Users can manage crews in their organization
CREATE POLICY "Users can manage own organization crews"
    ON public.crews
    FOR ALL
    USING (
        profile_id = auth.uid()
        AND public.get_user_status(auth.uid()) = 'active'
    );

-- Admin Regional: View crews in their region
CREATE POLICY "Admin regional can view crews in region"
    ON public.crews
    FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin_regional')
        AND public.get_user_status(auth.uid()) = 'active'
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = crews.profile_id
            AND p.region_id = public.get_user_region_id(auth.uid())
        )
    );

-- Admin Pusat: Full access to all crews
CREATE POLICY "Admin pusat can manage all crews"
    ON public.crews
    FOR ALL
    USING (
        public.has_role(auth.uid(), 'admin_pusat')
        AND public.get_user_status(auth.uid()) = 'active'
    );

-- =====================================================
-- PART 12: AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    
    -- Assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 13: SEED JAWA TIMUR REGIONS & SAMPLE CITIES
-- =====================================================

INSERT INTO public.regions (id, name, code) VALUES
    ('11111111-1111-1111-1111-111111111001', 'Jawa Timur 1 (Surabaya Raya)', 'JATIM-1'),
    ('11111111-1111-1111-1111-111111111002', 'Jawa Timur 2 (Malang Raya)', 'JATIM-2'),
    ('11111111-1111-1111-1111-111111111003', 'Jawa Timur 3 (Kediri Raya)', 'JATIM-3'),
    ('11111111-1111-1111-1111-111111111004', 'Jawa Timur 4 (Madura)', 'JATIM-4'),
    ('11111111-1111-1111-1111-111111111005', 'Jawa Timur 5 (Tapal Kuda)', 'JATIM-5');

INSERT INTO public.cities (name, region_id) VALUES
    ('Kota Surabaya', '11111111-1111-1111-1111-111111111001'),
    ('Kabupaten Sidoarjo', '11111111-1111-1111-1111-111111111001'),
    ('Kabupaten Gresik', '11111111-1111-1111-1111-111111111001'),
    ('Kota Malang', '11111111-1111-1111-1111-111111111002'),
    ('Kabupaten Malang', '11111111-1111-1111-1111-111111111002'),
    ('Kota Batu', '11111111-1111-1111-1111-111111111002'),
    ('Kota Kediri', '11111111-1111-1111-1111-111111111003'),
    ('Kabupaten Kediri', '11111111-1111-1111-1111-111111111003'),
    ('Kabupaten Tulungagung', '11111111-1111-1111-1111-111111111003'),
    ('Kabupaten Bangkalan', '11111111-1111-1111-1111-111111111004'),
    ('Kabupaten Sampang', '11111111-1111-1111-1111-111111111004'),
    ('Kabupaten Pamekasan', '11111111-1111-1111-1111-111111111004'),
    ('Kabupaten Sumenep', '11111111-1111-1111-1111-111111111004'),
    ('Kabupaten Jember', '11111111-1111-1111-1111-111111111005'),
    ('Kabupaten Banyuwangi', '11111111-1111-1111-1111-111111111005'),
    ('Kabupaten Bondowoso', '11111111-1111-1111-1111-111111111005'),
    ('Kabupaten Situbondo', '11111111-1111-1111-1111-111111111005');