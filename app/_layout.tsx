import { Stack } from 'expo-router';
import React from 'react';
import '../global.css'; // Import global CSS for NativeWind

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerBackVisible: false,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Define stack screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="meal-detail"
        // Title is set dynamically in app/meal-detail.tsx
      />
      <Stack.Screen 
        name="meal-evaluation"
        // Title is set dynamically in app/meal-evaluation.tsx
      />
      <Stack.Screen 
        name="scanner" 
        // Title is set dynamically in app/scanner.tsx
      />
    </Stack>
  );
} 