import React from 'react';
import { View, Text, Alert } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Screen } from '@components/common/Screen';
import { Card } from '@components/ui/Card';
import { ProgressBar } from '@components/ui/ProgressBar';
import { Button } from '@components/ui/Button';
import { MealType } from 'src/types';
import { mockMeals, mockUserProfile } from '@utils/mockData';
import { Ionicons } from '@expo/vector-icons';

const CircularProgress = ({ 
  value, 
  size = 120, 
  strokeWidth = 12,
  color = '#3b82f6',
  label,
  sublabel
}: { 
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel: string;
}) => {
  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <View className="items-center justify-center">
        <Text className="text-2xl font-bold text-gray-800">{label}</Text>
        <Text className="text-xs text-gray-500">{sublabel}</Text>
      </View>
      
      <View 
        className="absolute rounded-full border-4 border-gray-200"
        style={{ 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderTopColor: value >= 25 ? color : 'transparent',
          borderRightColor: value >= 50 ? color : 'transparent',
          borderBottomColor: value >= 75 ? color : 'transparent',
          borderLeftColor: value >= 100 ? color : 'transparent',
          transform: [{ rotate: `${45 + (value * 3.6)}deg` }]
        }} 
      />
    </View>
  );
};

const WarningItem = ({ text, icon }: { text: string; icon: any }) => {
  return (
    <View className="flex-row items-center bg-red-50 p-3 rounded-lg mb-2">
      <Ionicons name={icon} size={24} color="#ef4444" />
      <Text className="text-red-600 ml-2 flex-1">{text}</Text>
    </View>
  );
};

const PositiveItem = ({ text, icon }: { text: string; icon: any }) => {
  return (
    <View className="flex-row items-center bg-green-50 p-3 rounded-lg mb-2">
      <Ionicons name={icon} size={24} color="#10b981" />
      <Text className="text-green-600 ml-2 flex-1">{text}</Text>
    </View>
  );
};

export default function MealEvaluationScreen() {
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType as MealType;
  const meal = mockMeals[mealType.toLowerCase()];
  
  // Calculate mock evaluation scores
  const balanceScore = 75; // out of 100
  const nutritionScore = 82; // out of 100
  const processedScore = 65; // out of 100
  
  const handleBackToDashboard = () => {
    router.replace('/');
  };
  
  return (
    <>
      <Stack.Screen options={{ title: `${mealType} Evaluation` }} />
      <Screen scrollable>
        <View className="mt-4">
          <Card className="mb-6 items-center">
            <Text className="text-xl font-bold text-gray-800 mb-6">Meal Quality Score</Text>
            
            <View className="flex-row justify-around w-full mb-6">
              <CircularProgress 
                value={balanceScore} 
                color="#3b82f6"
                label={`${balanceScore}`}
                sublabel="Balance"
                size={100}
              />
              <CircularProgress 
                value={nutritionScore} 
                color="#10b981"
                label={`${nutritionScore}`}
                sublabel="Nutrition"
                size={100}
              />
              <CircularProgress 
                value={processedScore} 
                color="#f59e0b"
                label={`${processedScore}`}
                sublabel="Natural"
                size={100}
              />
            </View>
          </Card>
          
          <Card className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">Macronutrient Balance</Text>
            
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Protein ({meal.totalProtein}g)</Text>
                <Text className="font-medium text-gray-800">{Math.round((meal.totalProtein * 4 / meal.totalCalories) * 100)}%</Text>
              </View>
              <ProgressBar 
                value={meal.totalProtein * 4} 
                maxValue={meal.totalCalories} 
                barColor="bg-red-500"
                showValue={false}
              />
            </View>
            
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Carbs ({meal.totalCarbs}g)</Text>
                <Text className="font-medium text-gray-800">{Math.round((meal.totalCarbs * 4 / meal.totalCalories) * 100)}%</Text>
              </View>
              <ProgressBar 
                value={meal.totalCarbs * 4} 
                maxValue={meal.totalCalories} 
                barColor="bg-yellow-500"
                showValue={false}
              />
            </View>
            
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Fat ({meal.totalFat}g)</Text>
                <Text className="font-medium text-gray-800">{Math.round((meal.totalFat * 9 / meal.totalCalories) * 100)}%</Text>
              </View>
              <ProgressBar 
                value={meal.totalFat * 9} 
                maxValue={meal.totalCalories} 
                barColor="bg-green-500"
                showValue={false}
              />
            </View>
          </Card>
          
          <Card className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">Personalized Insights</Text>
            
            {/* Potential warnings */}
            {mockUserProfile.intolerances.includes('Lactose') && mealType === 'Breakfast' && (
              <WarningItem 
                text="This meal contains dairy, which you've marked as a potential intolerance."
                icon="warning-outline"
              />
            )}
            
            {mealType === 'Snacks' && (
              <WarningItem 
                text="This meal contains highly processed foods which don't align with your 'Low Processed' preference."
                icon="alert-circle-outline"
              />
            )}
            
            {/* Positive feedback */}
            {mealType === 'Lunch' && (
              <PositiveItem 
                text="Great protein content! This aligns perfectly with your 'High Protein' preference."
                icon="checkmark-circle-outline"
              />
            )}
            
            {mealType === 'Dinner' && (
              <PositiveItem 
                text="This meal is well-balanced and contains nutrient-dense ingredients."
                icon="nutrition-outline"
              />
            )}
          </Card>
          
          <Button 
            label="Back to Dashboard" 
            size="lg"
            fullWidth
            onPress={handleBackToDashboard}
            className="mb-6"
          />
        </View>
      </Screen>
    </>
  );
} 