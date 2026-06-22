import api from "./api";
import { User } from "@/types";

export const uploadProfilePicture = (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/users/${userId}/profile-picture`, formData);
};

export const getProfilePicture = (userId: number) =>
    api.get(`/users/${userId}/profile-picture`, {
        responseType: "blob",
    });

export const getUserByEmail = (email: string) =>
    api.get<User>(`/users/email?email=${email}`);
