
-- ============================================
-- DISABLE RLS ON ALL TABLES
-- ============================================

-- 1. DROP ALL RLS POLICIES

-- profiles
DROP POLICY IF EXISTS "Admin finance can update account status" ON public.profiles;
DROP POLICY IF EXISTS "Admin finance can view pending profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin pusat can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin pusat can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin regional can update status in their region" ON public.profiles;
DROP POLICY IF EXISTS "Admin regional can view profiles in their region" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile (restricted fields)" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile regardless of status" ON public.profiles;

-- user_roles
DROP POLICY IF EXISTS "Admin pusat can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- pesantren_claims
DROP POLICY IF EXISTS "Admin pusat can update claims" ON public.pesantren_claims;
DROP POLICY IF EXISTS "Admin pusat can view all claims" ON public.pesantren_claims;
DROP POLICY IF EXISTS "Admin regional can update region claims" ON public.pesantren_claims;
DROP POLICY IF EXISTS "Admin regional can view region claims" ON public.pesantren_claims;
DROP POLICY IF EXISTS "Users can create own claim" ON public.pesantren_claims;
DROP POLICY IF EXISTS "Users can view own claims" ON public.pesantren_claims;

-- payments
DROP POLICY IF EXISTS "Admin finance can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admin finance can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admin pusat can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admin pusat can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payment" ON public.payments;
DROP POLICY IF EXISTS "Users can update own pending payment" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- crews
DROP POLICY IF EXISTS "Admin pusat can manage all crews" ON public.crews;
DROP POLICY IF EXISTS "Admin regional can view crews in region" ON public.crews;
DROP POLICY IF EXISTS "Users can manage own organization crews" ON public.crews;
DROP POLICY IF EXISTS "Users can view own organization crews" ON public.crews;

-- otp_verifications
DROP POLICY IF EXISTS "No direct delete access" ON public.otp_verifications;
DROP POLICY IF EXISTS "No direct insert access" ON public.otp_verifications;
DROP POLICY IF EXISTS "No direct update access" ON public.otp_verifications;
DROP POLICY IF EXISTS "Users can view own OTP verification status" ON public.otp_verifications;

-- follow_up_logs
DROP POLICY IF EXISTS "Admin pusat can view all follow-up logs" ON public.follow_up_logs;
DROP POLICY IF EXISTS "Admin regional can insert own follow-up logs" ON public.follow_up_logs;
DROP POLICY IF EXISTS "Admin regional can view region follow-up logs" ON public.follow_up_logs;

-- regions
DROP POLICY IF EXISTS "Admin pusat can manage regions" ON public.regions;
DROP POLICY IF EXISTS "Anyone can read regions" ON public.regions;

-- cities
DROP POLICY IF EXISTS "Admin pusat can manage cities" ON public.cities;
DROP POLICY IF EXISTS "Anyone can read cities" ON public.cities;

-- jabatan_codes
DROP POLICY IF EXISTS "Admin pusat can manage jabatan codes" ON public.jabatan_codes;
DROP POLICY IF EXISTS "Anyone can read jabatan codes" ON public.jabatan_codes;

-- system_settings
DROP POLICY IF EXISTS "Admin pusat can manage settings" ON public.system_settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON public.system_settings;

-- storage policies
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admin finance can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admin pusat can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin regional can view registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin pusat can view registration documents" ON storage.objects;

-- 2. DISABLE RLS ON ALL TABLES
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesantren_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jabatan_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;
