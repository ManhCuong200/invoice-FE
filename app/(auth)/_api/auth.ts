import { api } from '@/services/api/axios';

const BACKEND_URL = 'http://localhost:3001';

/**
 * Lấy URL chuyển hướng đăng nhập bằng Google từ Backend
 */
export const getGoogleLoginUrl = (): string => {
    return `${BACKEND_URL}/api/auth/google`;
};

/**
 * Gọi API làm mới Access Token từ Refresh Token
 */
export const refreshAccessTokenApi = async (refreshToken: string): Promise<{ accessToken: string }> => {
    const res = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
    return res.data;
};

/**
 * Gọi API Đăng xuất để xóa session trên backend
 */
export const logoutApi = async (userId: string): Promise<any> => {
    const res = await api.post('/auth/logout', { userId });
    return res.data;
};
