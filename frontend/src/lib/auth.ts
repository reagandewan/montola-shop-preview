import api from "./api";

export const login = (email: string, password: string) =>
    api.post("/auth/login", { email, password });

export const register = (email: string, fullName: string, password: string, phone?: string) =>
    api.post("/auth/register", { email, fullName, phone, password });

export const activateAccount = (email: string, token: string) =>
    api.post("/auth/activate", { email, token });

export const resendActivationToken = (email: string) =>
    api.post("/auth/resend-activation", { email });

export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data);

export const requestPasswordReset = (email: string) =>
    api.post("/auth/forgot-password", { email });

export const resetPassword = (email: string, token: string, newPassword: string) =>
    api.post("/auth/reset-password", { email, token, newPassword });