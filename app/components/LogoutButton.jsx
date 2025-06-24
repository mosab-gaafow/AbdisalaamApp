import { View, Text, Alert, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAuthStore } from '../../store/authStore';
import styles from '../styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/color';
import { useRouter } from 'expo-router';

export default function LogoutButton() {
    const { logout } = useAuthStore();
    const router = useRouter(); // ✅ hook should be inside the component

    const confirmLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: async () => {
                    await logout();                 // ✅ Clear user/token
                    router.replace("/(auth)");     // ✅ Navigate to login
                },
                style: "destructive",
            },
        ]);
    };

    return (
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons name='log-out-outline' size={20} color={COLORS.white}/>
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
    )
}
