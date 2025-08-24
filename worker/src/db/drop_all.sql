PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `accounts`;
DROP TABLE IF EXISTS `verifications`;
DROP TABLE IF EXISTS `meal_items`;
DROP TABLE IF EXISTS `meals`;
DROP TABLE IF EXISTS `group_members`;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS `pantry_items`;
DROP TABLE IF EXISTS `recipe_ingredients`;
DROP TABLE IF EXISTS `recipes`;
DROP TABLE IF EXISTS `user_intolerances`;
DROP TABLE IF EXISTS `user_preferences`;
DROP TABLE IF EXISTS `user_allergies`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `food_items`;
DROP TABLE IF EXISTS `users`;

PRAGMA foreign_keys = ON;