import { useState, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent
} from "expo-speech-recognition";

/**
 * useVoiceInput — Custom hook quản lý toàn bộ luồng nhập liệu bằng giọng nói.
 *
 * Props:
 *   language  — mã ngôn ngữ (mặc định "vi-VN")
 *   onResult  — callback khi thu âm kết thúc, nhận transcript cuối cùng (string)
 *
 * Trả về:
 *   isRecording      — đang thu âm
 *   isStartingVoice  — đang khởi tạo session
 *   voiceTranscript  — text đã nhận dạng được (real-time)
 *   handleMicPress   — callback gắn vào nút mic (toggle start/stop)
 */
export default function useVoiceInput({ language = "vi-VN", onResult } = {}) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isStartingVoice, setIsStartingVoice] = useState(false);

  // Ref lưu transcript cuối cùng để callback onResult (tránh stale closure)
  const transcriptRef = useRef("");
  const onResultRef = useRef(onResult);
  const ignoreNextEndRef = useRef(false);
  onResultRef.current = onResult; // luôn fresh

  // ── Speech recognition events ──────────────────────────

  useSpeechRecognitionEvent("start", () => {
    setIsRecording(true);
    setIsStartingVoice(false);
    setVoiceTranscript("");
    transcriptRef.current = "";
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    if (ignoreNextEndRef.current) {
      ignoreNextEndRef.current = false;
      transcriptRef.current = "";
      setVoiceTranscript("");
      return;
    }

    // Gọi onResult với transcript cuối cùng
    const final = transcriptRef.current.trim();
    if (final && onResultRef.current) {
      onResultRef.current(final);
    }
    transcriptRef.current = "";
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results?.[0]?.transcript || "";
    setVoiceTranscript(text);
    transcriptRef.current = text;
  });

  useSpeechRecognitionEvent("error", (event) => {
    // "aborted" là lỗi do ta chủ động gọi abort() — bỏ qua, không hiển thị Alert
    if (event.error === "aborted") {
      console.log("[useVoiceInput] Speech recognition aborted (intentional)");
      return;
    }
    console.log("[useVoiceInput] Speech recognition error:", event);
    setIsRecording(false);
    setIsStartingVoice(false);
    Alert.alert(
      t("voiceInput.error"),
      event.message || t("voiceInput.errorMessage")
    );
  });

  // ── Toggle mic ─────────────────────────────────────────

  const handleMicPress = useCallback(async () => {
    // Đang recording → dừng (transcript sẽ được trả qua onResult trong event "end")
    if (isRecording || isStartingVoice) {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      return;
    }

    try {
      setIsStartingVoice(true);
      setVoiceTranscript("");
      transcriptRef.current = "";

      // Xin quyền microphone
      const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("voiceInput.permissionTitle"),
          t("voiceInput.permissionMessage"),
          [{ text: t("common.close"), style: "cancel" }]
        );
        setIsStartingVoice(false);
        return;
      }

      // Huỷ session cũ (nếu có) trước khi bắt đầu session mới
      ignoreNextEndRef.current = true;
      await ExpoSpeechRecognitionModule.abort();
      await new Promise((resolve) => setTimeout(resolve, 100));
      ignoreNextEndRef.current = false;

      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        continuous: false
      });

      // Safety timeout: reset isStartingVoice nếu "start" event không bao giờ fire
      setTimeout(() => {
        setIsStartingVoice(false);
      }, 3000);
    } catch (err) {
      console.error("[useVoiceInput] handleMicPress error:", err);
      ignoreNextEndRef.current = false;
      setIsStartingVoice(false);
      Alert.alert(t("auth.common.error"), t("voiceInput.startFailed"));
    }
  }, [isRecording, isStartingVoice, language]);

  return {
    isRecording,
    isStartingVoice,
    voiceTranscript,
    handleMicPress
  };
}
