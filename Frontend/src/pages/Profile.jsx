import {useContext, useEffect, useState} from "react";
import {BadgeCheck, LoaderCircle, Mail, ShieldCheck, Sparkles, User, Zap} from "lucide-react";
import toast from "react-hot-toast";
import Dashboard from "../components/Dashboard.jsx";
import Input from "../components/Input.jsx";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import EmailNotificationSettings from "../components/EmailNotificationSettings.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {AppContext} from "../context/AppContext.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import {validateEmail} from "../util/validation.js";
import uploadProfileImage from "../util/uploadProfileImage.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { usePerformance } from "../context/PerformanceContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";

const Profile = () => {
    useUser();
    const { t, language } = useTranslation();
    usePageTitle(t("profile.title"));

    const {user, setUser} = useContext(AppContext);
    const { isLowPerf, togglePerformanceMode } = usePerformance();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("info");

    useEffect(() => {
        if (!user) return;
        setFullName(user.fullName || "");
        setEmail(user.email || "");
        setCurrentImageUrl(user.profileImageUrl || "");
    }, [user]);

    const handleShowPasswordFields = () => {
        setShowPasswordFields(true);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!fullName.trim()) { setError(t("profile.fullNameRequired")); return; }
        if (!validateEmail(email)) { setError(t("profile.emailInvalid")); return; }

        if (showPasswordFields) {
            if (!currentPassword.trim()) { setError(t("profile.currentPasswordRequired")); return; }
            if (!newPassword.trim()) { setError(t("profile.newPasswordRequired")); return; }
            if (newPassword.trim().length < 6) { setError(t("profile.newPasswordMin6")); return; }
            if (newPassword !== confirmPassword) { setError(t("profile.confirmPasswordMismatch")); return; }
        }

        setError("");
        setIsSaving(true);

        try {
            let profileImageUrl = currentImageUrl;
            if (profilePhoto) profileImageUrl = await uploadProfileImage(profilePhoto);

            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
                fullName: fullName.trim(),
                email: email.trim(),
                profileImageUrl,
                currentPassword: currentPassword.trim(),
                newPassword: newPassword.trim(),
            });

            const { user: updatedUser } = response.data;
            setUser(updatedUser);
            setCurrentImageUrl(updatedUser.profileImageUrl || "");
            setProfilePhoto(null);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordFields(false);
            toast.success(t("profile.updateSuccessPeriod"));
        } catch (err) {
            console.error("Failed to update profile", err);
            setError(err.response?.data?.message || err.message || t("profile.failedToUpdate"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dashboard activeMenu="Hồ sơ">
            <div className="mx-auto my-6 max-w-5xl">
                <div className="space-y-6">
                    {/* Hero banner */}
                    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-r from-slate-900 via-slate-800 to-violet-900 p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 text-sm text-white/70">
                            <Sparkles size={18} />
                            {t("profile.personalSpace")}
                        </div>
                        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
                            <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
                                {currentImageUrl ? (
                                    <img
                                        src={currentImageUrl}
                                        alt={fullName || t("profile.avatarAlt")}
                                        className="h-20 w-20 rounded-3xl object-cover ring-2 ring-white/20"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
                                        <User size={34} />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-[0.24em] text-white/50">{t("profile.accountLabel")}</p>
                                    <div className="flex items-center gap-2">
                                        <h1 className="truncate text-2xl font-semibold">{fullName || t("profile.userFallback")}</h1>
                                        {user?.role === "admin" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wide border border-amber-500/30 shrink-0">
                                                <ShieldCheck size={11} />
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-sm text-white/70">{email || t("profile.noEmailYet")}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">{t("profile.currentPackage")}</p>
                                    <p className="mt-1 flex items-center gap-2 text-base font-semibold">
                                        <BadgeCheck size={16} className="text-emerald-300" />
                                        {user?.subscriptionPlan || "FREE"}
                                    </p>
                                    {user?.subscriptionExpiresAt && (
                                        <p className="mt-1 text-[10px] text-white/50">
                                            {t("profile.expiresAt")} {new Date(user.subscriptionExpiresAt).toLocaleDateString(language === "vi" ? 'vi-VN' : 'en-US')}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Tab navigation */}
                    <div className="flex gap-1 border-b border-slate-200 dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => setActiveTab("info")}
                            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === "info"
                                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            {t("profile.personalInfoTab")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("email")}
                            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === "email"
                                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            {t("profile.emailSettingsTab")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("display")}
                            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === "display"
                                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            {t("profile.displayTab")}
                        </button>
                    </div>

                    {/* Email settings tab */}
                    {activeTab === "email" && (
                        <section className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-2 border-b border-slate-100 dark:border-white/10 pb-5 mb-6">
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("profile.emailSettingsTab")}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t("profile.emailSettingsDesc")}
                                </p>
                            </div>
                            <EmailNotificationSettings />
                        </section>
                    )}

                    {/* Display / Performance settings tab */}
                    {activeTab === "display" && (
                        <section className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-2 border-b border-slate-100 dark:border-white/10 pb-5 mb-6">
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("profile.displayTab")}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t("profile.displayDesc")}
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/15">
                                        <Zap size={18} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t("profile.lowPerfMode")}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {t("profile.lowPerfModeDesc")}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isLowPerf}
                                    onClick={togglePerformanceMode}
                                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                                        isLowPerf ? "bg-violet-600" : "bg-slate-200 dark:bg-white/20"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[left] duration-200 ${
                                            isLowPerf ? "left-5" : "left-0.5"
                                        }`}
                                    />
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Profile info tab */}
                    {activeTab === "info" && (
                    <section className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col gap-2 border-b border-slate-100 dark:border-white/10 pb-5">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("profile.editProfileTitle")}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t("profile.editProfileDesc")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-5">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("profile.avatarTitle")}</h3>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            {t("profile.avatarDesc")}
                                        </p>
                                    </div>
                                    <ProfilePhotoSelector
                                        image={profilePhoto}
                                        setImage={setProfilePhoto}
                                        currentImageUrl={currentImageUrl}
                                        onRemoveCurrentImage={() => setCurrentImageUrl("")}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <User size={16} />
                                        {t("profile.basicInfoTitle")}
                                    </div>
                                    <div className="space-y-4">
                                        <Input
                                            label={t("profile.fullNameLabel")}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder={t("profile.fullNamePlaceholder")}
                                        />
                                        <Input
                                            label={t("profile.emailLabel")}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t("profile.emailPlaceholder")}
                                            type="email"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <Mail size={16} />
                                        {t("profile.changePassword")}
                                    </div>
                                    <div className="space-y-4">
                                        {showPasswordFields ? (
                                            <div className="space-y-4">
                                                <Input label={t("profile.currentPasswordLabel")} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t("profile.currentPasswordPlaceholder")} type="password" />
                                                <Input label={t("profile.newPasswordLabel")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t("profile.newPasswordPlaceholder")} type="password" />
                                                <Input label={t("profile.confirmPasswordLabel")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("profile.confirmPasswordPlaceholder")} type="password" />
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleShowPasswordFields}
                                                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:border-slate-400 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5"
                                            >
                                                {t("profile.changePassword")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</p>
                            )}

                            <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t("profile.changeEmailNotice")}
                                </p>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? (
                                        <><LoaderCircle className="animate-spin" size={18} />{t("profile.saving")}</>
                                    ) : (
                                        t("profile.saveChanges")
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                    )}
                </div>
            </div>
        </Dashboard>
    );
};

export default Profile;
