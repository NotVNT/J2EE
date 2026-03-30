import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";

const APP_RESULT_PREFIX = "moneymanager://payment/";
const WEB_SUCCESS_PATH = "/payment/success";
const WEB_CANCEL_PATH = "/payment/cancel";

export default function PaymentCheckoutScreen() {
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
      return `Thanh toan ${planName}`;
    }
    return "Thanh toan";
  }, [planName]);

  const deriveResultFromUrl = (parsedUrl, rawUrl) => {
    if (rawUrl.includes(WEB_CANCEL_PATH) || parsedUrl.pathname.endsWith("/cancel")) {
      return "cancel";
    }
    if (rawUrl.includes(WEB_SUCCESS_PATH) || parsedUrl.pathname.endsWith("/success")) {
      return "success";
    }
    if (rawUrl.startsWith(APP_RESULT_PREFIX)) {
      return rawUrl.slice(APP_RESULT_PREFIX.length).split("?")[0] || "success";
    }
    return "success";
  };

  const parseUrlDetails = (rawUrl) => {
    const [baseUrl, queryString = ""] = rawUrl.split("?");
    const path = baseUrl.includes("://")
      ? `/${baseUrl.split("://")[1].split("/").slice(1).join("/")}`
      : baseUrl;

    const searchParams = new Map();
    queryString.split("&").filter(Boolean).forEach((item) => {
      const [key, value = ""] = item.split("=");
      searchParams.set(decodeURIComponent(key), decodeURIComponent(value));
    });

    return {
      pathname: path,
      getParam: (key) => searchParams.get(key) || ""
    };
  };

  const moveToResultScreen = (resultUrl) => {
    try {
      const parsedUrl = parseUrlDetails(resultUrl);
      const params = {
        result: deriveResultFromUrl(parsedUrl, resultUrl),
        orderCode: parsedUrl.getParam("orderCode") || orderCode || "",
        status: parsedUrl.getParam("status") || "",
        id: parsedUrl.getParam("id") || ""
      };

      navigation.replace("PaymentResult", params);
      return true;
    } catch {
      return false;
    }
  };

  const isResultUrl = (url) => {
    return url.startsWith(APP_RESULT_PREFIX)
      || url.includes(WEB_SUCCESS_PATH)
      || url.includes(WEB_CANCEL_PATH);
  };

  const handleInterceptedUrl = async (url) => {
    if (isResultUrl(url)) {
      return moveToResultScreen(url);
    }

    const lowerUrl = url.toLowerCase();
    const isExternalScheme = !lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://") && !lowerUrl.startsWith("about:blank");
    if (!isExternalScheme) {
      return false;
    }

    try {
      await Linking.openURL(url);
      return true;
    } catch {
      Alert.alert("Khong mo duoc lien ket", "Ung dung khong the mo lien ket thanh toan ben ngoai.");
      return true;
    }
  };

  const handleShouldStartLoad = (request) => {
    const url = request?.url || "";
    if (!url) {
      return true;
    }

    if (isResultUrl(url)) {
      moveToResultScreen(url);
      return false;
    }

    const lowerUrl = url.toLowerCase();
    const isExternalScheme = !lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://") && !lowerUrl.startsWith("about:blank");
    if (isExternalScheme) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Khong mo duoc lien ket", "Ung dung khong the mo lien ket thanh toan ben ngoai.");
      });
      return false;
    }

    return true;
  };

  if (!checkoutUrl) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Khong tim thay lien ket thanh toan</Text>
        <Text style={styles.fallbackText}>Hay quay lai va tao giao dich moi.</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.replace("Payment")}>
          <Text style={styles.primaryButtonText}>Quay lai thanh toan</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>Ban co the thanh toan ngay trong app. Neu can mo app ngan hang, ung dung se bat lien ket ngoai.</Text>
        </View>
        {canGoBack ? (
          <Pressable style={styles.secondaryButton} onPress={() => webViewRef.current?.goBack()}>
            <Text style={styles.secondaryButtonText}>Lui</Text>
          </Pressable>
        ) : null}
      </View>

      {isPageLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Dang tai cong thanh toan...</Text>
        </View>
      ) : null}

      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        startInLoadingState
        onLoadStart={() => setIsPageLoading(true)}
        onLoadEnd={() => setIsPageLoading(false)}
        onNavigationStateChange={(navState) => {
          setCanGoBack(Boolean(navState?.canGoBack));
          handleInterceptedUrl(navState?.url || "");
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onError={() => {
          setIsPageLoading(false);
          Alert.alert("Tai trang that bai", "Khong the tai cong thanh toan. Ban vui long thu lai.");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  headerTextWrap: {
    flex: 1
  },
  headerTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700"
  },
  headerSubtitle: {
    color: "#475569",
    marginTop: 4,
    lineHeight: 20
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff"
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "700"
  },
  loadingOverlay: {
    position: "absolute",
    top: 100,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    gap: 10
  },
  loadingText: {
    color: "#334155",
    fontWeight: "600"
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc"
  },
  fallbackTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center"
  },
  fallbackText: {
    color: "#475569",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  }
});
