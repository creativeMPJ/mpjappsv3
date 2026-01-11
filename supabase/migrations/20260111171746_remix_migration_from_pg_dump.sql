CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: account_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_status AS ENUM (
    'pending',
    'active',
    'rejected'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'user',
    'admin_regional',
    'admin_pusat',
    'admin_finance'
);


--
-- Name: claim_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.claim_status AS ENUM (
    'pending',
    'regional_approved',
    'pusat_approved',
    'approved',
    'rejected'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'paid',
    'unpaid'
);


--
-- Name: payment_verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_verification_status AS ENUM (
    'pending_payment',
    'pending_verification',
    'verified',
    'rejected'
);


--
-- Name: profile_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.profile_level AS ENUM (
    'basic',
    'silver',
    'gold',
    'platinum'
);


--
-- Name: registration_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.registration_type AS ENUM (
    'klaim',
    'pesantren_baru'
);


--
-- Name: activate_legacy_claim(uuid, uuid, uuid, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.activate_legacy_claim(p_user_id uuid, p_city_id uuid, p_region_id uuid, p_nama_pesantren text, p_nama_pengasuh text, p_alamat_singkat text, p_no_wa_pendaftar text, p_nip text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: admin_update_account_status(uuid, public.account_status); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_update_account_status(p_target_user_id uuid, p_new_status public.account_status) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: cleanup_expired_otps(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_otps() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    DELETE FROM public.otp_verifications
    WHERE expires_at < now() AND is_verified = false;
END;
$$;


--
-- Name: enforce_region_immutability(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_region_immutability() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: generate_niam(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_niam(p_crew_id uuid, p_profile_id uuid, p_jabatan_code_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_role_code TEXT;
    v_nip TEXT;
    v_nip_clean TEXT;
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
    
    -- Clean NIP (remove any dots if present for backward compatibility)
    v_nip_clean := REPLACE(v_nip, '.', '');
    
    -- Get next sequence number for crew in this institution
    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequence
    FROM public.crews
    WHERE profile_id = p_profile_id
      AND niam IS NOT NULL;
    
    -- Format NIAM: ROLEYYRRRXXXKK (clean format without dots)
    v_niam := v_role_code || v_nip_clean || LPAD(v_sequence::TEXT, 2, '0');
    
    -- Update the crew with the NIAM
    UPDATE public.crews
    SET niam = v_niam, jabatan_code_id = p_jabatan_code_id
    WHERE id = p_crew_id;
    
    RETURN v_niam;
END;
$$;


--
-- Name: generate_nip(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_nip(p_claim_id uuid, p_region_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
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
    
    -- Format NIP: YYRRXXX (clean format without dots)
    v_nip := v_year || v_region_code || LPAD(v_sequence::TEXT, 3, '0');
    
    -- Update the claim with the NIP
    UPDATE public.pesantren_claims
    SET mpj_id_number = v_nip
    WHERE id = p_claim_id;
    
    RETURN v_nip;
END;
$_$;


--
-- Name: get_user_claim_status(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_claim_status(_user_id uuid) RETURNS public.claim_status
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT status
  FROM public.pesantren_claims
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: get_user_region_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_region_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT region_id
    FROM public.profiles
    WHERE id = _user_id
$$;


--
-- Name: get_user_status(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_status(_user_id uuid) RETURNS public.account_status
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT status_account
    FROM public.profiles
    WHERE id = _user_id
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: has_approved_claim(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_approved_claim(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pesantren_claims
    WHERE user_id = _user_id
      AND status IN ('approved', 'pusat_approved')
  )
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;


--
-- Name: migrate_legacy_account(uuid, uuid, uuid, text, text, text, text, public.account_status, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_legacy_account(p_user_id uuid, p_city_id uuid, p_region_id uuid, p_nama_pesantren text, p_nama_pengasuh text, p_alamat_singkat text, p_no_wa_pendaftar text, p_status_account public.account_status DEFAULT 'active'::public.account_status, p_nip text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: sync_role_to_profiles(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_role_to_profiles() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: update_crew_niam(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_crew_niam() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_role_code TEXT;
    v_nip TEXT;
    v_nip_clean TEXT;
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
            v_sequence_part := RIGHT(OLD.niam, 2);
            
            -- Get clean NIP from pesantren_claims
            SELECT REPLACE(pc.mpj_id_number, '.', '') INTO v_nip_clean
            FROM public.pesantren_claims pc
            WHERE pc.user_id = NEW.profile_id
              AND pc.mpj_id_number IS NOT NULL
            LIMIT 1;
            
            IF v_nip_clean IS NOT NULL AND v_sequence_part IS NOT NULL THEN
                -- Format: ROLENIPCLEANSEQUENCE
                v_new_niam := v_role_code || v_nip_clean || v_sequence_part;
                NEW.niam := v_new_niam;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    region_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    nama text NOT NULL,
    jabatan text,
    skill text[],
    xp_level integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    niam text,
    jabatan_code_id uuid
);


--
-- Name: follow_up_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.follow_up_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    claim_id uuid NOT NULL,
    region_id uuid NOT NULL,
    action_type text DEFAULT 'whatsapp_followup'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: jabatan_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jabatan_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: otp_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_phone text NOT NULL,
    otp_code text NOT NULL,
    pesantren_claim_id uuid,
    is_verified boolean DEFAULT false NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    verified_at timestamp with time zone
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    pesantren_claim_id uuid NOT NULL,
    base_amount integer NOT NULL,
    unique_code integer NOT NULL,
    total_amount integer NOT NULL,
    proof_file_url text,
    status public.payment_verification_status DEFAULT 'pending_payment'::public.payment_verification_status NOT NULL,
    rejection_reason text,
    verified_by uuid,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT payments_unique_code_check CHECK (((unique_code >= 100) AND (unique_code <= 999)))
);


--
-- Name: pesantren_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pesantren_claims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    pesantren_name text NOT NULL,
    status public.claim_status DEFAULT 'pending'::public.claim_status NOT NULL,
    region_id uuid,
    claimed_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    approved_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    dokumen_bukti_url text,
    kecamatan text,
    nama_pengelola text,
    email_pengelola text,
    jenis_pengajuan public.registration_type DEFAULT 'pesantren_baru'::public.registration_type NOT NULL,
    mpj_id_number text,
    regional_approved_at timestamp with time zone
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    city_id uuid,
    region_id uuid,
    status_account public.account_status DEFAULT 'pending'::public.account_status NOT NULL,
    profile_level public.profile_level DEFAULT 'basic'::public.profile_level NOT NULL,
    nip text,
    nama_pesantren text,
    nama_pengasuh text,
    alamat_singkat text,
    no_wa_pendaftar text,
    nama_media text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    logo_url text,
    foto_pengasuh_url text,
    sk_pesantren_url text,
    social_links jsonb DEFAULT '{}'::jsonb,
    sejarah text,
    visi_misi text,
    jumlah_santri integer,
    tipe_pesantren text,
    program_unggulan text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    status_payment public.payment_status DEFAULT 'unpaid'::public.payment_status NOT NULL
);


--
-- Name: regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: crews crews_niam_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_niam_key UNIQUE (niam);


--
-- Name: crews crews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_pkey PRIMARY KEY (id);


--
-- Name: follow_up_logs follow_up_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follow_up_logs
    ADD CONSTRAINT follow_up_logs_pkey PRIMARY KEY (id);


--
-- Name: jabatan_codes jabatan_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jabatan_codes
    ADD CONSTRAINT jabatan_codes_code_key UNIQUE (code);


--
-- Name: jabatan_codes jabatan_codes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jabatan_codes
    ADD CONSTRAINT jabatan_codes_name_key UNIQUE (name);


--
-- Name: jabatan_codes jabatan_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jabatan_codes
    ADD CONSTRAINT jabatan_codes_pkey PRIMARY KEY (id);


--
-- Name: otp_verifications otp_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_user_id_pesantren_claim_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_pesantren_claim_id_key UNIQUE (user_id, pesantren_claim_id);


--
-- Name: pesantren_claims pesantren_claims_mpj_id_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesantren_claims
    ADD CONSTRAINT pesantren_claims_mpj_id_number_key UNIQUE (mpj_id_number);


--
-- Name: pesantren_claims pesantren_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesantren_claims
    ADD CONSTRAINT pesantren_claims_pkey PRIMARY KEY (id);


--
-- Name: pesantren_claims pesantren_claims_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesantren_claims
    ADD CONSTRAINT pesantren_claims_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_nip_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_nip_key UNIQUE (nip);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: regions regions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_code_key UNIQUE (code);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key UNIQUE (key);


--
-- Name: system_settings system_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_unique UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_follow_up_logs_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_follow_up_logs_admin ON public.follow_up_logs USING btree (admin_id);


--
-- Name: idx_follow_up_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_follow_up_logs_created ON public.follow_up_logs USING btree (created_at);


--
-- Name: idx_follow_up_logs_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_follow_up_logs_region ON public.follow_up_logs USING btree (region_id);


--
-- Name: idx_otp_verifications_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_verifications_expires ON public.otp_verifications USING btree (expires_at);


--
-- Name: idx_otp_verifications_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_verifications_phone ON public.otp_verifications USING btree (user_phone);


--
-- Name: idx_pesantren_claims_regional_approved_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pesantren_claims_regional_approved_at ON public.pesantren_claims USING btree (regional_approved_at) WHERE (regional_approved_at IS NOT NULL);


--
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- Name: idx_profiles_status_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_status_account ON public.profiles USING btree (status_account);


--
-- Name: idx_profiles_status_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_status_payment ON public.profiles USING btree (status_payment);


--
-- Name: user_roles sync_role_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_role_trigger AFTER INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.sync_role_to_profiles();


--
-- Name: profiles trigger_enforce_region_immutability; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_enforce_region_immutability BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.enforce_region_immutability();


--
-- Name: crews trigger_update_crew_niam; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_crew_niam BEFORE UPDATE ON public.crews FOR EACH ROW EXECUTE FUNCTION public.update_crew_niam();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pesantren_claims update_pesantren_claims_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pesantren_claims_updated_at BEFORE UPDATE ON public.pesantren_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: system_settings update_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cities cities_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE RESTRICT;


--
-- Name: crews crews_jabatan_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_jabatan_code_id_fkey FOREIGN KEY (jabatan_code_id) REFERENCES public.jabatan_codes(id);


--
-- Name: crews crews_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: follow_up_logs follow_up_logs_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follow_up_logs
    ADD CONSTRAINT follow_up_logs_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.pesantren_claims(id) ON DELETE CASCADE;


--
-- Name: follow_up_logs follow_up_logs_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follow_up_logs
    ADD CONSTRAINT follow_up_logs_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: otp_verifications otp_verifications_pesantren_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pesantren_claim_id_fkey FOREIGN KEY (pesantren_claim_id) REFERENCES public.pesantren_claims(id) ON DELETE CASCADE;


--
-- Name: payments payments_pesantren_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pesantren_claim_id_fkey FOREIGN KEY (pesantren_claim_id) REFERENCES public.pesantren_claims(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id);


--
-- Name: pesantren_claims pesantren_claims_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesantren_claims
    ADD CONSTRAINT pesantren_claims_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: pesantren_claims pesantren_claims_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesantren_claims
    ADD CONSTRAINT pesantren_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE RESTRICT;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles Admin finance can update account status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin finance can update account status" ON public.profiles FOR UPDATE USING ((public.has_role(auth.uid(), 'admin_finance'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status))) WITH CHECK ((public.has_role(auth.uid(), 'admin_finance'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: payments Admin finance can update payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin finance can update payments" ON public.payments FOR UPDATE USING ((public.has_role(auth.uid(), 'admin_finance'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status))) WITH CHECK ((public.has_role(auth.uid(), 'admin_finance'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: payments Admin finance can view all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin finance can view all payments" ON public.payments FOR SELECT USING ((public.has_role(auth.uid(), 'admin_finance'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: profiles Admin finance can view pending profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin finance can view pending profiles" ON public.profiles FOR SELECT USING ((public.has_role(auth.uid(), 'admin_finance'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: crews Admin pusat can manage all crews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can manage all crews" ON public.crews USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: user_roles Admin pusat can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin_pusat'::public.app_role));


--
-- Name: cities Admin pusat can manage cities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can manage cities" ON public.cities USING (public.has_role(auth.uid(), 'admin_pusat'::public.app_role));


--
-- Name: jabatan_codes Admin pusat can manage jabatan codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can manage jabatan codes" ON public.jabatan_codes USING (public.has_role(auth.uid(), 'admin_pusat'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin_pusat'::public.app_role));


--
-- Name: regions Admin pusat can manage regions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can manage regions" ON public.regions USING (public.has_role(auth.uid(), 'admin_pusat'::public.app_role));


--
-- Name: system_settings Admin pusat can manage settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can manage settings" ON public.system_settings USING (public.has_role(auth.uid(), 'admin_pusat'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin_pusat'::public.app_role));


--
-- Name: profiles Admin pusat can update all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can update all profiles" ON public.profiles FOR UPDATE USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status))) WITH CHECK ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: pesantren_claims Admin pusat can update claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can update claims" ON public.pesantren_claims FOR UPDATE USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: payments Admin pusat can update payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can update payments" ON public.payments FOR UPDATE USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status))) WITH CHECK ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: pesantren_claims Admin pusat can view all claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can view all claims" ON public.pesantren_claims FOR SELECT USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: follow_up_logs Admin pusat can view all follow-up logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can view all follow-up logs" ON public.follow_up_logs FOR SELECT USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: payments Admin pusat can view all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can view all payments" ON public.payments FOR SELECT USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: profiles Admin pusat can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin pusat can view all profiles" ON public.profiles FOR SELECT USING ((public.has_role(auth.uid(), 'admin_pusat'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: follow_up_logs Admin regional can insert own follow-up logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin regional can insert own follow-up logs" ON public.follow_up_logs FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status) AND (admin_id = auth.uid()) AND (region_id = public.get_user_region_id(auth.uid()))));


--
-- Name: pesantren_claims Admin regional can update region claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin regional can update region claims" ON public.pesantren_claims FOR UPDATE USING ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status) AND (region_id = public.get_user_region_id(auth.uid()))));


--
-- Name: profiles Admin regional can update status in their region; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin regional can update status in their region" ON public.profiles FOR UPDATE USING ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (region_id = public.get_user_region_id(auth.uid())) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status))) WITH CHECK ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (region_id = public.get_user_region_id(auth.uid())) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: crews Admin regional can view crews in region; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin regional can view crews in region" ON public.crews FOR SELECT USING ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = crews.profile_id) AND (p.region_id = public.get_user_region_id(auth.uid())))))));


--
-- Name: profiles Admin regional can view profiles in their region; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin regional can view profiles in their region" ON public.profiles FOR SELECT USING ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (region_id = public.get_user_region_id(auth.uid())) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: pesantren_claims Admin regional can view region claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin regional can view region claims" ON public.pesantren_claims FOR SELECT USING ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status) AND (region_id = public.get_user_region_id(auth.uid()))));


--
-- Name: follow_up_logs Admin regional can view region follow-up logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin regional can view region follow-up logs" ON public.follow_up_logs FOR SELECT USING ((public.has_role(auth.uid(), 'admin_regional'::public.app_role) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status) AND (region_id = public.get_user_region_id(auth.uid()))));


--
-- Name: cities Anyone can read cities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT USING (true);


--
-- Name: jabatan_codes Anyone can read jabatan codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read jabatan codes" ON public.jabatan_codes FOR SELECT USING (true);


--
-- Name: regions Anyone can read regions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read regions" ON public.regions FOR SELECT USING (true);


--
-- Name: system_settings Anyone can read settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read settings" ON public.system_settings FOR SELECT USING (true);


--
-- Name: otp_verifications No direct delete access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No direct delete access" ON public.otp_verifications FOR DELETE USING (false);


--
-- Name: otp_verifications No direct insert access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No direct insert access" ON public.otp_verifications FOR INSERT WITH CHECK (false);


--
-- Name: otp_verifications No direct update access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No direct update access" ON public.otp_verifications FOR UPDATE USING (false) WITH CHECK (false);


--
-- Name: pesantren_claims Users can create own claim; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own claim" ON public.pesantren_claims FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (NOT (EXISTS ( SELECT 1
   FROM public.pesantren_claims pesantren_claims_1
  WHERE (pesantren_claims_1.user_id = auth.uid()))))));


--
-- Name: payments Users can insert own payment; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own payment" ON public.payments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: crews Users can manage own organization crews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own organization crews" ON public.crews USING (((profile_id = auth.uid()) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: payments Users can update own pending payment; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own pending payment" ON public.payments FOR UPDATE USING (((auth.uid() = user_id) AND (status = ANY (ARRAY['pending_payment'::public.payment_verification_status, 'pending_verification'::public.payment_verification_status])))) WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile (restricted fields); Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile (restricted fields)" ON public.profiles FOR UPDATE USING (((auth.uid() = id) AND (status_account = 'active'::public.account_status))) WITH CHECK (((auth.uid() = id) AND (status_account = 'active'::public.account_status)));


--
-- Name: otp_verifications Users can view own OTP verification status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own OTP verification status" ON public.otp_verifications FOR SELECT USING (false);


--
-- Name: pesantren_claims Users can view own claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own claims" ON public.pesantren_claims FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: crews Users can view own organization crews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own organization crews" ON public.crews FOR SELECT USING (((profile_id = auth.uid()) AND (public.get_user_status(auth.uid()) = 'active'::public.account_status)));


--
-- Name: payments Users can view own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile regardless of status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile regardless of status" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: cities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

--
-- Name: crews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

--
-- Name: follow_up_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.follow_up_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: jabatan_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jabatan_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: otp_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: pesantren_claims; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pesantren_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: regions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

--
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;