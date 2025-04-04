import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { FoodItem } from '../../types';

interface FoodItemCardProps {
  item: FoodItem;
  onPress?: () => void;
  showDetails?: boolean;
}

export const FoodItemCard = ({
  item,
  onPress,
  showDetails = true,
}: FoodItemCardProps) => {
  const processedLevelColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      className="w-full"
    >
      <Card className="mb-2" variant="outlined">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-800">{item.name}</Text>
            <Text className="text-sm text-gray-500">{item.calories} kcal</Text>
          </View>
          
          <View className="items-end">
            <View className={`px-2 py-1 rounded-full ${processedLevelColors[item.processed]}`}>
              <Text className="text-xs font-medium">
                {item.processed.charAt(0).toUpperCase() + item.processed.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        {showDetails && (
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-xs text-gray-500">Protein</Text>
              <Text className="text-sm font-medium">{item.protein}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500">Carbs</Text>
              <Text className="text-sm font-medium">{item.carbs}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500">Fat</Text>
              <Text className="text-sm font-medium">{item.fat}g</Text>
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}; 