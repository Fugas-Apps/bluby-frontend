import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { Screen } from '~/components/common/Screen';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { mockFoodItems } from '~/utils/mockData';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

// Mock scan result
const mockScanResult = {
  barcode: '5901234123457',
  name: 'Whole Grain Bread',
  calories: 160,
  protein: 6,
  carbs: 30,
  fat: 2,
  processed: 'medium' as const,
  ingredients: ['Whole Wheat Flour', 'Water', 'Sugar', 'Yeast', 'Salt'],
  allergensWarning: ['Contains: Wheat, Gluten'],
};

const ScannerScreen = () => {
  const [scanMode, setScanMode] = useState<'barcode' | 'nutrition' | null>(null);
  const [hasResult, setHasResult] = useState<boolean>(false);
  
  const handleScanBarcode = () => {
    setScanMode('barcode');
    
    // Simulate scanning process
    setTimeout(() => {
      setHasResult(true);
    }, 500);
  };
  
  const handleScanNutrition = () => {
    setScanMode('nutrition');
    
    // Simulate scanning process
    setTimeout(() => {
      setHasResult(true);
    }, 500);
  };
  
  const handleAddToPantry = () => {
    Alert.alert('Success', 'Item added to pantry!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/pantry') }
    ]);
  };
  
  const handleAddToMeal = () => {
    Alert.alert('Add to Meal', 'Select a meal to add this item to', [
      { 
        text: 'Breakfast', 
        onPress: () => router.push({ pathname: '/mealdetail', params: { mealType: 'Breakfast' } }) 
      },
      { 
        text: 'Lunch', 
        onPress: () => router.push({ pathname: '/mealdetail', params: { mealType: 'Lunch' } }) 
      },
      { 
        text: 'Dinner', 
        onPress: () => router.push({ pathname: '/mealdetail', params: { mealType: 'Dinner' } }) 
      },
      { 
        text: 'Snacks', 
        onPress: () => router.push({ pathname: '/mealdetail', params: { mealType: 'Snacks' } }) 
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };
  
  const handleReset = () => {
    setScanMode(null);
    setHasResult(false);
  };
  
  const renderScanArea = () => {
    if (hasResult) {
      return (
        <Card className="mb-6">
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="checkmark" size={32} color="#10b981" />
            </View>
            <Text className="text-lg font-bold text-gray-800">{mockScanResult.name}</Text>
            <Text className="text-gray-500">{mockScanResult.barcode}</Text>
          </View>
          
          <View className="border-t border-gray-100 pt-4 mb-4">
            <Text className="text-gray-800 font-medium mb-2">Nutritional Information</Text>
            
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Calories</Text>
              <Text className="font-medium">{mockScanResult.calories} kcal</Text>
            </View>
            
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Protein</Text>
              <Text className="font-medium">{mockScanResult.protein}g</Text>
            </View>
            
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Carbs</Text>
              <Text className="font-medium">{mockScanResult.carbs}g</Text>
            </View>
            
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Fat</Text>
              <Text className="font-medium">{mockScanResult.fat}g</Text>
            </View>
            
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Processing Level</Text>
              <View className={`px-2 py-1 rounded-full bg-yellow-100`}>
                <Text className="text-xs font-medium text-yellow-800">
                  {mockScanResult.processed.charAt(0).toUpperCase() + mockScanResult.processed.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="border-t border-gray-100 pt-4 mb-4">
            <Text className="text-gray-800 font-medium mb-2">Ingredients</Text>
            <Text className="text-gray-600">
              {mockScanResult.ingredients.join(', ')}
            </Text>
          </View>
          
          {mockScanResult.allergensWarning.length > 0 && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-600 font-medium">
                {mockScanResult.allergensWarning}
              </Text>
            </View>
          )}
          
          <View className="flex-row">
            <Button 
              label="Add to Pantry" 
              onPress={handleAddToPantry}
              className="flex-1 mr-2"
            />
            <Button 
              label="Add to Meal" 
              variant="outline"
              onPress={handleAddToMeal}
              className="flex-1 ml-2"
            />
          </View>
        </Card>
      );
    }
    
    if (scanMode === 'barcode') {
      return (
        <Card className="mb-6 items-center">
          <View className="w-full aspect-square bg-gray-100 rounded-lg mb-4 items-center justify-center">
            <View className="w-3/4 h-1 bg-red-500 opacity-70" />
            <Text className="text-gray-500 mt-4">Align barcode with the red line</Text>
          </View>
          <Button 
            label="Cancel" 
            variant="outline" 
            onPress={handleReset} 
          />
        </Card>
      );
    }
    
    if (scanMode === 'nutrition') {
      return (
        <Card className="mb-6 items-center">
          <View className="w-full aspect-square bg-gray-100 rounded-lg mb-4 items-center justify-center">
            <View className="w-3/4 h-3/4 border-2 border-blue-500 border-dashed rounded-lg items-center justify-center">
              <Text className="text-gray-500">Position nutrition label inside the box</Text>
            </View>
          </View>
          <Button 
            label="Cancel" 
            variant="outline" 
            onPress={handleReset} 
          />
        </Card>
      );
    }
    
    return (
      <Card className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-4">Scan Food</Text>
        <Text className="text-gray-600 mb-6">
          Scan a barcode or nutrition label to add food to your pantry or log it to a meal.
        </Text>
        
        <TouchableOpacity 
          className="flex-row items-center p-4 bg-blue-50 rounded-lg mb-3"
          onPress={handleScanBarcode}
        >
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="barcode-outline" size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-blue-800 font-medium">Scan Barcode</Text>
            <Text className="text-blue-600 text-sm">
              Scan the barcode on a packaged food item
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center p-4 bg-green-50 rounded-lg"
          onPress={handleScanNutrition}
        >
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="camera-outline" size={20} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text className="text-green-800 font-medium">Scan Nutrition Label</Text>
            <Text className="text-green-600 text-sm">
              Take a photo of the nutrition facts label
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#10b981" />
        </TouchableOpacity>
      </Card>
    );
  };
  
  return (
    <>
      <Stack.Screen options={{ title: "Scan Food" }} />
      <Screen title="" scrollable>
        <View className="mt-4">
          {renderScanArea()}
          
          {hasResult && (
            <Button 
              label="Scan Another Item" 
              variant="outline"
              onPress={handleReset}
              fullWidth
            />
          )}
          
          {!scanMode && !hasResult && (
            <Card className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">Tips for Scanning</Text>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle-outline" size={18} color="#3b82f6" className="mr-2" />
                <Text className="text-gray-600 ml-1">Ensure good lighting for best results</Text>
              </View>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle-outline" size={18} color="#3b82f6" className="mr-2" />
                <Text className="text-gray-600 ml-1">Hold camera steady when scanning</Text>
              </View>
            </Card>
          )}
        </View>
      </Screen>
    </>
  );
};

export default ScannerScreen; 