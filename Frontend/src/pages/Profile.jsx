import {useContext, useEffect, useState} from "react";
import {BadgeCheck, LoaderCircle, Mail, Sparkles, User} from "lucide-react";
import toast from "react-hot-toast";
import Dashboard from "../components/Dashboard.jsx";
import Input from "../components/Input.jsx";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {AppContext} from "../context/AppContext.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import {validateEmail} from "../util/validation.js";
import uploadProfileImage from "../util/uploadProfileImage.js";

const Profile = () => {
    useUser();

    const {user, setUser} = useContext(AppContext);
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

    useEffect(() => {
        if (!user) {
            return;
        }

        setFullName(user.fullName || "");
        setEmail(user.email || "");
        setCurrentImageUrl(user.profileImageUrl || "");
    }, [user]);

    const persistToken = (token, nextEmail) => {
        if (localStorage.getItem("token")) {
            localStorage.setItem("token", token);
            sessionStorage.removeItem("token");
            if (localStorage.getItem("rememberedEmail") !== null) {
                localStorage.setItem("rememberedEmail", nextEmail);
            }
            return;
        }

        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");
    };

    const handleShowPasswordFields = () => {
        setShowPasswordFields(true);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!fullName.trim()) {
            setError("Vui lòng nhập họ và tên.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }

        const wantsPasswordChange = showPasswordFields;

        if (wantsPasswordChange) {
            if (!currentPassword.trim()) {
                setError("Vui lòng nhập mật khẩu hiện tại.");
                return;
            }

            if (!newPassword.trim()) {
                setError("Vui lòng nhập mật khẩu mới.");
                return;
            }

            if (newPassword.trim().length < 6) {
                setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
                return;
            }

            if (newPassword !== confirmPassword) {
                setError("Xác nhận mật khẩu mới chưa khớp.");
                return;
            }
        }

        setError("");
        setIsSaving(true);

        try {
            let profileImageUrl = currentImageUrl;

            if (profilePhoto) {
                profileImageUrl = await uploadProfileImage(profilePhoto);
            }

            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
                fullName: fullName.trim(),
                email: email.trim(),
                profileImageUrl,
                currentPassword: currentPassword.trim(),
                newPassword: newPassword.trim(),
            });

            const {token, user: updatedUser} = response.data;

            persistToken(token, updatedUser.email || email.trim());
            setUser(updatedUser);
            setCurrentImageUrl(updatedUser.profileImageUrl || "");
            setProfilePhoto(null);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordFields(false);
            toast.success("Cập nhật hồ sơ thành công.");
        } catch (err) {
            console.error("Failed to update profile", err);
            setError(err.response?.data?.message || err.message || "Không thể cập nhật hồ sơ.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dashboard activeMenu="Hồ sơ">
            <div className="mx-auto my-6 max-w-5xl">
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-purple-900 p-6 text-white shadow-xl shadow-slate-200">
                        <div className="flex items-center gap-3 text-sm text-white/70">
                            <Sparkles size={18} />
                            Không gian cá nhân
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_280px]">
                            <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
                                {currentImageUrl ? (
                                    <img
                                        src={currentImageUrl}
                                        alt={fullName || "Ảnh đại diện"}
                                        className="h-20 w-20 rounded-3xl object-cover ring-2 ring-white/20"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
                                        <User size={34} />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-[0.24em] text-white/50">Tài khoản</p>
                                    <h1 className="truncate text-2xl font-semibold">{fullName || "Người dùng"}</h1>
                                    <p className="truncate text-sm text-white/70">{email || "Chưa có email"}</p>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Gói hiện tại</p>
                                <p className="mt-2 flex items-center gap-2 text-base font-semibold">
                                    <BadgeCheck size={16} className="text-emerald-300" />
                                    {user?.subscriptionPlan || "FREE"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
                        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
                            <h2 className="text-2xl font-semibold text-slate-900">Chỉnh sửa hồ sơ</h2>
                            <p className="text-sm text-slate-500">
                                Cập nhật thông tin cá nhân, ảnh đại diện và mật khẩu của bạn.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">Ảnh đại diện</h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Tải ảnh mới hoặc xoá ảnh hiện tại nếu muốn làm mới hồ sơ.
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
                                <div className="rounded-3xl border border-slate-100 bg-white p-4">
                                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
                                        <User size={16} />
                                        Thông tin cơ bản
                                    </div>
                                    <div className="space-y-4">
                                        <Input
                                            label="Họ và tên"
                                            value={fullName}
                                            onChange={(event) => setFullName(event.target.value)}
                                            placeholder="Nguyễn Văn A"
                                        />
                                        <Input
                                            label="Email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            placeholder="tenban@example.com"
                                            type="email"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-100 bg-white p-4">
                                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
                                        <Mail size={16} />
                                        Đổi mật khẩu
                                    </div>
                                    <div className="space-y-4">
                                        {showPasswordFields ? (
                                            <div className="space-y-4">
                                                <Input
                                                    label="Mật khẩu hiện tại"
                                                    value={currentPassword}
                                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                                    placeholder="Nhập mật khẩu hiện tại"
                                                    type="password"
                                                />
                                                <Input
                                                    label="Mật khẩu mới"
                                                    value={newPassword}
                                                    onChange={(event) => setNewPassword(event.target.value)}
                                                    placeholder="Ít nhất 6 ký tự"
                                                    type="password"
                                                />
                                                <Input
                                                    label="Xác nhận mật khẩu mới"
                                                    value={confirmPassword}
                                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    type="password"
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleShowPasswordFields}
                                                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                                            >
                                                Đổi mật khẩu
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error ? (
                                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                            ) : null}

                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Sau khi đổi email, hệ thống sẽ tự cập nhật phiên đăng nhập của bạn.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? (
                                        <>
                                            <LoaderCircle className="animate-spin" size={18} />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        "Lưu thay đổi"
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </Dashboard>
    );
};

export default Profile;
