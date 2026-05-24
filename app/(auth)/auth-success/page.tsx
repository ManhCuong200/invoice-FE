'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            // 1. Lưu trữ an toàn cặp Token vào LocalStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            try {
                // 2. Giải mã JWT thủ công (để không cần cài thêm thư viện mã hóa nặng)
                const base64Url = accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    window
                        .atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );

                const decodedUser = JSON.parse(jsonPayload);
                // Lưu thông tin cấu hình User Profile (id, email, role...) vào bộ nhớ máy
                localStorage.setItem('userProfile', JSON.stringify(decodedUser));

                // 3. Chuyển hướng mượt mà về trang quản lý hóa đơn theo đúng yêu cầu
                router.push('/invoices');
            } catch (error) {
                console.error('Lỗi phân rã cấu trúc JWT Token:', error);
                router.push('/login');
            }
        } else {
            // Nếu không tìm thấy token hợp lệ trên URL, ép về lại trang đăng nhập
            router.push('/login');
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <h2 className="mt-4 text-lg font-semibold text-gray-700">Đang đồng bộ xác thực tài khoản Google...</h2>
            <p className="text-sm text-gray-400">Vui lòng đợi trong giây lát</p>
        </div>
    );
}