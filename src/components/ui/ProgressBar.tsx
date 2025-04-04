import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  value: number;
  maxValue: number;
  label?: string;
  showValue?: boolean;
  height?: number;
  barColor?: string;
  trackColor?: string;
}

export const ProgressBar = ({
  value,
  maxValue,
  label,
  showValue = true,
  height = 8,
  barColor = 'bg-blue-500',
  trackColor = 'bg-gray-200',
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  return (
    <View className="w-full">
      {label && (
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm font-medium text-gray-700">{label}</Text>
          {showValue && (
            <Text className="text-sm font-medium text-gray-500">
              {value} / {maxValue}
            </Text>
          )}
        </View>
      )}
      <View 
        className={`w-full ${trackColor} rounded-full overflow-hidden`}
        style={{ height }}
      >
        <View
          className={`${barColor} rounded-full`}
          style={{ width: `${percentage}%`, height: '100%' }}
        />
      </View>
    </View>
  );
}; 