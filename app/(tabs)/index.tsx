import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Screen } from '~/components/common/Screen';
import { Card } from '~/components/ui/Card';
import { ProgressBar } from '~/components/ui/ProgressBar';
import { FoodItemCard } from '~/components/common/FoodItemCard';
import { MealType } from '~/types';
import { mockMeals } from '~/utils/mockData';
import { Ionicons } from '@expo/vector-icons';

const DailyGoals = () => {
  const totalCalories = Object.values(mockMeals).reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = Object.values(mockMeals).reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalCarbs = Object.values(mockMeals).reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const totalFat = Object.values(mockMeals).reduce((sum, meal) => sum + meal.totalFat, 0);

  return (
    <Card className="mb-6">
      <View className="mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">Daily Progress</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Calories</Text>
          <Text className="font-medium text-gray-800">{totalCalories} / 2000 kcal</Text>
        </View>
        <ProgressBar value={totalCalories} maxValue={2000} showValue={false} barColor="bg-blue-500" />
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-gray-600 text-xs mb-1">Protein</Text>
          <ProgressBar value={totalProtein} maxValue={150} height={6} barColor="bg-red-500" showValue={false} />
          <Text className="text-gray-700 text-xs mt-1 text-right">{totalProtein}g</Text>
        </View>
        <View className="flex-1 mx-2">
          <Text className="text-gray-600 text-xs mb-1">Carbs</Text>
          <ProgressBar value={totalCarbs} maxValue={200} height={6} barColor="bg-yellow-500" showValue={false} />
          <Text className="text-gray-700 text-xs mt-1 text-right">{totalCarbs}g</Text>
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-gray-600 text-xs mb-1">Fat</Text>
          <ProgressBar value={totalFat} maxValue={70} height={6} barColor="bg-green-500" showValue={false} />
          <Text className="text-gray-700 text-xs mt-1 text-right">{totalFat}g</Text>
        </View>
      </View>
    </Card>
  );
};

const MealSection = ({ mealType }: { mealType: MealType }) => {
  const meal = mockMeals[mealType.toLowerCase()];

  return (
    <Card className="mb-4" variant="outlined">
      <Link
        href={{
          pathname: '/mealdetail',
          params: { mealType: mealType }
        }}
        asChild
      >
        <TouchableOpacity
          className="flex-row justify-between items-center mb-2"
        >
          <Text className="text-lg font-bold text-gray-800">{mealType}</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-500 mr-1">{meal.totalCalories} kcal</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </Link>

      {meal.items.slice(0, 2).map((item) => (
        <FoodItemCard key={item.id} item={item} showDetails={false} />
      ))}

      {meal.items.length > 2 && (
        <Link
          href={{
            pathname: '/mealdetail',
            params: { mealType: mealType }
          }}
          asChild
        >
          <TouchableOpacity
            className="mt-2 items-center py-2 border-t border-gray-100"
          >
            <Text className="text-blue-500 font-medium">View all {meal.items.length} items</Text>
          </TouchableOpacity>
        </Link>
      )}
    </Card>
  );
};

const DashboardScreen = () => {
  const handleScanPress = () => {
    router.push('/scanner');
  };

  return (
    <Screen title="Daily Overview" scrollable>
      <View className="mt-4">
        <DailyGoals />
        
        <View className="mb-4 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800">Meals Today</Text>
          <TouchableOpacity 
            className="flex-row items-center bg-blue-500 py-2 px-3 rounded-lg"
            onPress={handleScanPress}
          >
            <Ionicons name="scan" size={18} color="white" />
            <Text className="text-white font-medium ml-1">Scan Food</Text>
          </TouchableOpacity>
        </View>

        <MealSection mealType="Breakfast" />
        <MealSection mealType="Lunch" />
        <MealSection mealType="Dinner" />
        <MealSection mealType="Snacks" />
      </View>
    </Screen>
  );
};

export default DashboardScreen; 