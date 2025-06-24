import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/color";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminTabLayout() {

   const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 60,
        },
       tabBarStyle: {
            backgroundColor: COLORS.cardBackground,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingTop: 5,
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom, // safe area oo hoos waaye
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport-sharp" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="vehicles"
        options={{
          title: "Vehicles",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
        }}
      /> */}
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
