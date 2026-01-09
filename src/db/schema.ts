import { pgTable, uuid, text, primaryKey } from "drizzle-orm/pg-core";

// Items table - the main table we're syncing
export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id").notNull(),
  categoryId: uuid("category_id").notNull(),
});

// User's subscribed categories - changes to this table trigger the bug
export const userCategories = pgTable(
  "user_categories",
  {
    userId: uuid("user_id").notNull(),
    categoryId: uuid("category_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.categoryId] })]
);
