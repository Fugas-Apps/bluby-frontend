import * as React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { Screen } from '../../src/components/common/Screen';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/contexts/AuthProvider';
import { useProfileStore } from '../../src/stores/useProfileStore';
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

const AddItemModal = ({
  visible,
  onClose,
  onAdd,
  placeholder,
  title
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: string) => void;
  placeholder: string;
  title: string;
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-lg p-6 w-80">
        <Text className="text-lg font-bold mb-4">{title}</Text>
        <TextInput
          className="border border-gray-300 rounded px-3 py-2 mb-4"
          placeholder={placeholder}
          value={inputValue}
          onChangeText={setInputValue}
        />
        <View className="flex-row justify-end space-x-2">
          <TouchableOpacity
            onPress={() => {
              setInputValue('');
              onClose();
            }}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            <Text className="text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAdd}
            className="px-4 py-2 bg-blue-500 rounded"
          >
            <Text className="text-white">Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { user, signOut, isAuthenticated } = useAuth();
  const {
    profile,
    isLoading,
    error,
    loadProfile,
    addPreference,
    removePreference,
    addAllergy,
    removeAllergy,
    addIntolerance,
    removeIntolerance
  } = useProfileStore();

  // Modals state
  const [preferenceModalVisible, setPreferenceModalVisible] = React.useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = React.useState(false);
  const [intoleranceModalVisible, setIntoleranceModalVisible] = React.useState(false);

  // Load profile when component mounts or user changes
  React.useEffect(() => {
    if (user?.id) {
      loadProfile(user.id.toString());
    }
  }, [user?.id, loadProfile]);

  // If not authenticated, show login prompt
  if (!isAuthenticated || !user) {
    return (
      <Screen title="Profile" scrollable>
        <View className="mt-4 items-center justify-center flex-1">
          <Text className="text-gray-600 text-center">
            Please sign in to view your profile
          </Text>
        </View>
      </Screen>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Success', 'You have been signed out');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleSettingsItemPress = (setting: string) => {
    Alert.alert(setting, 'Feature not implemented yet');
  };

  const renderGoalIcon = (goal: string) => {
    switch (goal) {
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

  if (isLoading) {
    return (
      <Screen title="Profile" scrollable>
        <View className="mt-4 items-center justify-center flex-1">
          <Text className="text-gray-600">Loading profile...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Profile" scrollable>
      <View className="mt-4">
        {error && (
          <View className="bg-red-100 p-3 rounded-lg mb-4">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        )}

        <Card className="mb-6 items-center">
          <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-2">
            <Text className="text-white text-3xl font-bold">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-1">
            {user.name || 'User'}
          </Text>
          <Text className="text-gray-500 text-sm mb-4">{user.email}</Text>

          {profile?.nutritionGoals && (
            <View className="flex-row items-center mb-4">
              <Ionicons name="fitness-outline" size={16} color="#3b82f6" />
              <Text className="text-blue-500 ml-1 font-medium">
                Daily Goal: {profile.nutritionGoals.dailyCalories} kcal
              </Text>
            </View>
          )}

          <Button
            label="Edit Profile"
            variant="outline"
            size="sm"
            onPress={handleEditProfile}
          />
        </Card>

        <ProfileSection title="Dietary Preferences">
          <View className="flex-row flex-wrap mb-2">
            {(profile?.preferences || []).map((pref: string, index: number) => (
              <PreferenceTag
                key={index}
                label={pref}
                onRemove={() => removePreference(pref)}
              />
            ))}
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center pt-2 border-t border-gray-100"
            onPress={() => setPreferenceModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#3b82f6" />
            <Text className="text-blue-500 ml-1 font-medium">Add Preference</Text>
          </TouchableOpacity>
        </ProfileSection>

        <ProfileSection title="Allergies & Intolerances">
          <Text className="text-gray-600 mb-2">Allergies</Text>
          <View className="flex-row flex-wrap mb-4">
            {(profile?.allergies || []).map((allergy: string, index: number) => (
              <WarningTag
                key={index}
                label={allergy}
                onRemove={() => removeAllergy(allergy)}
              />
            ))}
            <TouchableOpacity
              className="border border-dashed border-gray-300 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
              onPress={() => setAllergyModalVisible(true)}
            >
              <Ionicons name="add" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">Add</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-2">Intolerances</Text>
          <View className="flex-row flex-wrap">
            {(profile?.intolerances || []).map((intolerance: string, index: number) => (
              <WarningTag
                key={index}
                label={intolerance}
                onRemove={() => removeIntolerance(intolerance)}
              />
            ))}
            <TouchableOpacity
              className="border border-dashed border-gray-300 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
              onPress={() => setIntoleranceModalVisible(true)}
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
            value="Last backup: Today"
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
          className="flex-row items-center justify-center mb-6 mt-4"
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text className="text-red-500 ml-1 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modals for adding items */}
      <AddItemModal
        visible={preferenceModalVisible}
        onClose={() => setPreferenceModalVisible(false)}
        onAdd={(preference) => addPreference(preference)}
        placeholder="e.g., Vegan, Keto, Mediterranean..."
        title="Add Dietary Preference"
      />

      <AddItemModal
        visible={allergyModalVisible}
        onClose={() => setAllergyModalVisible(false)}
        onAdd={(allergy) => addAllergy(allergy)}
        placeholder="e.g., Peanuts, Shellfish, Dairy..."
        title="Add Allergy"
      />

      <AddItemModal
        visible={intoleranceModalVisible}
        onClose={() => setIntoleranceModalVisible(false)}
        onAdd={(intolerance) => addIntolerance(intolerance)}
        placeholder="e.g., Lactose, Gluten, Histamine..."
        title="Add Intolerance"
      />
    </Screen>
  );
}
