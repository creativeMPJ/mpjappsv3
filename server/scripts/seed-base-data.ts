import "dotenv/config";
import { prisma } from "../prisma";

async function main() {
  let region = await prisma.region.findFirst({ where: { code: "35" } });
  if (!region) {
    region = await prisma.region.create({
      data: { name: "Jawa Timur", code: "35" },
    });
  }

  const cityExists = await prisma.city.findFirst({
    where: { name: "Kota Surabaya", regionId: region.id },
  });

  if (!cityExists) {
    await prisma.city.create({
      data: { name: "Kota Surabaya", regionId: region.id },
    });
  }

  const regSetting = await prisma.systemSetting.findFirst({ where: { key: "registration_base_price" } });
  if (!regSetting) {
    await prisma.systemSetting.create({
      data: {
        key: "registration_base_price",
        value: 50000,
        description: "Harga dasar pendaftaran pesantren baru",
      },
    });
  }

  const claimSetting = await prisma.systemSetting.findFirst({ where: { key: "claim_base_price" } });
  if (!claimSetting) {
    await prisma.systemSetting.create({
      data: {
        key: "claim_base_price",
        value: 20000,
        description: "Harga dasar klaim akun lama",
      },
    });
  }

  console.log("Base data ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
