import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({ 
  children, 
  variant = 'elevated', 
  padding = 'md',
  className = '',
  ...props 
}: CardProps) => {
  const variantStyles = {
    elevated: 'bg-white shadow-md',
    outlined: 'border border-gray-200 bg-white',
    filled: 'bg-gray-100',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      className={`rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}; 