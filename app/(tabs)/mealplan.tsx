import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '~/components/common/Screen'; // Updated path
import { Card } from '~/components/ui/Card'; // Updated path
import { Button } from '~/components/ui/Button'; // Updated path
import { mockRecipes } from '~/utils/mockData'; // Updated path
import { Ionicons } from '@expo/vector-icons';
// Removed navigation imports

// ... (Keep existing RecipeType, RecipeCard component code) ...

const RECIPE_TYPES = ['All', 'AI', 'DB', 'Basic'] as const;
type RecipeType = typeof RECIPE_TYPES[number];

const RecipeCard = ({ recipe, onPress }: { recipe: typeof mockRecipes[0]; onPress: () => void }) => {
  const typeColors = {
    'AI': 'bg-purple-100 text-purple-800',
    'DB': 'bg-blue-100 text-blue-800',
    'Basic': 'bg-green-100 text-green-800'
  };
  
  return (
    <Card className="mb-3" variant="outlined">
      <TouchableOpacity onPress={onPress}>
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800 mb-1">{recipe.name}</Text>
            <Text className="text-sm text-gray-500 mb-2">{recipe.calories} kcal • {recipe.ingredients.length} ingredients</Text>
            
            <View className="flex-row flex-wrap">
              {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                <View key={idx} className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                  <Text className="text-xs text-gray-700">{ingredient}</Text>
                </View>
              ))}
              {recipe.ingredients.length > 3 && (
                <View className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                  <Text className="text-xs text-gray-700">+{recipe.ingredients.length - 3} more</Text>
                </View>
              )}
            </View>
          </View>
          
          <View className={`px-2 py-1 rounded-lg ${typeColors[recipe.type]}`}>
            <Text className="text-xs font-medium">
              {recipe.type === 'AI' ? 'AI Generated' : 
               recipe.type === 'DB' ? 'From Database' : 'Basic Meal'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
          <View className="items-center">
            <Text className="text-xs text-gray-500">Protein</Text>
            <Text className="text-sm font-medium">{recipe.protein}g</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-500">Carbs</Text>
            <Text className="text-sm font-medium">{recipe.carbs}g</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-500">Fat</Text>
            <Text className="text-sm font-medium">{recipe.fat}g</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const MealPlanScreen = () => {
  const [selectedType, setSelectedType] = useState<RecipeType>('All');
  
  const filteredRecipes = selectedType === 'All' 
    ? mockRecipes 
    : mockRecipes.filter(recipe => recipe.type === selectedType);
  
  const handleRecipePress = (recipeId: string) => {
    Alert.alert('Recipe Details', 'Feature not implemented in this UI boilerplate');
    // Potential navigation logic here would use router.push(`/recipe/${recipeId}`)
  };
  
  const handleGeneratePress = () => {
    Alert.alert('Generate Recipe', 'Feature not implemented in this UI boilerplate');
    // Potential navigation logic here would use router.push('/recipe/generate')
  };
  
  return (
    <Screen title="Meal Plan" scrollable>
      <View className="mt-4">
        <Card className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Generate a Recipe</Text>
            <TouchableOpacity className="flex-row items-center">
              <Ionicons name="refresh-outline" size={18} color="#3b82f6" />
              <Text className="text-blue-500 font-medium ml-1">Reset</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-600 mb-4">
            Create a recipe based on your pantry ingredients and preferences
          </Text>
          
          <View className="flex-row flex-wrap mb-4">
            <TouchableOpacity className="bg-blue-100 rounded-lg px-3 py-2 mr-2 mb-2">
              <Text className="text-blue-700">Use Pantry Items</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg px-3 py-2 mr-2 mb-2">
              <Text className="text-gray-700">Low Carb</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg px-3 py-2 mr-2 mb-2">
              <Text className="text-gray-700">High Protein</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg px-3 py-2 mr-2">
              <Text className="text-gray-700">Quick & Easy</Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            label="Generate Recipe" 
            fullWidth 
            onPress={handleGeneratePress}
          />
        </Card>
        
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Meal Ideas</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mb-2"
          >
            {RECIPE_TYPES.map((type) => (
              <TouchableOpacity 
                key={type}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedType === type ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onPress={() => setSelectedType(type)}
              >
                <Text 
                  className={selectedType === type ? 'text-white font-medium' : 'text-gray-800'}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {filteredRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onPress={() => handleRecipePress(recipe.id)} 
            />
          ))}
        </View>
      </View>
    </Screen>
  );
};

export default MealPlanScreen; 