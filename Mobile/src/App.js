import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./contexts/AuthContext";
import { AppAlertProvider } from "./contexts/AppAlertContext";
import { ThemeProvider, useTheme, THEME_MODES } from "./contexts/ThemeContext";
import { configureGoogleSignin } from "./services/authGoogleService";
import AppNavigator from "./navigation/AppNavigator";
import { hydrateStoredLanguage } from "./i18n";

function ThemedStatusBar() {
  const { theme, loaded } = useTheme();
  if (!loaded) return null;
  return <StatusBar style={theme === THEME_MODES.DARK ? "light" : "dark"} />;
}

export default function App() {
  useEffect(() => {
    configureGoogleSignin();
    hydrateStoredLanguage();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppAlertProvider>
            <ThemedStatusBar />
            <AppNavigator />
          </AppAlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
