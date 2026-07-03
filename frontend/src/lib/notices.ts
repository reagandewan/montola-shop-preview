import api from "./api";

export type NoticeType = "INFO" | "IMPORTANT" | "URGENT";

export interface Notice {
    id: number;
    title: string;
    message: string;
    type: NoticeType;
    link: string;
    active: boolean;
    orderIndex: number;
}

// ---- Public ----
export const getNotices = async () => {
    const res = await api.get<Notice[]>("/v1/notices");
    return res.data;
};

// ---- Admin ----
export const getAdminNotices = async () => {
    const res = await api.get<Notice[]>("/v1/notices/admin");
    return res.data;
};

export const createNotice = async (data: Partial<Notice>) => {
    const res = await api.post<Notice>("/v1/notices/admin", data);
    return res.data;
};

export const updateNotice = async (id: number, data: Partial<Notice>) => {
    const res = await api.put<Notice>(`/v1/notices/admin/${id}`, data);
    return res.data;
};

export const deleteNotice = async (id: number) => {
    await api.delete(`/v1/notices/admin/${id}`);
};
