import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { getApiErrorMessage } from "../../utils/format";
import { getRetryAfterSeconds } from "../../utils/authOtp";
import useOtpInput from "../../hooks/useOtpInput";
import useOtpCountdown from "../../hooks/useOtpCountdown";
import OtpInput from "../../components/Otp/OtpInput";
import OtpVerificationLayout from "../../components/Otp/OtpVerificationLayout";

export default function ForgotPasswordOtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const email = route.params?.email || "";

  const { otp, code, inputRefs, handleChange, handleKeyDown, reset } = useOtpInput();
  const { resendDisabled, countdown, startCountdown, stopCountdown } = useOtpCountdown();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigation.navigate("ForgotPassword");
  }, [email, navigation]);

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError(t("auth.otp.missingCode"));
      return;
    }
    setError("");
    setLoading(true);

    try {
      await apiClient.post(API_ENDPOINTS.VERIFY_RESET_OTP, { email, otp: code });
      setLoading(false);
      navigation.navigate("ResetPassword", { email, otp: code });
    } catch (err) {
      setLoading(false);
      setError(getApiErrorMessage(err, t("auth.otp.resetInvalid")));
    }
  };

  const handleResend = async () => {
    startCountdown(60);
    setError("");
    reset();

    try {
      await apiClient.post(API_ENDPOINTS.RESEND_OTP, { email });
      Alert.alert(t("auth.otp.resentTitle"), t("auth.otp.resentMessage"));
    } catch (err) {
      const retryAfterSeconds = getRetryAfterSeconds(err);
      if (retryAfterSeconds > 0) {
        startCountdown(retryAfterSeconds);
        return;
      }
      setError(getApiErrorMessage(err, t("auth.otp.resendFailed")));
      stopCountdown();
    }
  };

  return (
    <OtpVerificationLayout
      title={t("auth.otp.resetTitle")}
      subtitle={t("auth.otp.resetSubtitle")}
      email={email}
      error={error}
      actionLabel={t("auth.common.verify")}
      actionLoading={loading}
      actionDisabled={loading}
      onAction={handleSubmit}
      resendDisabled={resendDisabled}
      countdown={countdown}
      onResend={handleResend}
    >
      <OtpInput otp={otp} inputRefs={inputRefs} onChange={handleChange} onKeyDown={handleKeyDown} />
    </OtpVerificationLayout>
  );
}
