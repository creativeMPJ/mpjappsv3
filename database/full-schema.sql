-- ============================================
-- MPJ Apps v3 - Full Database Schema
-- Generated: 2026-02-13
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================
CREATE TYPE public.account_status AS ENUM ('pending', 'active', 'rejected');
CREATE TYPE public.app_role AS ENUM ('user', 'admin_regional', 'admin_pusat', 'admin_finance');
CREATE TYPE public.claim_status AS ENUM ('pending', 'regional_approved', 'pusat_approved', 'approved', 'rejected');
CREATE TYPE public.payment_status AS ENUM ('paid', 'unpaid');
CREATE TYPE public.payment_verification_status AS ENUM ('pending_payment', 'pending_verification', 'verified', 'rejected');
CREATE TYPE public.profile_level AS ENUM ('basic', 'silver', 'gold', 'platinum');
CREATE TYPE public.registration_type AS ENUM ('klaim', 'pesantren_baru');

-- ============================================
-- 2. TABLES
-- ============================================

-- Regions
CREATE TABLE public.regions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cities
CREATE TABLE public.cities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    region_id UUID NOT NULL REFERENCES public.regions(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    role public.app_role NOT NULL DEFAULT 'user',
    status_account public.account_status NOT NULL DEFAULT 'pending',
    status_payment public.payment_status NOT NULL DEFAULT 'unpaid',
    profile_level public.profile_level NOT NULL DEFAULT 'basic',
    nama_pesantren TEXT,
    nama_pengasuh TEXT,
    nama_media TEXT,
    alamat_singkat TEXT,
    no_wa_pendaftar TEXT,
    nip TEXT,
    city_id UUID REFERENCES public.cities(id),
    region_id UUID REFERENCES public.regions(id),
    logo_url TEXT,
    foto_pengasuh_url TEXT,
    sk_pesantren_url TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    jumlah_santri INTEGER,
    tipe_pesantren TEXT,
    program_unggulan TEXT[],
    sejarah TEXT,
    visi_misi TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Pesantren Claims
CREATE TABLE public.pesantren_claims (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    pesantren_name TEXT NOT NULL,
    jenis_pengajuan public.registration_type NOT NULL DEFAULT 'pesantren_baru',
    status public.claim_status NOT NULL DEFAULT 'pending',
    region_id UUID REFERENCES public.regions(id),
    kecamatan TEXT,
    nama_pengelola TEXT,
    email_pengelola TEXT,
    dokumen_bukti_url TEXT,
    mpj_id_number TEXT,
    notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    regional_approved_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    pesantren_claim_id UUID NOT NULL REFERENCES public.pesantren_claims(id),
    base_amount INTEGER NOT NULL,
    unique_code INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status public.payment_verification_status NOT NULL DEFAULT 'pending_payment',
    proof_file_url TEXT,
    rejection_reason TEXT,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jabatan Codes
CREATE TABLE public.jabatan_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Crews
CREATE TABLE public.crews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id),
    nama TEXT NOT NULL,
    jabatan TEXT,
    jabatan_code_id UUID REFERENCES public.jabatan_codes(id),
    niam TEXT,
    skill TEXT[],
    xp_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- OTP Verifications
CREATE TABLE public.otp_verifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    pesantren_claim_id UUID REFERENCES public.pesantren_claims(id),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Follow Up Logs
CREATE TABLE public.follow_up_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    claim_id UUID NOT NULL REFERENCES public.pesantren_claims(id),
    region_id UUID NOT NULL REFERENCES public.regions(id),
    action_type TEXT NOT NULL DEFAULT 'whatsapp_followup',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Settings
CREATE TABLE public.system_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. FUNCTIONS
-- ============================================

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- get_user_status
CREATE OR REPLACE FUNCTION public.get_user_status(_user_id UUID)
RETURNS public.account_status
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT status_account FROM public.profiles WHERE id = _user_id
$$;

-- get_user_region_id
CREATE OR REPLACE FUNCTION public.get_user_region_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT region_id FROM public.profiles WHERE id = _user_id
$$;

-- get_user_claim_status
CREATE OR REPLACE FUNCTION public.get_user_claim_status(_user_id UUID)
RETURNS public.claim_status
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT status FROM public.pesantren_claims WHERE user_id = _user_id LIMIT 1
$$;

-- has_approved_claim
CREATE OR REPLACE FUNCTION public.has_approved_claim(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.pesantren_claims
        WHERE user_id = _user_id AND status IN ('approved', 'pusat_approved')
    )
$$;

-- handle_new_user (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'user');
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$;

-- sync_role_to_profiles
CREATE OR REPLACE FUNCTION public.sync_role_to_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.profiles SET role = NEW.role, updated_at = now() WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- enforce_region_immutability
CREATE OR REPLACE FUNCTION public.enforce_region_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF OLD.region_id IS NULL THEN
        IF NEW.city_id IS NOT NULL THEN
            SELECT region_id INTO NEW.region_id FROM public.cities WHERE id = NEW.city_id;
        END IF;
    ELSE
        IF OLD.region_id IS DISTINCT FROM NEW.region_id THEN
            RAISE EXCEPTION 'Security: Region Locked.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- cleanup_expired_otps
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.otp_verifications WHERE expires_at < now() AND is_verified = false;
END;
$$;

-- generate_nip
CREATE OR REPLACE FUNCTION public.generate_nip(p_claim_id UUID, p_region_id UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_year TEXT;
    v_region_code TEXT;
    v_sequence INTEGER;
    v_nip TEXT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YY');
    SELECT code INTO v_region_code FROM public.regions WHERE id = p_region_id;
    IF v_region_code IS NULL OR LENGTH(v_region_code) != 2 OR v_region_code !~ '^[0-9]{2}$' THEN
        RAISE EXCEPTION 'Region code must be exactly 2 digits.';
    END IF;
    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequence
    FROM public.pesantren_claims WHERE region_id = p_region_id AND mpj_id_number IS NOT NULL;
    v_nip := v_year || v_region_code || LPAD(v_sequence::TEXT, 3, '0');
    UPDATE public.pesantren_claims SET mpj_id_number = v_nip WHERE id = p_claim_id;
    RETURN v_nip;
END;
$$;

-- generate_niam
CREATE OR REPLACE FUNCTION public.generate_niam(p_crew_id UUID, p_profile_id UUID, p_jabatan_code_id UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role_code TEXT;
    v_nip TEXT;
    v_nip_clean TEXT;
    v_sequence INTEGER;
    v_niam TEXT;
BEGIN
    SELECT code INTO v_role_code FROM public.jabatan_codes WHERE id = p_jabatan_code_id;
    IF v_role_code IS NULL THEN RAISE EXCEPTION 'Invalid jabatan code'; END IF;
    SELECT pc.mpj_id_number INTO v_nip FROM public.pesantren_claims pc
    WHERE pc.user_id = p_profile_id AND pc.mpj_id_number IS NOT NULL LIMIT 1;
    IF v_nip IS NULL THEN RAISE EXCEPTION 'Institution NIP not found.'; END IF;
    v_nip_clean := REPLACE(v_nip, '.', '');
    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequence
    FROM public.crews WHERE profile_id = p_profile_id AND niam IS NOT NULL;
    v_niam := v_role_code || v_nip_clean || LPAD(v_sequence::TEXT, 2, '0');
    UPDATE public.crews SET niam = v_niam, jabatan_code_id = p_jabatan_code_id WHERE id = p_crew_id;
    RETURN v_niam;
END;
$$;

-- update_crew_niam
CREATE OR REPLACE FUNCTION public.update_crew_niam()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role_code TEXT;
    v_nip_clean TEXT;
    v_sequence_part TEXT;
    v_new_niam TEXT;
BEGIN
    IF OLD.jabatan_code_id IS DISTINCT FROM NEW.jabatan_code_id AND NEW.jabatan_code_id IS NOT NULL THEN
        SELECT code INTO v_role_code FROM public.jabatan_codes WHERE id = NEW.jabatan_code_id;
        IF v_role_code IS NOT NULL AND OLD.niam IS NOT NULL THEN
            v_sequence_part := RIGHT(OLD.niam, 2);
            SELECT REPLACE(pc.mpj_id_number, '.', '') INTO v_nip_clean
            FROM public.pesantren_claims pc
            WHERE pc.user_id = NEW.profile_id AND pc.mpj_id_number IS NOT NULL LIMIT 1;
            IF v_nip_clean IS NOT NULL AND v_sequence_part IS NOT NULL THEN
                v_new_niam := v_role_code || v_nip_clean || v_sequence_part;
                NEW.niam := v_new_niam;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- admin_update_account_status
CREATE OR REPLACE FUNCTION public.admin_update_account_status(p_target_user_id UUID, p_new_status public.account_status)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_region_id UUID;
    v_target_region_id UUID;
BEGIN
    IF NOT (has_role(auth.uid(), 'admin_pusat') OR has_role(auth.uid(), 'admin_regional')) THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only admins can update account status.';
    END IF;
    SELECT region_id INTO v_caller_region_id FROM public.profiles WHERE id = auth.uid();
    SELECT region_id INTO v_target_region_id FROM public.profiles WHERE id = p_target_user_id;
    IF has_role(auth.uid(), 'admin_regional') AND NOT has_role(auth.uid(), 'admin_pusat') THEN
        IF v_caller_region_id IS DISTINCT FROM v_target_region_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED: Admin regional can only manage users in their region.';
        END IF;
    END IF;
    UPDATE public.profiles SET status_account = p_new_status, updated_at = now() WHERE id = p_target_user_id;
    RETURN TRUE;
END;
$$;

-- activate_legacy_claim
CREATE OR REPLACE FUNCTION public.activate_legacy_claim(
    p_user_id UUID, p_city_id UUID, p_region_id UUID,
    p_nama_pesantren TEXT, p_nama_pengasuh TEXT, p_alamat_singkat TEXT,
    p_no_wa_pendaftar TEXT, p_nip TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() != p_user_id THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.cities WHERE id = p_city_id AND region_id = p_region_id) THEN
        RAISE EXCEPTION 'INVALID DATA: city does not belong to region.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND status_account = 'pending') THEN
        RAISE EXCEPTION 'INVALID STATE: Only pending accounts can be activated.';
    END IF;
    PERFORM set_config('app.bypass_region_lock', 'true', true);
    UPDATE public.profiles SET
        city_id = p_city_id, region_id = p_region_id,
        nama_pesantren = p_nama_pesantren, nama_pengasuh = p_nama_pengasuh,
        alamat_singkat = p_alamat_singkat, no_wa_pendaftar = p_no_wa_pendaftar,
        nip = p_nip, status_account = 'active', updated_at = now()
    WHERE id = p_user_id;
    PERFORM set_config('app.bypass_region_lock', 'false', true);
    RETURN TRUE;
END;
$$;

-- migrate_legacy_account
CREATE OR REPLACE FUNCTION public.migrate_legacy_account(
    p_user_id UUID, p_city_id UUID, p_region_id UUID,
    p_nama_pesantren TEXT, p_nama_pengasuh TEXT, p_alamat_singkat TEXT,
    p_no_wa_pendaftar TEXT, p_status_account public.account_status DEFAULT 'active',
    p_nip TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.has_role(auth.uid(), 'admin_pusat') THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only Admin Pusat can perform legacy migration.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.cities WHERE id = p_city_id AND region_id = p_region_id) THEN
        RAISE EXCEPTION 'INVALID DATA: city does not belong to region.';
    END IF;
    PERFORM set_config('app.bypass_region_lock', 'true', true);
    UPDATE public.profiles SET
        city_id = p_city_id, region_id = p_region_id,
        nama_pesantren = p_nama_pesantren, nama_pengasuh = p_nama_pengasuh,
        alamat_singkat = p_alamat_singkat, no_wa_pendaftar = p_no_wa_pendaftar,
        status_account = p_status_account, nip = p_nip, updated_at = now()
    WHERE id = p_user_id;
    PERFORM set_config('app.bypass_region_lock', 'false', true);
    RETURN TRUE;
END;
$$;

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Auto-create profile on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync role changes to profiles
CREATE TRIGGER sync_role_trigger
    AFTER INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_role_to_profiles();

-- Region immutability on profiles
CREATE TRIGGER enforce_region_immutability_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_region_immutability();

-- Auto-update NIAM when jabatan changes
CREATE TRIGGER update_crew_niam_trigger
    BEFORE UPDATE ON public.crews
    FOR EACH ROW EXECUTE FUNCTION public.update_crew_niam();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON public.crews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pesantren_claims_updated_at BEFORE UPDATE ON public.pesantren_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesantren_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jabatan_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Regions (public read)
CREATE POLICY "Anyone can read regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Admin pusat can manage regions" ON public.regions FOR ALL USING (has_role(auth.uid(), 'admin_pusat'));

-- Cities (public read)
CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admin pusat can manage cities" ON public.cities FOR ALL USING (has_role(auth.uid(), 'admin_pusat'));

-- Jabatan Codes (public read)
CREATE POLICY "Anyone can read jabatan codes" ON public.jabatan_codes FOR SELECT USING (true);
CREATE POLICY "Admin pusat can manage jabatan codes" ON public.jabatan_codes FOR ALL USING (has_role(auth.uid(), 'admin_pusat')) WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

-- System Settings (public read)
CREATE POLICY "Anyone can read settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admin pusat can manage settings" ON public.system_settings FOR ALL USING (has_role(auth.uid(), 'admin_pusat')) WITH CHECK (has_role(auth.uid(), 'admin_pusat'));

-- Profiles
CREATE POLICY "Users can view own profile regardless of status" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile (restricted fields)" ON public.profiles FOR UPDATE USING (auth.uid() = id AND status_account = 'active') WITH CHECK (auth.uid() = id AND status_account = 'active');
CREATE POLICY "Admin pusat can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin pusat can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active') WITH CHECK (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin regional can view profiles in their region" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin_regional') AND region_id = get_user_region_id(auth.uid()) AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin regional can update status in their region" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin_regional') AND region_id = get_user_region_id(auth.uid()) AND get_user_status(auth.uid()) = 'active') WITH CHECK (has_role(auth.uid(), 'admin_regional') AND region_id = get_user_region_id(auth.uid()) AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin finance can view pending profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin finance can update account status" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active') WITH CHECK (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active');

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin pusat can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin_pusat'));

-- Pesantren Claims
CREATE POLICY "Users can view own claims" ON public.pesantren_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own claim" ON public.pesantren_claims FOR INSERT WITH CHECK (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM pesantren_claims WHERE user_id = auth.uid()));
CREATE POLICY "Admin pusat can view all claims" ON public.pesantren_claims FOR SELECT USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin pusat can update claims" ON public.pesantren_claims FOR UPDATE USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin regional can view region claims" ON public.pesantren_claims FOR SELECT USING (has_role(auth.uid(), 'admin_regional') AND get_user_status(auth.uid()) = 'active' AND region_id = get_user_region_id(auth.uid()));
CREATE POLICY "Admin regional can update region claims" ON public.pesantren_claims FOR UPDATE USING (has_role(auth.uid(), 'admin_regional') AND get_user_status(auth.uid()) = 'active' AND region_id = get_user_region_id(auth.uid()));

-- Payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending payment" ON public.payments FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending_payment', 'pending_verification')) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin finance can view all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin finance can update payments" ON public.payments FOR UPDATE USING (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active') WITH CHECK (has_role(auth.uid(), 'admin_finance') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin pusat can view all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin pusat can update payments" ON public.payments FOR UPDATE USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active') WITH CHECK (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');

-- Crews
CREATE POLICY "Users can view own organization crews" ON public.crews FOR SELECT USING (profile_id = auth.uid() AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Users can manage own organization crews" ON public.crews FOR ALL USING (profile_id = auth.uid() AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin pusat can manage all crews" ON public.crews FOR ALL USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');
CREATE POLICY "Admin regional can view crews in region" ON public.crews FOR SELECT USING (has_role(auth.uid(), 'admin_regional') AND get_user_status(auth.uid()) = 'active' AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = crews.profile_id AND p.region_id = get_user_region_id(auth.uid())));

-- OTP Verifications (locked down - managed by edge functions)
CREATE POLICY "Users can view own OTP verification status" ON public.otp_verifications FOR SELECT USING (false);
CREATE POLICY "No direct insert access" ON public.otp_verifications FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update access" ON public.otp_verifications FOR UPDATE USING (false) WITH CHECK (false);
CREATE POLICY "No direct delete access" ON public.otp_verifications FOR DELETE USING (false);

-- Follow Up Logs
CREATE POLICY "Admin regional can view region follow-up logs" ON public.follow_up_logs FOR SELECT USING (has_role(auth.uid(), 'admin_regional') AND get_user_status(auth.uid()) = 'active' AND region_id = get_user_region_id(auth.uid()));
CREATE POLICY "Admin regional can insert own follow-up logs" ON public.follow_up_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin_regional') AND get_user_status(auth.uid()) = 'active' AND admin_id = auth.uid() AND region_id = get_user_region_id(auth.uid()));
CREATE POLICY "Admin pusat can view all follow-up logs" ON public.follow_up_logs FOR SELECT USING (has_role(auth.uid(), 'admin_pusat') AND get_user_status(auth.uid()) = 'active');

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('registration-documents', 'registration-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Storage RLS Policies
CREATE POLICY "Users can upload registration documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'registration-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own registration documents" ON storage.objects FOR SELECT USING (bucket_id = 'registration-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admin regional can view registration documents" ON storage.objects FOR SELECT USING (bucket_id = 'registration-documents' AND has_role(auth.uid(), 'admin_regional'));
CREATE POLICY "Admin pusat can view registration documents" ON storage.objects FOR SELECT USING (bucket_id = 'registration-documents' AND has_role(auth.uid(), 'admin_pusat'));

CREATE POLICY "Users can upload payment proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admin finance can view payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin_finance'));
CREATE POLICY "Admin pusat can view payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin_pusat'));

-- ============================================
-- 7. SEED DATA
-- ============================================

-- Jabatan Codes
INSERT INTO public.jabatan_codes (name, code, description) VALUES
    ('Penanggung Jawab', 'PJ', 'Penanggung jawab media pesantren'),
    ('Koordinator', 'KO', 'Koordinator tim media'),
    ('Videografer', 'VG', 'Petugas video dan dokumentasi'),
    ('Fotografer', 'FG', 'Petugas fotografi'),
    ('Editor', 'ED', 'Editor konten media'),
    ('Desainer Grafis', 'DG', 'Desainer grafis dan visual'),
    ('Admin Media Sosial', 'AM', 'Pengelola media sosial'),
    ('Penulis Konten', 'PK', 'Penulis dan copywriter'),
    ('Reporter', 'RP', 'Reporter dan jurnalis pesantren');
