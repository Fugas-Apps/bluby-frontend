import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const variantStyles = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-700',
    outline: 'bg-transparent border border-blue-500',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-500',
  };

  const sizeStyles = {
    sm: 'py-1.5 px-3',
    md: 'py-2.5 px-4',
    lg: 'py-3.5 px-6',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const disabledStyle = disabled || isLoading ? 'opacity-50' : '';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <TouchableOpacity
      className={`rounded-lg ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyle} ${widthStyle} ${className} items-center justify-center`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3b82f6' : 'white'} />
      ) : (
        <Text className={`font-medium ${textStyles[variant]} ${textSizeStyles[size]}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}; 