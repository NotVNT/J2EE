import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "mm_token";
const REMEMBER_KEY = "mm_remember_login";
let sessionToken = null;

export const tokenStorage = {
  async getToken() {
    if (sessionToken) {
      return sessionToken;
    }

    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async setToken(token, options = {}) {
    const remember = typeof options.remember === "boolean"
      ? options.remember
      : await this.getRememberPreference();

    if (remember) {
      sessionToken = null;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(REMEMBER_KEY, "1");
      return;
    }

    sessionToken = token;
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.setItem(REMEMBER_KEY, "0");
  },

  async getRememberPreference() {
    const value = await AsyncStorage.getItem(REMEMBER_KEY);
    return value === "1";
  },

  async setRememberPreference(remember) {
    await AsyncStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  },

  async clearToken() {
    sessionToken = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REMEMBER_KEY);
  }
};
