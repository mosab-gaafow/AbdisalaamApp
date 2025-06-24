import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../constants/api';
import COLORS from '../../constants/color';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) return Alert.alert('Error', 'Please enter the code');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid code');

      Alert.alert('Verified!', 'Code is correct. You can now reset your password.');
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, code },
      });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.primary }}>
        🔐 Verify Code
      </Text>

      <Text style={{ marginBottom: 12 }}>
        Enter the 6-digit code sent to:{" "}
        <Text style={{ fontWeight: 'bold' }}>{email}</Text>
      </Text>

      <TextInput
        placeholder="Enter code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
        maxLength={6}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify Code'}</Text>
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
