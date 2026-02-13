-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'active', 'rejected');

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('user', 'admin_regional', 'admin_pusat', 'admin_finance');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'regional_approved', 'pusat_approved', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'unpaid');

-- CreateEnum
CREATE TYPE "PaymentVerificationStatus" AS ENUM ('pending_payment', 'pending_verification', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "ProfileLevel" AS ENUM ('basic', 'silver', 'gold', 'platinum');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('klaim', 'pesantren_baru');

-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "region_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'user',
    "status_account" "AccountStatus" NOT NULL DEFAULT 'pending',
    "status_payment" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "profile_level" "ProfileLevel" NOT NULL DEFAULT 'basic',
    "nama_pesantren" TEXT,
    "nama_pengasuh" TEXT,
    "nama_media" TEXT,
    "alamat_singkat" TEXT,
    "no_wa_pendaftar" TEXT,
    "nip" TEXT,
    "city_id" UUID,
    "region_id" UUID,
    "logo_url" TEXT,
    "foto_pengasuh_url" TEXT,
    "sk_pesantren_url" TEXT,
    "latitude" DECIMAL,
    "longitude" DECIMAL,
    "jumlah_santri" INTEGER,
    "tipe_pesantren" TEXT,
    "program_unggulan" TEXT[],
    "sejarah" TEXT,
    "visi_misi" TEXT,
    "social_links" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesantren_claims" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pesantren_name" TEXT NOT NULL,
    "jenis_pengajuan" "RegistrationType" NOT NULL DEFAULT 'pesantren_baru',
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "region_id" UUID,
    "kecamatan" TEXT,
    "nama_pengelola" TEXT,
    "email_pengelola" TEXT,
    "dokumen_bukti_url" TEXT,
    "mpj_id_number" TEXT,
    "notes" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "regional_approved_at" TIMESTAMPTZ(6),
    "claimed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pesantren_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pesantren_claim_id" UUID NOT NULL,
    "base_amount" INTEGER NOT NULL,
    "unique_code" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "status" "PaymentVerificationStatus" NOT NULL DEFAULT 'pending_payment',
    "proof_file_url" TEXT,
    "rejection_reason" TEXT,
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jabatan_codes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jabatan_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crews" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT,
    "jabatan_code_id" UUID,
    "niam" TEXT,
    "skill" TEXT[],
    "xp_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "crews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" UUID NOT NULL,
    "user_phone" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "pesantren_claim_id" UUID,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "claim_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "action_type" TEXT NOT NULL DEFAULT 'whatsapp_followup',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesantren_claims" ADD CONSTRAINT "pesantren_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesantren_claims" ADD CONSTRAINT "pesantren_claims_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_pesantren_claim_id_fkey" FOREIGN KEY ("pesantren_claim_id") REFERENCES "pesantren_claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crews" ADD CONSTRAINT "crews_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crews" ADD CONSTRAINT "crews_jabatan_code_id_fkey" FOREIGN KEY ("jabatan_code_id") REFERENCES "jabatan_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_pesantren_claim_id_fkey" FOREIGN KEY ("pesantren_claim_id") REFERENCES "pesantren_claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_logs" ADD CONSTRAINT "follow_up_logs_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "pesantren_claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_logs" ADD CONSTRAINT "follow_up_logs_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
