import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { analyzeReceiptFile } from "../services/receiptImportService";
import { getApiErrorMessage } from "../utils/format";

const CAMERA_ICON = require("../assets/accessories/camera.png");
const GALLERY_ICON = require("../assets/accessories/gallery.png");
const DOCUMENT_ICON = require("../assets/accessories/documentation.png");

const EXPENSE_RECEIPT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function useExpenseReceiptImport({ isPremium, navigation }) {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);

  const navigateToPreview = useCallback(
    async (fileAsset) => {
      setIsScanning(true);
      try {
        const analyzeResult = await analyzeReceiptFile(fileAsset);
        if (!analyzeResult?.items?.length) {
          Alert.alert(
            t("receiptImport.noItemsTitle"),
            t("receiptImport.noItemsMsg")
          );
          return;
        }

        navigation.navigate("HomeTab", { screen: "ReceiptPreview", params: { analyzeResult } });
      } catch (error) {
        Alert.alert(
          t("receiptImport.analysisErrorTitle"),
          getApiErrorMessage(error, t("receiptImport.analysisErrorMsg"))
        );
      } finally {
        setIsScanning(false);
      }
    },
    [navigation]
  );

  const pickCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("receiptImport.cameraPermissionTitle"), t("receiptImport.cameraPermissionMsg"));
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false
      });
    } catch (error) {
      Alert.alert(t("receiptImport.cameraErrorTitle"), t("receiptImport.cameraErrorMsg", { message: error.message || "" }));
      return;
    }

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.uri) {
      await navigateToPreview(asset);
    }
  }, [navigateToPreview]);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("receiptImport.galleryPermissionTitle"), t("receiptImport.galleryPermissionMsg"));
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false
      });
    } catch (error) {
      Alert.alert(t("receiptImport.galleryErrorTitle"), t("receiptImport.galleryErrorMsg", { message: error.message || "" }));
      return;
    }

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > EXPENSE_RECEIPT_MAX_FILE_SIZE) {
      Alert.alert(t("receiptImport.imageTooLargeTitle"), t("receiptImport.imageTooLargeMsg"));
      return;
    }

    await navigateToPreview(asset);
  }, [navigateToPreview]);

  const pickPdf = useCallback(async () => {
    let result;
    try {
      result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true
      });
    } catch (error) {
      Alert.alert(t("receiptImport.filePickerErrorTitle"), t("receiptImport.filePickerErrorMsg", { message: error.message || "" }));
      return;
    }

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > EXPENSE_RECEIPT_MAX_FILE_SIZE) {
      Alert.alert(t("receiptImport.pdfTooLargeTitle"), t("receiptImport.pdfTooLargeMsg"));
      return;
    }

    await navigateToPreview({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType || "application/pdf"
    });
  }, [navigateToPreview]);

  const handleScanReceipt = useCallback(async () => {
    if (!isPremium) {
      Alert.alert(
        t("receiptImport.premiumTitle"),
        t("receiptImport.premiumMsg"),
        [
          { text: t("receiptImport.premiumLater"), style: "cancel" },
          { text: t("receiptImport.premiumUpgrade"), onPress: () => navigation.navigate("SettingTab", { screen: "Payment" }) }
        ]
      );
      return;
    }

    Alert.alert(t("receiptImport.sourceTitle"), t("receiptImport.sourceMsg"), [
      { text: t("receiptImport.cameraOption"), image: CAMERA_ICON, accessibilityLabel: t("receiptImport.cameraAccLabel"), onPress: pickCamera },
      { text: t("receiptImport.galleryOption"), image: GALLERY_ICON, accessibilityLabel: t("receiptImport.galleryAccLabel"), onPress: pickImage },
      { text: t("receiptImport.documentOption"), image: DOCUMENT_ICON, accessibilityLabel: t("receiptImport.documentAccLabel"), onPress: pickPdf }
    ]);
  }, [isPremium, navigation, pickCamera, pickImage, pickPdf]);

  return {
    handleScanReceipt,
    isScanning
  };
}
