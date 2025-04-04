import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '../../src/components/common/Screen';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { mockGroups } from '../../src/utils/mockData';
import { Ionicons } from '@expo/vector-icons';

const GroupMemberItem = ({ name, isActive = false }: { name: string; isActive?: boolean }) => {
  return (
    <View className="items-center mr-4">
      <View 
        className={`w-12 h-12 rounded-full items-center justify-center mb-1 
          ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <Text className="text-white text-lg font-bold">
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text className="text-sm text-gray-700">{name}</Text>
    </View>
  );
};

const GroupCard = ({ group, onPress }: { group: typeof mockGroups[0]; onPress: () => void }) => {
  return (
    <Card className="mb-4" variant="outlined">
      <TouchableOpacity onPress={onPress}>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">{group.name}</Text>
          <View className="bg-blue-100 rounded-full px-2 py-1">
            <Text className="text-xs text-blue-700">{group.members.length} members</Text>
          </View>
        </View>
        
        <View className="flex-row mb-2">
          {group.members.slice(0, 4).map((member) => (
            <GroupMemberItem 
              key={member.id} 
              name={member.name} 
              isActive={member.name === 'You'} 
            />
          ))}
          {group.members.length > 4 && (
            <View className="items-center justify-center mr-4">
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mb-1">
                <Text className="text-gray-600 font-bold">
                  +{group.members.length - 4}
                </Text>
              </View>
              <Text className="text-sm text-gray-700">More</Text>
            </View>
          )}
        </View>
        
        <View className="flex-row pt-3 border-t border-gray-100">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center mr-2">
            <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
            <Text className="text-blue-500 font-medium ml-1">Plan Event</Text>
          </TouchableOpacity>
          
          <View className="h-full w-px bg-gray-200" />
          
          <TouchableOpacity className="flex-1 flex-row items-center justify-center ml-2">
            <Ionicons name="list-outline" size={16} color="#3b82f6" />
            <Text className="text-blue-500 font-medium ml-1">Shopping List</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default function GroupsScreen() {
  const handleGroupPress = (groupId: string) => {
    Alert.alert('Group Details', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleCreateGroup = () => {
    Alert.alert('Create Group', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleJoinGroup = () => {
    Alert.alert('Join Group', 'Feature not implemented in this UI boilerplate');
  };
  
  return (
    <Screen title="My Groups" scrollable>
      <View className="mt-4">
        <View className="flex-row mb-6">
          <Button 
            label="Create Group" 
            onPress={handleCreateGroup} 
            className="flex-1 mr-2"
          />
          <Button 
            label="Join Group" 
            variant="outline"
            onPress={handleJoinGroup}
            className="flex-1 ml-2"
          />
        </View>
        
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-2">Group Benefits</Text>
          
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
              <Ionicons name="people-outline" size={18} color="#3b82f6" />
            </View>
            <Text className="text-gray-700">Share recipes with friends and family</Text>
          </View>
          
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
              <Ionicons name="calendar-outline" size={18} color="#10b981" />
            </View>
            <Text className="text-gray-700">Plan meals and events together</Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mr-2">
              <Ionicons name="cart-outline" size={18} color="#f59e0b" />
            </View>
            <Text className="text-gray-700">Generate group shopping lists automatically</Text>
          </View>
        </Card>
        
        <Text className="text-lg font-bold text-gray-800 mb-3">Your Groups</Text>
        
        {mockGroups.map((group) => (
          <GroupCard 
            key={group.id} 
            group={group} 
            onPress={() => handleGroupPress(group.id)}
          />
        ))}
      </View>
    </Screen>
  );
} 