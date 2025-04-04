import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FoodItemCard } from '../../components/common/FoodItemCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RootStackParamList, MealType } from '../../types';
import { mockMeals } from '../../utils/mockData';

type MealDetailScreenRouteProp = RouteProp<RootStackParamList, 'MealDetail'>;
type MealDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MacroSummary = ({ mealType }: { mealType: string }) => {
  const meal = mockMeals[mealType.toLowerCase()];
  
  return (
    <Card className="mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">Nutrition Summary</Text>
      
      <View className="mb-3">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-600">Total Calories</Text>
          <Text className="font-medium text-gray-800">{meal.totalCalories} kcal</Text>
        </View>
      </View>
      
      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-600">Protein</Text>
          <Text className="font-medium text-gray-800">{meal.totalProtein}g</Text>
        </View>
        <ProgressBar 
          value={meal.totalProtein} 
          maxValue={150} 
          showValue={false} 
          barColor="bg-red-500" 
        />
      </View>
      
      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-600">Carbs</Text>
          <Text className="font-medium text-gray-800">{meal.totalCarbs}g</Text>
        </View>
        <ProgressBar 
          value={meal.totalCarbs} 
          maxValue={200} 
          showValue={false} 
          barColor="bg-yellow-500" 
        />
      </View>
      
      <View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-600">Fat</Text>
          <Text className="font-medium text-gray-800">{meal.totalFat}g</Text>
        </View>
        <ProgressBar 
          value={meal.totalFat} 
          maxValue={70} 
          showValue={false} 
          barColor="bg-green-500" 
        />
      </View>
    </Card>
  );
};

const MealDetailScreen = () => {
  const route = useRoute<MealDetailScreenRouteProp>();
  const navigation = useNavigation<MealDetailScreenNavigationProp>();
  const { mealType } = route.params;
  const meal = mockMeals[mealType.toLowerCase()];
  
  const handleAddFood = () => {
    Alert.alert('Add Food', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleAddFoodByPhoto = () => {
    Alert.alert('Add Food by Photo', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleFinishLogging = () => {
    navigation.navigate('MealEvaluation', { mealType });
  };
  
  return (
    <Screen title={`${mealType} Details`} scrollable>
      <View className="mt-4">
        <MacroSummary mealType={mealType} />
        
        <View className="mb-4 flex-row justify-between">
          <Button 
            label="Add Food" 
            onPress={handleAddFood}
            className="flex-1 mr-2"
          />
          <Button 
            label="Add by Photo" 
            variant="outline" 
            onPress={handleAddFoodByPhoto}
            className="flex-1 ml-2"
          />
        </View>
        
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">Food Items</Text>
          {meal.items.map((item) => (
            <FoodItemCard 
              key={item.id} 
              item={item} 
              showDetails={true}
            />
          ))}
        </View>
        
        <Button 
          label="Finish Logging" 
          size="lg"
          fullWidth
          onPress={handleFinishLogging}
          className="mb-6"
        />
      </View>
    </Screen>
  );
};

export default MealDetailScreen; 