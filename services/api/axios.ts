import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request: Tự động đính kèm accessToken vào header trước khi gửi lên Backend
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor cho Response: Bắt lỗi 401 để tự động Refresh Token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và request này chưa từng thử refresh trước đó
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Đánh dấu đã thử retry để tránh lặp vô hạn

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('Không tìm thấy Refresh Token');

                // Gọi API Backend để đổi Refresh Token lấy Access Token mới
                const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                const { accessToken } = res.data;

                // Lưu Access Token mới vào bộ nhớ
                localStorage.setItem('accessToken', accessToken);

                // Cập nhật lại header Authorization của request cũ và thực thi lại nó
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Nếu ngay cả việc Refresh Token cũng thất bại -> Xóa hết phiên đăng nhập và đẩy về Login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userProfile');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);