"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image"; // Added import for Image component
import { useAuth } from "@/contexts/AuthContext";
import { changePassword } from "@/lib/auth";
import { uploadProfilePicture, getProfilePicture } from "@/lib/user";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/LoadingSpinner";
import { HiCamera, HiLockClosed, HiUserCircle } from "react-icons/hi";

interface ProfileContentProps {
    className?: string;
}

import { useI18n } from "@/contexts/I18nProvider";

export default function ProfileContent({ className = "" }: ProfileContentProps) {
    const { user, updateUser } = useAuth();
    const { t } = useI18n();
    const [isUploading, setIsUploading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isAvatarLoading, setIsAvatarLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password form state
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const fetchAvatar = async () => {
        if (!user?.id || !user.hasProfilePicture) return;
        setIsAvatarLoading(true);
        try {
            const res = await getProfilePicture(user.id);
            const blob = res.data as Blob;
            if (!blob || blob.size === 0) {
                setAvatarUrl(null);
                return;
            }
            if (avatarUrl) URL.revokeObjectURL(avatarUrl);
            setAvatarUrl(URL.createObjectURL(blob));
        } catch (error) {
            console.error("Failed to fetch avatar:", error);
            setAvatarUrl(null);
        } finally {
            setIsAvatarLoading(false);
        }
    };

    useEffect(() => {
        fetchAvatar();
        return () => {
            if (avatarUrl) URL.revokeObjectURL(avatarUrl);
        };
    }, [user?.id, user?.hasProfilePicture]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!user?.id) {
            toast.error(t("student.profile.userIdNotFound"));
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error(t("student.profile.imageUploadError"));
            return;
        }

        setIsUploading(true);
        try {
            await uploadProfilePicture(user.id, file);
            updateUser({ hasProfilePicture: true });
            toast.success(t("student.profile.profilePictureSuccess"));
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || t("student.profile.profilePictureError"));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error(t("student.profile.passwordMismatch"));
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error(t("student.profile.passwordLength"));
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword({
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });

            toast.success(t("student.profile.passwordSuccess"));
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            if (err.response?.status === 401) {
                toast.error(t("student.profile.wrongPassword"));
            } else {
                toast.error(err.response?.data?.message || t("student.profile.changePasswordError"));
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className={className}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">{t("student.profile.title")}</h1>
                    <p className="text-gray-600 mt-2">{t("student.profile.subtitle")}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar Management */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center text-white text-4xl font-black overflow-hidden relative border-4 border-white shadow-md">
                                    {(user.hasProfilePicture && avatarUrl) ? (
                                        <Image
                                            src={avatarUrl}
                                            alt={user.fullName}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                                    )}
                                    {(isUploading || isAvatarLoading) && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <LoadingSpinner size="sm" variant="white" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors text-primary-600"
                                    disabled={isUploading}
                                >
                                    <HiCamera size={20} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <div className="text-center mt-6">
                                <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                                <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {user.roles.map(role => (
                                        <span key={role} className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                            {t(`roles.${role.toLowerCase()}`)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Change Password */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                    <HiLockClosed size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{t("student.profile.security")}</h3>
                                    <p className="text-sm text-gray-500">{t("student.profile.updatePasswordSubtitle")}</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t("student.profile.currentPassword")}</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.oldPassword}
                                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t("student.profile.newPassword")}</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t("student.profile.confirmNewPassword")}</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isChangingPassword ? (
                                            <>
                                                <LoadingSpinner size="sm" variant="white" />
                                                {t("student.profile.updating")}
                                            </>
                                        ) : (
                                            t("student.profile.updatePassword")
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Account Info (Read-only for now) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <HiUserCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{t("student.profile.personalInfo")}</h3>
                                    <p className="text-sm text-gray-500">{t("student.profile.registeredDetails")}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t("student.profile.fullName")}</p>
                                    <p className="text-gray-900 font-bold bg-gray-50 px-4 py-2 rounded-lg">{user.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t("student.profile.emailAddress")}</p>
                                    <p className="text-gray-900 font-bold bg-gray-50 px-4 py-2 rounded-lg">{user.email}</p>
                                </div>
                                {user.phone && (
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t("student.profile.phoneNumber")}</p>
                                        <p className="text-gray-900 font-bold bg-gray-50 px-4 py-2 rounded-lg">{user.phone}</p>
                                    </div>
                                )}
                                {user.createdAt && (
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t("student.profile.memberSince")}</p>
                                        <p className="text-gray-900 font-bold bg-gray-50 px-4 py-2 rounded-lg">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
