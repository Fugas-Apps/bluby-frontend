import { Hono } from 'hono';
import { authMiddleware, AuthUser } from '../middleware/auth';
import { Env } from '../auth';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db';
import { meals as mealsTable, mealItems, foodItems } from '../db/schema';

const meals = new Hono<{ Bindings: Env; Variables: { user: AuthUser } }>();

// Get user meals
meals.get('/', authMiddleware, async (c) => {
  const user = c.var.user;
  const db = await getDb(c.env);

  try {
    // Get meals with their associated food items
    const userMeals = await db
      .select({
        id: mealsTable.id,
        type: mealsTable.type,
        totalCalories: mealsTable.totalCalories,
        totalProtein: mealsTable.totalProtein,
        totalCarbs: mealsTable.totalCarbs,
        totalFat: mealsTable.totalFat,
        createdAt: mealsTable.createdAt,
      })
      .from(mealsTable)
      .where(eq(mealsTable.userId, user.id))
      .orderBy(mealsTable.createdAt);

    // For each meal, get the associated food items
    const mealsWithItems = await Promise.all(
      userMeals.map(async (meal) => {
        const mealItemsData = await db
          .select({
            foodItems: foodItems,
          })
          .from(mealItems)
          .leftJoin(foodItems, eq(mealItems.foodItemId, foodItems.id))
          .where(eq(mealItems.mealId, meal.id));

        return {
          ...meal,
          foodItems: mealItemsData.map(item => item.foodItems).filter(Boolean),
        };
      })
    );

    return c.json(mealsWithItems);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return c.json({ error: 'Failed to fetch meals' }, 500);
  }
});

// Create a new meal
meals.post('/', authMiddleware, async (c) => {
  const user = c.var.user;
  const db = await getDb(c.env);
  const body = await c.req.json();

  try {
    const { type, foodItemIds } = body;

    if (!type || !Array.isArray(foodItemIds)) {
      return c.json({ error: 'Invalid request body' }, 400);
    }

    // Fetch the food items to calculate totals
    const foodItemsData = [];
    for (const foodItemId of foodItemIds) {
      const item = await db
        .select()
        .from(foodItems)
        .where(eq(foodItems.id, foodItemId))
        .limit(1);
      if (item.length > 0) {
        foodItemsData.push(item[0]);
      }
    }

    if (foodItemsData.length === 0) {
      return c.json({ error: 'No valid food items found' }, 400);
    }

    // Calculate totals
    const totals = foodItemsData.reduce(
      (acc, item) => ({
        totalCalories: acc.totalCalories + item.calories,
        totalProtein: acc.totalProtein + item.protein,
        totalCarbs: acc.totalCarbs + item.carbs,
        totalFat: acc.totalFat + item.fat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );

    // Create the meal
    const newMeal = await db
      .insert(mealsTable)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        type,
        totalCalories: totals.totalCalories,
        totalProtein: totals.totalProtein,
        totalCarbs: totals.totalCarbs,
        totalFat: totals.totalFat,
      })
      .returning();

    if (!newMeal || newMeal.length === 0) {
      return c.json({ error: 'Failed to create meal' }, 500);
    }

    // Create meal items
    const mealItemInserts = foodItemIds.map((foodItemId: string) => ({
      mealId: newMeal[0].id,
      foodItemId,
    }));

    await db.insert(mealItems).values(mealItemInserts);

    // Return the created meal with food items
    return c.json({
      ...newMeal[0],
      foodItems: foodItemsData,
    });
  } catch (error) {
    console.error('Error creating meal:', error);
    return c.json({ error: 'Failed to create meal' }, 500);
  }
});

// Get a specific meal by ID
meals.get('/:mealId', authMiddleware, async (c) => {
  const user = c.var.user;
  const db = await getDb(c.env);
  const mealId = c.req.param('mealId');

  try {
    // Get the meal first
    const mealInfo = await db
      .select()
      .from(mealsTable)
      .where(and(eq(mealsTable.id, mealId), eq(mealsTable.userId, user.id)))
      .limit(1);

    if (mealInfo.length === 0) {
      return c.json({ error: 'Meal not found' }, 404);
    }

    // Get the food items for this meal
    const mealItemsData = await db
      .select({
        foodItems: foodItems,
      })
      .from(mealItems)
      .leftJoin(foodItems, eq(mealItems.foodItemId, foodItems.id))
      .where(eq(mealItems.mealId, mealId));

    const meal = {
      ...mealInfo[0],
      foodItems: mealItemsData.map(item => item.foodItems).filter(Boolean),
    };

    return c.json(meal);
  } catch (error) {
    console.error('Error fetching meal:', error);
    return c.json({ error: 'Failed to fetch meal' }, 500);
  }
});

// Delete a meal
meals.delete('/:mealId', authMiddleware, async (c) => {
  const user = c.var.user;
  const db = await getDb(c.env);
  const mealId = c.req.param('mealId');

  try {
    const result = await db
      .delete(mealsTable)
      .where(and(eq(mealsTable.id, mealId), eq(mealsTable.userId, user.id)))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Meal not found' }, 404);
    }

    return c.json({ success: true, deletedMeal: result[0] });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return c.json({ error: 'Failed to delete meal' }, 500);
  }
});

export default meals;
