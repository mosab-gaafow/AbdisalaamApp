import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from "react-native";

import {Link, router} from 'expo-router';
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/login.styles";
import COLORS from "../../constants/color";
import { useAuthStore } from "../../store/authStore";


export default Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {isLoading, login, isCheckingAuth} = useAuthStore();

  // const handleLogin =async () => {
  //   // fetch("http://localhost:4000/api/auth/login", {

  //   const result = await login(email, password);

  //    if(!result.success) Alert.alert("Error", result.error);
  // };

 const handleLogin = async () => {
  const result = await login(email, password);

  if (!result.success) {
    Alert.alert("Error", result.error);
  } else {
    const { role } = result.user || {};

    // ✅ Redirect to correct layout based on role
   if (role === "admin") {
  router.replace("/(admin)");
} else if (role === "vehicle_owner") {
  router.replace("/(owner)");
} else {
  router.replace("/(tabs)");
}

  }
};

  if(isCheckingAuth) return null; // Show a loading screen or splash screen while checking auth

  return (
    <KeyboardAvoidingView 
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

    <View style={styles.container}>
      <View style={styles.topIllustration}>
        <Image
          source={require("../../assets/images/mk.png")}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.formContainer}>
          {/* email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.placeholderText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* password */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.primary}
                style={styles.inputIcon}
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>
          </View>

          {/* login button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          <View style={{ marginTop: 16, alignItems: 'center' }}>
  <Link href="/(auth)/forgot-password" asChild>
    <TouchableOpacity>
      <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Forgot Password?</Text>
    </TouchableOpacity>
  </Link>
</View>


            {/* footer */}
            <View style={styles.footer}>
            <Text style={styles.footerText}>
            Don't have an account?</Text>
               <Link href="/signup" asChild>
               <TouchableOpacity>
                  <Text style={styles.link}> Sign Up</Text>
               </TouchableOpacity>
               
               </Link> 
              
            </View>

        </View>
      </View>
    </View>

    </KeyboardAvoidingView>

  );
};
