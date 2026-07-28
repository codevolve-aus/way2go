import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString =
  process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding reference data...");

  // Vehicle Categories
  const categories = [
    { name: "Economy", description: "Small, fuel-efficient vehicles" },
    { name: "Compact", description: "Mid-size sedans and hatchbacks" },
    { name: "SUV", description: "Sport utility vehicles" },
    { name: "People Mover", description: "Vans and people movers for large groups" },
    { name: "Ute / Truck", description: "Utility vehicles and light trucks" },
    { name: "Luxury", description: "Premium and prestige vehicles" },
    { name: "Electric", description: "Battery electric vehicles" },
  ];

  for (const cat of categories) {
    await db.vehicleCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} vehicle categories`);

  // Locations
  const locations = [
    {
      name: "Sydney CBD",
      address: "100 George Street",
      city: "Sydney",
      state: "NSW",
      postcode: "2000",
      phone: "+61 2 9876 5432",
    },
    {
      name: "Parramatta",
      address: "45 Church Street",
      city: "Parramatta",
      state: "NSW",
      postcode: "2150",
      phone: "+61 2 9891 2345",
    },
    {
      name: "Sydney Airport",
      address: "Terminal 1, Sydney Airport",
      city: "Mascot",
      state: "NSW",
      postcode: "2020",
      phone: "+61 2 9700 8899",
    },
  ];

  for (const loc of locations) {
    const existing = await db.location.findFirst({ where: { name: loc.name } });
    if (!existing) {
      await db.location.create({ data: loc });
    }
  }
  console.log(`✓ ${locations.length} locations`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
