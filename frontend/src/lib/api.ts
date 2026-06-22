import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
});

// Attach access token to every request (if available)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Helper: force logout by clearing tokens and redirecting to login
const forceLogout = () => {
    try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

    } catch (e) {
        console.error("Failed to clear auth data during logout:", e);
    }

    // Inform the user
    toast.error("Your session has expired. Please log in again.");

    // Hard redirect to login so all state gets reset
    if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
    }
};

// Response interceptor to handle expired access tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        const status = error?.response?.status;

        // If there's no response or no config, just reject
        if (!originalRequest || !status) {
            return Promise.reject(error);
        }

        // Only handle 401 errors for non-auth endpoints
        const isUnauthorized = status === 401;
        const url: string = originalRequest.url || "";
        const isLoginRequest = url.includes("/auth/login");
        const isRefreshRequest = url.includes("/auth/refresh-token");

        // Avoid infinite loops and don't try to refresh on login/refresh endpoints
        if (
            isUnauthorized &&
            !(originalRequest as any)._retry &&
            !isLoginRequest &&
            !isRefreshRequest
        ) {
            (originalRequest as any)._retry = true;

            const storedRefreshToken = localStorage.getItem("refreshToken");

            // If we don't have a refresh token, just force logout
            if (!storedRefreshToken) {
                forceLogout();
                return Promise.reject(error);
            }

            try {
                // Try to refresh the tokens
                const refreshResponse = await api.post("/auth/refresh-token", {
                    refreshToken: storedRefreshToken,
                });

                const { accessToken, refreshToken } = refreshResponse.data || {};

                if (!accessToken || !refreshToken) {
                    // Backend didn't return tokens as expected; treat as failure
                    forceLogout();
                    return Promise.reject(error);
                }

                // Store the new tokens
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                // Update the original request with the new access token
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Retry the original request with the new token
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh also failed -> force logout
                forceLogout();
                return Promise.reject(refreshError);
            }
        }

        // Any other error: just pass through
        return Promise.reject(error);
    }
);

export default api;
