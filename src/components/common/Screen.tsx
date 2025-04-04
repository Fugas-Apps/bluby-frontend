import React, { ReactNode } from 'react';
import { View, ScrollView, SafeAreaView, Text, StatusBar } from 'react-native';

interface ScreenProps {
  children: ReactNode;
  title?: string;
  scrollable?: boolean;
  padded?: boolean;
  safeArea?: boolean;
}

export const Screen = ({
  children,
  title,
  scrollable = true,
  padded = true,
  safeArea = true,
}: ScreenProps) => {
  const Container = safeArea ? SafeAreaView : View;
  const Content = scrollable ? ScrollView : View;

  return (
    <Container className="flex-1 bg-white">
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      {title && (
        <View className="px-4 py-3 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-800">{title}</Text>
        </View>
      )}
      <Content
        className={`flex-1 ${padded ? 'px-4' : ''}`}
        contentContainerStyle={scrollable && padded ? { paddingBottom: 24 } : {}}
      >
        {children}
      </Content>
    </Container>
  );
}; 