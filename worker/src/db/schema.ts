/**
 * Drizzle schema entrypoint
 * ------------------------
 * This file exports table definitions and a combined `schema` object which
 * drizzle-kit reads to generate SQL migrations.
 *
 * Workflow (production-safe):
 * 1. Make a small, explicit change in these TypeScript table definitions.
 *    e.g. add/remove a column on a table.
 * 2. Run `npm run drizzle:migrate` (in the `worker/` folder). This runs
 *    `drizzle-kit generate` and creates a timestamped SQL migration in
 *    the `worker/drizzle/` folder. It does NOT modify your runtime
 *    `src/db/schema.sql` (no merging).
 * 3. Inspect the generated SQL file under `worker/drizzle/` and, when
 *    ready, apply it to D1 with `npm run drizzle:apply -- <path-to-sql>`
 *    (or use `npx wrangler d1 execute` yourself). Keep backups and run
 *    these commands from CI or a secure environment with Cloudflare creds.
 */

import { sql } from 'drizzle-orm';
import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

// Import Better Auth schema
import * as authSchema from './auth.schema';

const { users, sessions, accounts, verifications } = authSchema;

export { users, sessions, accounts, verifications };

// Your existing app schema
export const foodItems = sqliteTable('food_items', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    calories: integer('calories').notNull(),
    protein: integer('protein').notNull(),
    carbs: integer('carbs').notNull(),
    fat: integer('fat').notNull(),

    // Micronutrients
    vitamins: text('vitamins'), // JSON string with vitamin data
    minerals: text('minerals'), // JSON string with mineral data

    // Enhanced nutritional data
    fiber: integer('fiber'),
    sugar: integer('sugar'),
    sodium: integer('sodium'),
    potassium: integer('potassium'),
    calcium: integer('calcium'),
    iron: integer('iron'),
    magnesium: integer('magnesium'),
    zinc: integer('zinc'),
    selenium: integer('selenium'),
    vitaminC: integer('vitamin_c'),
    vitaminD: integer('vitamin_d'),
    vitaminE: integer('vitamin_e'),
    vitaminK: integer('vitamin_k'),
    vitaminA: integer('vitamin_a'),
    vitaminB1: integer('vitamin_b1'), // Thiamin
    vitaminB2: integer('vitamin_b2'), // Riboflavin
    vitaminB3: integer('vitamin_b3'), // Niacin
    vitaminB6: integer('vitamin_b6'),
    vitaminB12: integer('vitamin_b12'),
    folate: integer('folate'),

    processed: text('processed').notNull(),

    // Allow users to add custom nutrients
    customNutrients: text('custom_nutrients'), // JSON string for user-defined nutrients
});

export const meals = sqliteTable('meals', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    totalCalories: integer('total_calories').notNull(),
    totalProtein: integer('total_protein').notNull(),
    totalCarbs: integer('total_carbs').notNull(),
    totalFat: integer('total_fat').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const mealItems = sqliteTable('meal_items', {
    mealId: text('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
    foodItemId: text('food_item_id').notNull().references(() => foodItems.id, { onDelete: 'cascade' }),
});

export const pantryItems = sqliteTable('pantry_items', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    quantity: integer('quantity').notNull().default(1),
    isScanned: integer('is_scanned', { mode: 'boolean' }).default(false),
    barcode: text('barcode'),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const recipes = sqliteTable('recipes', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    calories: integer('calories').notNull(),
    protein: integer('protein').notNull(),
    carbs: integer('carbs').notNull(),
    fat: integer('fat').notNull(),
    type: text('type').notNull(),
});

export const recipeIngredients = sqliteTable('recipe_ingredients', {
    recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
    ingredient: text('ingredient').notNull(),
});

export const groups = sqliteTable('groups', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
});

export const groupMembers = sqliteTable('group_members', {
    groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
});

export const userProfiles = sqliteTable('user_profiles', {
    userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    goal: text('goal'),
    avatarUrl: text('avatar_url'),
});

export const userAllergies = sqliteTable('user_allergies', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    allergy: text('allergy').notNull(),
});

export const userPreferences = sqliteTable('user_preferences', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    preference: text('preference').notNull(),
});

export const userIntolerances = sqliteTable('user_intolerances', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    intolerance: text('intolerance').notNull(),
});

// Combined schema for migrations
export const schema = {
    ...authSchema,
    foodItems,
    meals,
    mealItems,
    pantryItems,
    recipes,
    recipeIngredients,
    groups,
    groupMembers,
    userProfiles,
    userAllergies,
    userPreferences,
    userIntolerances,
} as const;
