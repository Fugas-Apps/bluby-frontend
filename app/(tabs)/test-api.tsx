import * as React from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { Screen } from '../../src/components/common/Screen';
import { Button } from '../../src/components/ui/Button';
import { useGetProfile } from '../../src/api/profiles/profiles';

export default function TestAPIScreen() {
  const [userId, setUserId] = React.useState<number>(1);
  const { data, isLoading, error, refetch } = useGetProfile(userId);

  const handleTestAPI = async () => {
    try {
      const result = await refetch();
      if (result.data) {
        Alert.alert('Success', `Profile data received! Check the display below.`);
      } else if (result.error) {
        Alert.alert('Error', `API Error: ${JSON.stringify(result.error)}`);
      }
    } catch (err) {
      Alert.alert('Error', `Request failed: ${err}`);
    }
  };

  return (
    <Screen title="API Test" scrollable>
      <ScrollView className="mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-4">API Integration Test</Text>
        
        <View className="mb-4 p-4 bg-blue-50 rounded-lg">
          <Text className="text-gray-600 mb-2">Testing connection to local worker API</Text>
          <Text className="text-sm text-gray-500">Endpoint: http://localhost:8787</Text>
          <Text className="text-sm text-gray-500 mt-1">Testing user ID: {userId}</Text>
        </View>

        <Button 
          label="Test Profile API" 
          onPress={handleTestAPI}
          fullWidth
          className="mb-4"
        />

        {isLoading && (
          <View className="p-4 bg-yellow-50 rounded-lg mb-4">
            <Text className="text-yellow-800 text-center">Loading profile data...</Text>
          </View>
        )}

        {data && (
          <View className="p-4 bg-green-50 rounded-lg mb-4">
            <Text className="text-green-800 font-bold mb-2">Success! Profile Data:</Text>
            <View className="bg-white p-3 rounded">
              <Text className="text-green-700 text-sm">
                <Text className="font-bold">Status:</Text> {data.status || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">User ID:</Text> {data.body?.user_id || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Username:</Text> {data.body?.username || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Private:</Text> {data.body?.private?.toString() || 'N/A'}
              </Text>
              <Text className="text-green-700 text-sm mt-1">
                <Text className="font-bold">Allow Contact Search:</Text> {data.body?.allow_contact_search?.toString() || 'N/A'}
              </Text>
            </View>
          </View>
        )}

        {error && (
          <View className="p-4 bg-red-50 rounded-lg mb-4">
            <Text className="text-red-800 font-bold mb-2">Error:</Text>
            <View className="bg-white p-3 rounded">
              <Text className="text-red-700 text-sm">
                {JSON.stringify(error, null, 2)}
              </Text>
            </View>
          </View>
        )}

        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-gray-800 font-bold mb-2">API Integration Status</Text>
          <Text className="text-gray-600 text-sm">
            ✅ Profile API endpoints working
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
