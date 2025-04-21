import { Stack } from 'expo-router';
import React from 'react';
import '../global.css'; // Import global CSS for NativeWind

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Define stack screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="mealdetail" 
        // Title is set dynamically in app/mealdetail.tsx
      />
      <Stack.Screen 
        name="mealevaluation" 
        // Title is set dynamically in app/mealevaluation.tsx
      />
      <Stack.Screen 
        name="scanner" 
        // Title is set dynamically in app/scanner.tsx
      />
    </Stack>
  );
} 