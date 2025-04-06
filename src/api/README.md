# Generated API Client

This API client is automatically generated from the FastAPI OpenAPI schema.
**DO NOT EDIT THESE FILES DIRECTLY** as they will be overwritten on the next backend update.

## Usage

```tsx
import { useGetProfile } from './api/profiles';
import { useQueryClient } from '@tanstack/react-query';

function ProfileComponent({ userId }) {
  // Use the generated hook to fetch data
  const { data, isLoading, error } = useGetProfile(userId);
  const queryClient = useQueryClient();

  // Example of invalidating cache to refresh data
  const refreshProfile = () => {
    queryClient.invalidateQueries(['getProfile', userId]);
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>Username: {data.body.username}</Text>
      <Text>Bio: {data.body.bio}</Text>
      <Button onPress={refreshProfile} title="Refresh" />
    </View>
  );
}
```

## Authentication

Authentication is handled through Supabase. The API client will automatically include the access token from the Supabase session in API requests.

## Environment Setup

Make sure to configure the API URL and Supabase credentials in your app's environment.
