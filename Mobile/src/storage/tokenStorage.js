import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "mm_token";

export const tokenStorage = {
  async getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async setToken(token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async clearToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};
