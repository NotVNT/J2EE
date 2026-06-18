import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  buildPaymentResultParams,
  isExternalPaymentScheme,
  isPaymentResultUrl
} from "../utils/paymentUrl";

export default function usePaymentCheckoutFlow() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const webViewRef = useRef(null);

  const checkoutUrl = route.params?.checkoutUrl ? String(route.params.checkoutUrl) : "";
  const orderCode = route.params?.orderCode ? String(route.params.orderCode) : "";
  const planName = route.params?.planName ? String(route.params.planName) : "";

  const [canGoBack, setCanGoBack] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const title = useMemo(() => {
    if (planName) {
      return `${planName}`;
    }
    return;
  }, [planName]);

  const moveToResultScreen = useCallback((resultUrl) => {
    try {
      navigation.replace("PaymentResult", buildPaymentResultParams(resultUrl, orderCode));
      return true;
    } catch {
      return false;
    }
  }, [navigation, orderCode]);

  const handleInterceptedUrl = useCallback(async (url) => {
    if (isPaymentResultUrl(url)) {
      return moveToResultScreen(url);
    }

    if (!isExternalPaymentScheme(url)) {
      return false;
    }

    try {
      await Linking.openURL(url);
      return true;
    } catch {
      Alert.alert(t("paymentCheckout.unableOpenLinkTitle"), t("paymentCheckout.unableOpenLinkMsg"));
      return true;
    }
  }, [moveToResultScreen]);

  const handleShouldStartLoad = useCallback((request) => {
    const url = request?.url || "";
    if (!url) {
      return true;
    }

    if (isPaymentResultUrl(url)) {
      moveToResultScreen(url);
      return false;
    }

    if (isExternalPaymentScheme(url)) {
      Linking.openURL(url).catch(() => {
        Alert.alert(t("paymentCheckout.unableOpenLinkTitle"), t("paymentCheckout.unableOpenLinkMsg"));
      });
      return false;
    }

    return true;
  }, [moveToResultScreen]);

  const handleNavigationStateChange = useCallback((navState) => {
    setCanGoBack(Boolean(navState?.canGoBack));
    handleInterceptedUrl(navState?.url || "");
  }, [handleInterceptedUrl]);

  const goBackInWebView = useCallback(() => {
    webViewRef.current?.goBack();
  }, []);

  const goBackToPayment = useCallback(() => {
    navigation.replace("Payment");
  }, [navigation]);

  const handleLoadStart = useCallback(() => {
    setIsPageLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsPageLoading(false);
  }, []);

  const handleWebViewError = useCallback(() => {
    setIsPageLoading(false);
    Alert.alert(t("paymentCheckout.pageLoadFailTitle"), t("paymentCheckout.pageLoadFailMsg"));
  }, []);

  return {
    canGoBack,
    checkoutUrl,
    goBackInWebView,
    goBackToPayment,
    handleLoadEnd,
    handleLoadStart,
    handleNavigationStateChange,
    handleShouldStartLoad,
    handleWebViewError,
    isPageLoading,
    title,
    webViewRef
  };
}
