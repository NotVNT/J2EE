import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import PaymentCheckoutFallback from "../../components/Payment/PaymentCheckoutFallback";
import PaymentCheckoutHeader from "../../components/Payment/PaymentCheckoutHeader";
import { useAppColors } from "../../constants/colors";
import usePaymentCheckoutFlow from "../../hooks/usePaymentCheckoutFlow";
import { getSafeAreaBottom, getSafeAreaTop } from "../../utils/safeArea";
import { scale } from "../../utils/layoutScale";

const PAYOS_MERCHANT_HEADER_HEIGHT = 56;

export default function PaymentCheckoutScreen() {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const checkout = usePaymentCheckoutFlow();

  if (!checkout.checkoutUrl) {
    return <PaymentCheckoutFallback onBackToPayment={checkout.goBackToPayment} />;
  }

  const isDark = colors.BG === '#0F0D0C';

  return (
    <View style={[styles.container, { backgroundColor: colors.BG, paddingTop: getSafeAreaTop(insets), paddingBottom: getSafeAreaBottom(insets, 86) }]}>
      <PaymentCheckoutHeader
        canGoBack={checkout.canGoBack}
        onExit={checkout.goBackToPayment}
        onGoBack={checkout.goBackInWebView}
        title={checkout.title}
      />

      {checkout.isPageLoading ? (
        <View style={[styles.loadingOverlay, { backgroundColor: isDark ? "rgba(44,44,46,0.94)" : "rgba(255,255,255,0.94)" }]}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT }]}>Đang tải cổng thanh toán...</Text>
        </View>
      ) : null}

      <View style={[styles.checkoutFrame, { backgroundColor: colors.CARD }]}>
        <WebView
          ref={checkout.webViewRef}
          style={styles.checkoutWebView}
          source={{ uri: checkout.checkoutUrl }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          startInLoadingState
          onLoadStart={checkout.handleLoadStart}
          onLoadEnd={checkout.handleLoadEnd}
          onNavigationStateChange={checkout.handleNavigationStateChange}
          onShouldStartLoadWithRequest={checkout.handleShouldStartLoad}
          onError={checkout.handleWebViewError}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: scale(100),
    left: scale(16),
    right: scale(16),
    zIndex: 10,
    borderRadius: scale(16),
    paddingVertical: scale(20),
    alignItems: "center",
    gap: scale(10)
  },
  loadingText: {
    fontWeight: "600"
  },
  checkoutFrame: {
    flex: 1,
    overflow: "hidden",
  },
  checkoutWebView: {
    flex: 1,
    marginTop: -PAYOS_MERCHANT_HEADER_HEIGHT
  }
});
