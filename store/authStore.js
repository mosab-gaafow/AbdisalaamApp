import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../constants/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,

    setUser: async (updatedUser) => {
        try {
            // Merge with existing user data
            set((state) => {
                const mergedUser = {...state.user, ...updatedUser};
                AsyncStorage.setItem('user', JSON.stringify(mergedUser));
                return { user: mergedUser };
            });
        } catch (e) {
            console.error("Failed to update user:", e);
        }
    },

    
    register: async (name, phone, email, password) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, phone, email, password }),
          });
    
          const data = await response.json();
    
          if (!response.ok) {
            // ✅ Server error like 400 or 500
            return { success: false, error: data.message || 'Registration failed' };
          }
    
          // ✅ Save token and user in store
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
          set({
            token: data.token,
            user: data.user,
            isLoading: false,
          });
          // console.log("token waa:" , data.token);
    
          return { success: true };
        } catch (error) {
          console.error("Register error:", error);
          return { success: false, error: 'Network error. Please try again.' };
        } finally {
          set({ isLoading: false });
        }
      },
      
      
    checkAuth: async() => {
        try{
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");

            const user = userJson ? JSON.parse(userJson) : null;

            // if(token && user){
            //     set({token: JSON.parse(token), user: JSON.parse(user)});
            // }else{
            //     set({token: null, user: null});
            // }
            set({token, user});

        }catch(e){
            console.log(e);
        }finally{
            set({isCheckingAuth: false});
        }
    },

    logout: async() => {
        try{
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");

            set({token: null, user: null});
            
        }catch(e){
            console.log(e);
        }
    },

   

    login: async (email, password) => {
  try {
    set({ isLoading: true }); // ✅ START LOADING

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Something went wrong!");

    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    await AsyncStorage.setItem("token", data.token);

    set({ user: data.user, token: data.token, isLoading: false });

    return { success: true, user: data.user };

  } catch (e) {
    set({ isLoading: false });
    return { success: false, error: e.message || "Something went wrong!" };
  }
}

}))