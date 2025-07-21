-- Database schema for Cloudflare D1
CREATE TABLE IF NOT EXISTS FoodItems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  processed TEXT CHECK(processed IN ('low', 'medium', 'high')) NOT NULL
);

CREATE TABLE IF NOT EXISTS Meals (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')) NOT NULL,
  totalCalories REAL NOT NULL,
  totalProtein REAL NOT NULL,
  totalCarbs REAL NOT NULL,
  totalFat REAL NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS MealItems (
  mealId TEXT NOT NULL,
  foodItemId TEXT NOT NULL,
  FOREIGN KEY (mealId) REFERENCES Meals(id),
  FOREIGN KEY (foodItemId) REFERENCES FoodItems(id),
  PRIMARY KEY (mealId, foodItemId)
);

CREATE TABLE IF NOT EXISTS PantryItems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  isScanned INTEGER NOT NULL DEFAULT 0,
  barcode TEXT,
  userId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  type TEXT CHECK(type IN ('AI', 'DB', 'Basic')) NOT NULL
);

CREATE TABLE IF NOT EXISTS RecipeIngredients (
  recipeId TEXT NOT NULL,
  ingredient TEXT NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES Recipes(id),
  PRIMARY KEY (recipeId, ingredient)
);

CREATE TABLE IF NOT EXISTS Groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS GroupMembers (
  groupId TEXT NOT NULL,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  avatarUrl TEXT,
  FOREIGN KEY (groupId) REFERENCES Groups(id),
  PRIMARY KEY (groupId, userId)
);

CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT CHECK(goal IN ('weight-loss', 'muscle-gain', 'maintenance', 'health')),
  avatarUrl TEXT
);

CREATE TABLE IF NOT EXISTS UserAllergies (
  userId TEXT NOT NULL,
  allergy TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id),
  PRIMARY KEY (userId, allergy)
);

CREATE TABLE IF NOT EXISTS UserPreferences (
  userId TEXT NOT NULL,
  preference TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id),
  PRIMARY KEY (userId, preference)
);

CREATE TABLE IF NOT EXISTS UserIntolerances (
  userId TEXT NOT NULL,
  intolerance TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id),
  PRIMARY KEY (userId, intolerance)
);
