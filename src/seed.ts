import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { items, userCategories } from "./db/schema";

const client = postgres("postgresql://postgres:postgres@localhost:5432/electric_bug");
const db = drizzle(client);

// Fixed IDs for reproducibility
const USER_ID = "00000000-0000-0000-0000-000000000001";
const CATEGORY_ID = "00000000-0000-0000-0000-000000000002";
const ITEM_ID = "00000000-0000-0000-0000-000000000003";

async function seed() {
  console.log("Cleaning up...");
  await db.delete(items);
  await db.delete(userCategories);

  console.log("Creating item...");
  await db.insert(items).values({
    id: ITEM_ID,
    name: "Test Item",
    ownerId: USER_ID,      // User owns this item
    categoryId: CATEGORY_ID, // Item is in this category
  });

  console.log("Creating user category subscription...");
  await db.insert(userCategories).values({
    userId: USER_ID,
    categoryId: CATEGORY_ID, // User is subscribed to this category
  });

  console.log("\nInitial state:");
  console.log("- Item exists with owner_id = USER_ID and category_id = CATEGORY_ID");
  console.log("- User is subscribed to CATEGORY_ID");
  console.log("- Item matches BOTH conditions of the OR clause:");
  console.log("  1. category_id IN (SELECT category_id FROM user_categories WHERE user_id = USER_ID)");
  console.log("  2. owner_id = USER_ID");
  console.log("\nSeeding complete!");

  await client.end();
}

seed().catch(console.error);
