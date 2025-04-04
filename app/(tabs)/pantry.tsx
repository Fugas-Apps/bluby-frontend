import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen } from '../../src/components/common/Screen';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { mockPantryItems } from '../../src/utils/mockData';

const PantryItemCard = ({ item, onPress }: { 
  item: typeof mockPantryItems[0];
  onPress: () => void;
}) => {
  return (
    <Card variant="outlined" className="mb-2">
      <TouchableOpacity 
        className="flex-row items-center justify-between"
        onPress={onPress}
      >
        <View className="flex-row items-center">
          <View 
            className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${
              item.isScanned ? 'bg-blue-100' : 'bg-green-100'
            }`}
          >
            <Ionicons 
              name={item.isScanned ? 'barcode-outline' : 'nutrition-outline'} 
              size={20} 
              color={item.isScanned ? '#3b82f6' : '#10b981'} 
            />
          </View>
          <View>
            <Text className="text-base font-medium text-gray-800">{item.name}</Text>
            <Text className="text-sm text-gray-500">
              {item.isScanned ? 'Scanned product' : 'Manual entry'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="bg-gray-100 px-3 py-1 rounded-full mr-2">
            <Text className="font-medium text-gray-800">x{item.quantity}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default function PantryScreen() {
  const [showScanned, setShowScanned] = useState<boolean>(false);
  
  const filteredItems = showScanned 
    ? mockPantryItems.filter(item => item.isScanned)
    : mockPantryItems;
  
  const handleAddManually = () => {
    Alert.alert('Add Item', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleScanBarcode = () => {
    router.push('/scanner');
  };
  
  const handleItemPress = (id: string) => {
    Alert.alert('Edit Item', 'Feature not implemented in this UI boilerplate');
  };
  
  return (
    <Screen title="My Pantry" scrollable={false}>
      <View className="flex-1 mt-4">
        <View className="mb-4 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800">
            My Ingredients ({filteredItems.length})
          </Text>
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => setShowScanned(!showScanned)}
          >
            <Text className="text-blue-500 font-medium mr-1">
              {showScanned ? 'Show All' : 'Scanned Only'}
            </Text>
            <Ionicons 
              name={showScanned ? 'filter' : 'filter-outline'} 
              size={18} 
              color="#3b82f6" 
            />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PantryItemCard 
              item={item} 
              onPress={() => handleItemPress(item.id)} 
            />
          )}
          className="mb-4"
          showsVerticalScrollIndicator={false}
        />
        
        <View className="flex-row mt-2">
          <Button 
            label="Add Manually" 
            className="flex-1 mr-2"
            onPress={handleAddManually}
          />
          <Button 
            label="Scan Barcode" 
            variant="outline"
            className="flex-1 ml-2"
            onPress={handleScanBarcode}
          />
        </View>
      </View>
    </Screen>
  );
} 