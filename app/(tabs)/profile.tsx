import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Screen } from '~/components/common/Screen';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { mockUserProfile } from '~/utils/mockData';
import { Ionicons } from '@expo/vector-icons';

const ProfileSection = ({ 
  title, 
  children 
}: { 
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Card className="mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">{title}</Text>
      {children}
    </Card>
  );
};

const PreferenceTag = ({ 
  label, 
  onRemove 
}: { 
  label: string;
  onRemove?: () => void;
}) => {
  return (
    <View className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
      <Text className="text-blue-700 text-sm">{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} className="ml-1">
          <Ionicons name="close-circle" size={16} color="#1d4ed8" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const WarningTag = ({ 
  label, 
  onRemove 
}: { 
  label: string;
  onRemove?: () => void;
}) => {
  return (
    <View className="bg-red-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
      <Text className="text-red-700 text-sm">{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} className="ml-1">
          <Ionicons name="close-circle" size={16} color="#b91c1c" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const SettingsItem = ({ 
  icon, 
  label, 
  value, 
  onPress 
}: { 
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity 
      className="flex-row items-center py-3 border-b border-gray-100" 
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#4b5563" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800">{label}</Text>
        {value && <Text className="text-gray-500 text-sm">{value}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color="#9ca3af" />}
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleEditDietaryPreferences = () => {
    Alert.alert('Edit Dietary Preferences', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleEditAllergies = () => {
    Alert.alert('Edit Allergies', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleEditIntolerances = () => {
    Alert.alert('Edit Intolerances', 'Feature not implemented in this UI boilerplate');
  };
  
  const handleSettingsItemPress = (setting: string) => {
    Alert.alert(setting, 'Feature not implemented in this UI boilerplate');
  };
  
  const renderGoalIcon = () => {
    switch (mockUserProfile.goal) {
      case 'weight-loss':
        return 'trending-down-outline';
      case 'muscle-gain':
        return 'barbell-outline';
      case 'maintenance':
        return 'fitness-outline';
      case 'health':
        return 'heart-outline';
      default:
        return 'body-outline';
    }
  };
  
  const formatGoalText = (goal: string) => {
    return goal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <Screen title="Profile" scrollable>
      <View className="mt-4">
        <Card className="mb-6 items-center">
          <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-2">
            <Text className="text-white text-3xl font-bold">
              {mockUserProfile.name.charAt(0)}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-1">{mockUserProfile.name}</Text>
          
          <View className="flex-row items-center mb-4">
            <Ionicons name={renderGoalIcon()} size={16} color="#3b82f6" />
            <Text className="text-blue-500 ml-1 font-medium">
              Goal: {formatGoalText(mockUserProfile.goal)}
            </Text>
          </View>
          
          <Button 
            label="Edit Profile" 
            variant="outline" 
            size="sm"
            onPress={handleEditProfile}
          />
        </Card>
        
        <ProfileSection title="Dietary Preferences">
          <View className="flex-row flex-wrap mb-2">
            {mockUserProfile.dietaryPreferences.map((pref, index) => (
              <PreferenceTag key={index} label={pref} />
            ))}
          </View>
          
          <TouchableOpacity 
            className="flex-row items-center justify-center pt-2 border-t border-gray-100" 
            onPress={handleEditDietaryPreferences}
          >
            <Ionicons name="add-circle-outline" size={18} color="#3b82f6" />
            <Text className="text-blue-500 ml-1 font-medium">Add Preference</Text>
          </TouchableOpacity>
        </ProfileSection>
        
        <ProfileSection title="Allergies & Intolerances">
          <Text className="text-gray-600 mb-2">Allergies</Text>
          <View className="flex-row flex-wrap mb-4">
            {mockUserProfile.allergies.map((allergy, index) => (
              <WarningTag key={index} label={allergy} />
            ))}
            <TouchableOpacity 
              className="border border-dashed border-gray-300 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center" 
              onPress={handleEditAllergies}
            >
              <Ionicons name="add" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">Add</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-600 mb-2">Intolerances</Text>
          <View className="flex-row flex-wrap">
            {mockUserProfile.intolerances.map((intolerance, index) => (
              <WarningTag key={index} label={intolerance} />
            ))}
            <TouchableOpacity 
              className="border border-dashed border-gray-300 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center" 
              onPress={handleEditIntolerances}
            >
              <Ionicons name="add" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">Add</Text>
            </TouchableOpacity>
          </View>
        </ProfileSection>
        
        <ProfileSection title="Settings">
          <SettingsItem
            icon="notifications-outline"
            label="Notifications"
            value="On"
            onPress={() => handleSettingsItemPress('Notifications')}
          />
          <SettingsItem
            icon="globe-outline"
            label="Units"
            value="Metric (g, ml, kcal)"
            onPress={() => handleSettingsItemPress('Units')}
          />
          <SettingsItem
            icon="cloud-upload-outline"
            label="Backup & Sync"
            value="Last backup: Today, 10:30 AM"
            onPress={() => handleSettingsItemPress('Backup & Sync')}
          />
          <SettingsItem
            icon="shield-outline"
            label="Privacy"
            onPress={() => handleSettingsItemPress('Privacy')}
          />
          <SettingsItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => handleSettingsItemPress('Help & Support')}
          />
          <SettingsItem
            icon="information-circle-outline"
            label="About"
            value="Version 1.0.0"
            onPress={() => handleSettingsItemPress('About')}
          />
        </ProfileSection>
        
        <TouchableOpacity 
          className="flex-row items-center justify-center mb-6" 
          onPress={() => Alert.alert('Sign Out', 'Feature not implemented in this UI boilerplate')}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text className="text-red-500 ml-1 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default ProfileScreen; 