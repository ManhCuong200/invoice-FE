'use client';

import { useState } from 'react';
import { LogOut, Building2, User, ChevronDown, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Company {
    id: string;
    name: string;
    taxCode?: string;
    address?: string;
}

interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role: string;
}

interface DashboardHeaderProps {
    companies: Company[];
    selectedCompanyId: string;
    onCompanyChange: (id: string) => void;
    userProfile: UserProfile | null;
    onLogout: () => void;
}

export default function DashboardHeader({
    companies,
    selectedCompanyId,
    onCompanyChange,
    userProfile,
    onLogout,
}: DashboardHeaderProps) {
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const selectedCompany = companies.find(c => c.id === selectedCompanyId);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo & Brand */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-black text-white shadow-md shadow-blue-500/20">
                        X
                    </div>
                    <span className="hidden text-lg font-bold tracking-tight text-white sm:block">
                        OCR INVOICE
                    </span>
                </div>

                {/* Left/Middle Action: Company Selector */}
                <div className="relative flex-1 max-w-xs mx-4">
                    <button
                        onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                        onBlur={() => setTimeout(() => setIsCompanyDropdownOpen(false), 200)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                    >
                        <span className="flex items-center gap-2 truncate">
                            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">
                                {selectedCompany ? selectedCompany.name : 'Chọn Công Ty Kế Toán...'}
                            </span>
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    </button>

                    {isCompanyDropdownOpen && (
                        <div className="absolute left-0 mt-2 z-50 w-full max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-slate-900 p-1 shadow-xl">
                            {companies.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-slate-500">Chưa có công ty nào</div>
                            ) : (
                                companies.map((company) => (
                                    <button
                                        key={company.id}
                                        onClick={() => {
                                            onCompanyChange(company.id);
                                            setIsCompanyDropdownOpen(false);
                                        }}
                                        className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 cursor-pointer ${
                                            selectedCompanyId === company.id
                                                ? 'bg-blue-600/20 text-blue-400'
                                                : 'text-slate-300'
                                        }`}
                                    >
                                        <span className="font-medium truncate w-full">{company.name}</span>
                                        {company.taxCode && (
                                            <span className="text-xs text-slate-500">MST: {company.taxCode}</span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Right Actions: Notifications & User Profile */}
                <div className="flex items-center gap-4">
                    {/* Notify Indicator (Aesthetic only) */}
                    <button className="relative rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
                    </button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/10"></div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
                            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 text-sm text-slate-200 transition hover:bg-white/10 focus:outline-none cursor-pointer"
                        >
                            {userProfile?.avatarUrl ? (
                                <img
                                    src={userProfile.avatarUrl}
                                    alt="Avatar"
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30 text-xs font-semibold text-blue-400">
                                    {userProfile?.fullName ? userProfile.fullName[0].toUpperCase() : 'U'}
                                </div>
                            )}
                            <span className="hidden max-w-[100px] truncate font-medium sm:block">
                                {userProfile?.fullName || 'Người dùng'}
                            </span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 z-50 w-56 rounded-lg border border-white/10 bg-slate-900 p-1 shadow-xl">
                                <div className="border-b border-white/5 px-3 py-2">
                                    <p className="text-xs text-slate-500">Đang đăng nhập bằng</p>
                                    <p className="truncate text-sm font-semibold text-white">
                                        {userProfile?.fullName || 'User'}
                                    </p>
                                    <p className="truncate text-xs text-slate-400">
                                        {userProfile?.email}
                                    </p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={onLogout}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10 cursor-pointer"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
