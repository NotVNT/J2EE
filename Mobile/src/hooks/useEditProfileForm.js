import { useCallback, useContext, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../constants/api";
import apiClient from "../services/apiClient";
import { tokenStorage } from "../storage/tokenStorage";
import { getApiErrorMessage } from "../utils/format";
import uploadProfileImage from "../utils/profileImage";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function useEditProfileForm() {
  const { t } = useTranslation();
  const { user, refreshUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setCurrentImageUrl(user?.profileImageUrl || "");
    setProfilePhoto(null);
  }, [user]);

  const onPickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("editProfile.permissionTitle"), t("editProfile.permissionMsg"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    if (!result.canceled && result.assets?.length) {
      setProfilePhoto(result.assets[0]);
    }
  }, []);

  const onRemoveImage = useCallback(() => {
    setProfilePhoto(null);
    setCurrentImageUrl("");
  }, []);

  const onSave = useCallback(async () => {
    if (!fullName.trim()) {
      Alert.alert(t("editProfile.missingInfoTitle"), t("editProfile.missingName"));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t("editProfile.invalidEmailTitle"), t("editProfile.invalidEmailMsg"));
      return;
    }

    if (showPasswordFields) {
      if (!currentPassword.trim()) {
        Alert.alert(t("editProfile.missingInfoTitle"), t("editProfile.missingCurrentPw"));
        return;
      }
      if (!newPassword.trim() || newPassword.trim().length < 6) {
        Alert.alert(t("editProfile.invalidNewPwTitle"), t("editProfile.invalidNewPwMsg"));
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert(t("editProfile.pwMismatchTitle"), t("editProfile.pwMismatchMsg"));
        return;
      }
    }

    setSaving(true);
    try {
      let profileImageUrl = currentImageUrl;
      if (profilePhoto?.uri) {
        profileImageUrl = await uploadProfileImage(profilePhoto);
      }

      const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, {
        fullName: fullName.trim(),
        email: email.trim(),
        profileImageUrl,
        currentPassword: showPasswordFields ? currentPassword.trim() : "",
        newPassword: showPasswordFields ? newPassword.trim() : ""
      });

      const nextToken = response?.data?.token;
      if (nextToken) {
        await tokenStorage.setToken(nextToken);
      }

      await refreshUser();
      setProfilePhoto(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordFields(false);
      Alert.alert(t("common.success"), t("editProfile.updateSuccess"));
    } catch (error) {
      Alert.alert(t("editProfile.updateFailTitle"), getApiErrorMessage(error, t("editProfile.updateFailMsg")));
    } finally {
      setSaving(false);
    }
  }, [
    confirmPassword,
    currentImageUrl,
    currentPassword,
    email,
    fullName,
    newPassword,
    profilePhoto,
    refreshUser,
    showPasswordFields
  ]);

  return {
    confirmPassword,
    currentPassword,
    email,
    fullName,
    newPassword,
    onPickImage,
    onRemoveImage,
    onSave,
    previewUri: profilePhoto?.uri || currentImageUrl,
    saving,
    setConfirmPassword,
    setCurrentPassword,
    setEmail,
    setFullName,
    setNewPassword,
    setShowPasswordFields,
    showPasswordFields
  };
}
