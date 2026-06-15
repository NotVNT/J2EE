import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../contexts/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";
import MainTabs from "./MainTabs";
import { COLORS } from "../constants/colors";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import SetupProfileScreen from "../screens/auth/SetupProfileScreen";
import CreatePasswordScreen from "../screens/auth/CreatePasswordScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ForgotPasswordOtpScreen from "../screens/auth/ForgotPasswordOtpScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import VerifyOtpScreen from "../screens/auth/VerifyOtpScreen";
import OnboardingScreen, { ONBOARDING_KEY } from "../screens/onboarding/OnboardingScreen";
import { appNavigationRef } from "./navigationRef";

const Stack = createNativeStackNavigator();


const linking = {
  prefixes: ["moneymanager://"],
  config: {
    screens: {
      SettingTab: {
        screens: {
          Payment: "payment",
          PaymentResult: "payment/:result"
        }
      }
    }
  }
};

function AuthStack({ shouldShowOnboarding }) {
  return (
    <Stack.Navigator>
      {shouldShowOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      ) : null}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerTintColor: COLORS.DARK_TEXT
        }}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtpScreen}
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerBackTitleVisible: false,
        headerTintColor: COLORS.DARK_TEXT
        }}
      />
      <Stack.Screen
        name="SetupProfile"
        component={SetupProfileScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="CreatePassword"
        component={CreatePasswordScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerTintColor: COLORS.DARK_TEXT
        }}
      />
      <Stack.Screen
        name="ForgotPasswordOtp"
        component={ForgotPasswordOtpScreen}
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerTintColor: COLORS.DARK_TEXT
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isBootstrapping } = useContext(AuthContext);
  const [isOnboardingResolved, setIsOnboardingResolved] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isStartupDelayDone, setIsStartupDelayDone] = useState(false);
  const isExitConfirmOpenRef = useRef(false);

  useEffect(() => {
    let active = true;

    const resolveOnboarding = async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (active) {
          setShouldShowOnboarding(onboardingDone !== "1");
          setIsOnboardingResolved(true);
        }
      } catch {
        if (active) {
          setShouldShowOnboarding(false);
          setIsOnboardingResolved(true);
        }
      }
    };

    resolveOnboarding();

    return () => {
      active = false;
    };
  }, []);

  const handleSplashComplete = () => {
    setIsStartupDelayDone(true);
  };

  useEffect(() => {
    if (Platform.OS !== "android") {
      return undefined;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      const navigation = appNavigationRef.current;

      if (navigation?.canGoBack?.()) {
        return false;
      }

      if (isExitConfirmOpenRef.current) {
        return true;
      }

      isExitConfirmOpenRef.current = true;
      Alert.alert(
        "Thoát ứng dụng?",
        "Bạn có chắc chắn muốn thoát ứng dụng không?",
        [
          {
            text: "Ở lại",
            style: "cancel",
            onPress: () => {
              isExitConfirmOpenRef.current = false;
            },
          },
          {
            text: "Thoát",
            style: "destructive",
            onPress: () => {
              isExitConfirmOpenRef.current = false;
              BackHandler.exitApp();
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            isExitConfirmOpenRef.current = false;
          },
        }
      );

      return true;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (isBootstrapping || !isOnboardingResolved || !isStartupDelayDone) {
    return <LoadingScreen onComplete={handleSplashComplete} />;
  }

  return (
    <NavigationContainer
      linking={linking}
      ref={(nav) => { appNavigationRef.current = nav; }}
    >
      {user ? <MainTabs /> : <AuthStack shouldShowOnboarding={shouldShowOnboarding} />}
    </NavigationContainer>
  );
}
