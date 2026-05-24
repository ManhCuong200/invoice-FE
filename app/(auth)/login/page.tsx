'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginCard from '../_components/LoginCard';

import { getGoogleLoginUrl } from '../_api/auth';

export default function LoginPage() {
    const router = useRouter();

    // Kiểm tra xem người dùng đã đăng nhập chưa, nếu có token hợp lệ thì đẩy thẳng vào hệ thống
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            router.push('/invoices');
        }
    }, [router]);

    const handleGoogleLogin = () => {
        // Chuyển hướng trình duyệt sang API Google Auth của Backend NestJS từ _api/auth
        window.location.href = getGoogleLoginUrl();
    };

    return <LoginCard onGoogleLogin={handleGoogleLogin} />;
}