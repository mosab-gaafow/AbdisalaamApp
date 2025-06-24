import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../constants/api';
import COLORS from '../../constants/color';

export default function ResetPasswordScreen() {
  const { email, code } = useLocalSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm)
      return Alert.alert('Error', 'Please fill in both password fields');

    if (password !== confirm)
      return Alert.alert('Error', 'Passwords do not match');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      Alert.alert('✅ Password Reset', 'You can now log in with your new password');
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.primary }}>
        🔒 Reset Password
      </Text>

      <Text style={{ marginBottom: 12 }}>Set a new password for: <Text style={{ fontWeight: 'bold' }}>{email}</Text></Text>

      <TextInput
        placeholder="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm new password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
};
