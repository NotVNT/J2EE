import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./components/AuthContext";
import AppNavigator from "./navigation/AppNavigator";


if (__DEV__) {
  require("../Reactotronconfig");
  console.tron?.log?.("Reactotron is configured");
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
