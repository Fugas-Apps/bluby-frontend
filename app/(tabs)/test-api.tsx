import * as React from 'react';
import { View, Text, Alert, ScrollView, TextInput } from 'react-native';
import { Screen } from '../../src/components/common/Screen';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/contexts/AuthProvider';
import { authClient } from '../../src/lib/authClient';
import { API_URL } from '../../src/api/config';

export default function TestAPIScreen() {
  const { user, isAuthenticated } = useAuth();
  const userIdFromAuth = user?.id ? String(user.id) : '';

  // allow manual override so you can paste numeric DB id for testing
  const [overrideUserId, setOverrideUserId] = React.useState<string>('');

  // use the override when present, otherwise the auth user id
  const userId = overrideUserId || userIdFromAuth;

  const [sessionToken, setSessionToken] = React.useState<string | null>(null);
  const [profileData, setProfileData] = React.useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);
  const [profileError, setProfileError] = React.useState<any>(null);

  const handleGetSession = async () => {
    try {
      const session = await authClient.getSession();
      if (session.data?.session?.token) {
        setSessionToken(session.data.session.token);
        Alert.alert('Success', 'Session token retrieved successfully!');
      } else {
        setSessionToken(null);
        Alert.alert('Error', 'No session token found. Please log in.');
      }
    } catch (error) {
      setSessionToken(null);
      Alert.alert('Error', `Failed to get session: ${error}`);
    }
  };

  const handleTestProfileWithToken = async () => {
    if (!sessionToken) {
      Alert.alert('Error', 'No session token available. Get session first.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'No user ID available.');
      return;
    }

    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch(`${API_URL}/v1/profiles/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data);
        Alert.alert('Success', 'Profile data retrieved successfully!');
      } else {
        setProfileError(data);
        Alert.alert('Error', `API Error: ${response.status} - ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setProfileError(error);
      Alert.alert('Error', `Request failed: ${error}`);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <Screen title="API Test" scrollable>
      <ScrollView className="mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-4">API Integration Test</Text>
        
        <View className="mb-4 p-4 bg-blue-50 rounded-lg">
          <Text className="text-gray-600 mb-2">Testing connection to local worker API</Text>
          <Text className="text-sm text-gray-500">Endpoint: {API_URL}</Text>
          <Text className="text-sm text-gray-500 mt-1">Auth user id: {userIdFromAuth || 'Not logged in'}</Text>
          <Text className="text-sm text-gray-500 mt-1">Using id for request: {userId || 'None'}</Text>
          <Text className="text-sm text-gray-500 mt-1">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
          <Text className="text-sm text-gray-500 mt-1">Session Token: {sessionToken ? 'Available' : 'Not available'}</Text>

          <View className="mt-3">
            <Text className="text-sm text-gray-700 mb-1">Override user id (paste numeric DB id here to test):</Text>
            <TextInput
              value={overrideUserId}
              onChangeText={setOverrideUserId}
              placeholder="Paste numeric DB id to test"
              keyboardType="default"
              style={{ backgroundColor: 'white', padding: 8, borderRadius: 6 }}
            />
          </View>
        </View>

        <Button 
          label="Get Session Token" 
          onPress={handleGetSession}
          fullWidth
          className="mb-4"
        />

        <Button 
          label="Test Profile API with Token" 
          onPress={handleTestProfileWithToken}
          fullWidth
          className="mb-4"
          disabled={!sessionToken}
        />

        {isLoadingProfile && (
          <View className="p-4 bg-yellow-50 rounded-lg mb-4">
            <Text className="text-yellow-800 text-center">Loading profile data...</Text>
          </View>
        )}

        {profileData && (
          <View className="p-4 bg-green-50 rounded-lg mb-4">
            <Text className="text-green-800 font-bold mb-2">Profile Data:</Text>
            <View className="bg-white p-3 rounded">
              <Text className="text-green-700 text-sm">
                <Text className="font-bold">User ID:</Text> {profileData.userId || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Name:</Text> {profileData.name || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Email:</Text> {profileData.email || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Goal:</Text> {profileData.goal || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Avatar URL:</Text> {profileData.avatarUrl || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Preferences:</Text> {JSON.stringify(profileData.preferences) || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Allergies:</Text> {JSON.stringify(profileData.allergies) || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Intolerances:</Text> {JSON.stringify(profileData.intolerances) || 'N/A'}
              </Text>
            </View>
          </View>
        )}

        {profileError && (
          <View className="p-4 bg-red-50 rounded-lg mb-4">
            <Text className="text-red-800 font-bold mb-2">Profile Error:</Text>
            <View className="bg-white p-3 rounded">
              <Text className="text-red-700 text-sm">
                {JSON.stringify(profileError, null, 2)}
              </Text>
            </View>
          </View>
        )}

        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-gray-800 font-bold mb-2">API Integration Status</Text>
          <Text className="text-gray-600 text-sm">
            ✅ Session token retrieval working
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            ✅ Profile API with explicit token working
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            ⏳ Other endpoints to be implemented
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            ⏳ Database integration in progress
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}