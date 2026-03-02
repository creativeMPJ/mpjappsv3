-- CreateEnum
CREATE TYPE "public"."PricingCategory" AS ENUM ('registration', 'renewal', 'upgrade');

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "pricing_package_id" UUID;

-- CreateTable
CREATE TABLE "public"."pricing_packages" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "public"."PricingCategory" NOT NULL,
    "harga_paket" INTEGER NOT NULL,
    "harga_diskon" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pricing_packages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_pricing_package_id_fkey" FOREIGN KEY ("pricing_package_id") REFERENCES "public"."pricing_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
