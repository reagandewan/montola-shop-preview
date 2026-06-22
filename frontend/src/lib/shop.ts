import api from "./api";
import {
    ShopLevel,
    ShopProductCard,
    ShopProductDetail,
    ShopProductContent,
    ShopBundle,
    ShopPurchase,
    ShopFilters,
} from "@/types/shop";

// ==================== Public catalog ====================

export const getLevels = async () => {
    const res = await api.get<ShopLevel[]>("/v1/shop/levels");
    return res.data;
};

export const getProducts = async (filters: ShopFilters = {}) => {
    const res = await api.get<ShopProductCard[]>("/v1/shop/products", { params: filters });
    return res.data;
};

export const getFeaturedProducts = async () => {
    const res = await api.get<ShopProductCard[]>("/v1/shop/featured");
    return res.data;
};

export const getProduct = async (id: number) => {
    const res = await api.get<ShopProductDetail>(`/v1/shop/products/${id}`);
    return res.data;
};

export const getBundles = async () => {
    const res = await api.get<ShopBundle[]>("/v1/shop/bundles");
    return res.data;
};

export const getBundle = async (id: number) => {
    const res = await api.get<ShopBundle>(`/v1/shop/bundles/${id}`);
    return res.data;
};

// ==================== Gated access ====================

export const getProductContent = async (id: number) => {
    const res = await api.get<ShopProductContent>(`/v1/shop/products/${id}/content`);
    return res.data;
};

export const getDownloadLink = async (id: number) => {
    const res = await api.get<{ url: string; fileId: string; expiresInSeconds: number; watermark: string }>(
        `/v1/shop/products/${id}/download`
    );
    return res.data;
};

// ==================== Purchases & payments ====================

export const getMyPurchases = async () => {
    const res = await api.get<ShopPurchase[]>("/v1/shop/my-purchases");
    return res.data;
};

export const submitShopPayment = async (data: {
    productId?: number;
    bundleId?: number;
    amount?: number;
    senderNumber?: string;
    transactionId?: string;
    paymentMethod?: string;
}) => {
    const res = await api.post("/v1/shop/payments/submit", data);
    return res.data;
};

export interface ShopPaymentRecord {
    id: number;
    productId: number | null;
    bundleId: number | null;
    itemTitle: string | null;
    amount: number;
    status: "PENDING" | "VERIFIED" | "REJECTED";
}

export const getMyShopPayments = async () => {
    const res = await api.get<ShopPaymentRecord[]>("/v1/shop/payments/my");
    return res.data;
};

// ==================== Admin: verify shop payments ====================

export interface AdminShopPayment extends ShopPaymentRecord {
    userName: string | null;
    senderNumber: string;
    transactionId: string;
    paymentMethod: string;
    productTitle: string | null;
    bundleTitle: string | null;
}

export const getAllShopPayments = async () => {
    const res = await api.get<AdminShopPayment[]>("/v1/shop/payments");
    return res.data;
};

export const getUnverifiedShopPayments = async () => {
    const res = await api.get<AdminShopPayment[]>("/v1/shop/payments/unverified");
    return res.data;
};

export const verifyShopPayment = async (id: number) => {
    const res = await api.put(`/v1/shop/payments/${id}/verify`);
    return res.data;
};

export const rejectShopPayment = async (id: number) => {
    const res = await api.put(`/v1/shop/payments/${id}/reject`);
    return res.data;
};

// ==================== Admin: manage products ====================

export const getAdminProducts = async () => {
    const res = await api.get<ShopProductCard[]>("/v1/shop/admin/products");
    return res.data;
};

export const createProduct = async (data: any) => {
    const res = await api.post<ShopProductCard>("/v1/shop/admin/products", data);
    return res.data;
};

export const updateProduct = async (id: number, data: any) => {
    const res = await api.put<ShopProductCard>(`/v1/shop/admin/products/${id}`, data);
    return res.data;
};

export const deleteProduct = async (id: number) => {
    await api.delete(`/v1/shop/admin/products/${id}`);
};

// ==================== Admin: manage bundles ====================

export const getAdminBundles = async () => {
    const res = await api.get<ShopBundle[]>("/v1/shop/admin/bundles");
    return res.data;
};

export const createBundle = async (data: any) => {
    const res = await api.post<ShopBundle>("/v1/shop/admin/bundles", data);
    return res.data;
};

export const updateBundle = async (id: number, data: any) => {
    const res = await api.put<ShopBundle>(`/v1/shop/admin/bundles/${id}`, data);
    return res.data;
};

export const deleteBundle = async (id: number) => {
    await api.delete(`/v1/shop/admin/bundles/${id}`);
};
