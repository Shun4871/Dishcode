import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer("user_id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  clerkId: text("clerk_id").notNull().unique(), // ClerkのユーザーID
  email: text("email"),
  birthday: text("birthday"), 
  gender: text("gender"),     
});

export const favorite = sqliteTable("favorite", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  recipeURL: text("recipe_url").notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
});

export const searchLog = sqliteTable('search_log', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  clerkId: text('clerk_id').notNull(),
  people: integer('people', { mode: 'number' }).notNull(),
  oven: integer('oven').notNull(),
  hotplate: integer('hotplate').notNull(),
  mixer: integer('mixer').notNull(),
  time: integer('time', { mode: 'number' }).notNull(),
  toaster: integer('toaster').notNull(),
  pressurecooker: integer('pressurecooker').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
});