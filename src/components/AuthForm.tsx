import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import { auth } from '../lib/authClient';

interface AuthFormProps {
    onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        if (!isLogin && !name) {
            setError('Name is required for registration');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await auth.signIn.email({ email, password });
                console.log('Login successful');
            } else {
                await auth.signUp.email({ email, password, name });
                console.log('Registration successful');
            }
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="p-4">
            <Text className="text-xl font-bold mb-4">
                {isLogin ? 'Login' : 'Register'}
            </Text>
            
            {!isLogin && (
                <TextInput
                    className="border border-gray-300 rounded p-2 mb-2"
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                />
            )}
            
            <TextInput
                className="border border-gray-300 rounded p-2 mb-2"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            
            <TextInput
                className="border border-gray-300 rounded p-2 mb-4"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            
            {error && (
                <Text className="text-red-500 mb-4">{error}</Text>
            )}
            
            <Button
                title={loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                onPress={handleSubmit}
                disabled={loading}
            />
            
            <Button
                title={isLogin ? 'Create account' : 'Already have account?'}
                onPress={() => setIsLogin(!isLogin)}
                color="gray"
                disabled={loading}
            />
        </View>
    );
};

// Example usage in a profile screen
export const UserProfile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const getUser = async () => {
            try {
                const session = await auth.getSession();
                setUser(session.data?.user);
            } catch (error) {
                console.error('Failed to get user:', error);
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" className="flex-1 justify-center" />;
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center p-4">
                <Text className="text-center mb-4">Please login to view profile</Text>
                <AuthForm onSuccess={() => window.location.reload()} />
            </View>
        );
    }

    return (
        <View className="p-4">
            <Text className="text-2xl font-bold mb-4">Profile</Text>
            <Text className="mb-2">Name: {user.name}</Text>
            <Text className="mb-4">Email: {user?.email || 'No email'}</Text>
            <Button
                title="Logout"
                onPress={() => auth.signOut()}
                color="red"
            />
        </View>
    );
};
