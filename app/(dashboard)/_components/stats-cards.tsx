'use client';

import { FileText, CheckCircle, AlertCircle, Coins, Clock } from 'lucide-react';

interface Invoice {
    id: string;
    title?: string;
    fileUrl: string;
    fileType: string;
    invoiceType: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    ocrData?: any;
    createdAt: string;
}

interface StatsCardsProps {
    invoices: Invoice[];
}

export default function StatsCards({ invoices }: StatsCardsProps) {
    const total = invoices.length;
    const completed = invoices.filter(inv => inv.status === 'COMPLETED').length;
    const pending = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'PROCESSING').length;
    const failed = invoices.filter(inv => inv.status === 'FAILED').length;

    // Calculate total amount extracted from completed invoices
    const totalAmount = invoices
        .filter(inv => inv.status === 'COMPLETED' && inv.ocrData)
        .reduce((sum, inv) => {
            const amount = typeof inv.ocrData === 'string'
                ? JSON.parse(inv.ocrData).totalAmount
                : inv.ocrData?.totalAmount;
            return sum + (Number(amount) || 0);
        }, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const stats = [
        {
            name: 'Tổng số hóa đơn',
            value: total,
            icon: FileText,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20 shadow-blue-500/5',
        },
        {
            name: 'Đã xử lý thành công',
            value: completed,
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20 shadow-emerald-500/5',
        },
        {
            name: 'Đang xử lý / Chờ',
            value: pending,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20 shadow-amber-500/5',
        },
        {
            name: 'Tổng số tiền trích xuất',
            value: formatCurrency(totalAmount),
            icon: Coins,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20 shadow-indigo-500/5',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                    <div
                        key={idx}
                        className={`relative overflow-hidden rounded-xl border bg-slate-900 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${stat.border}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                    {stat.name}
                                </p>
                                <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                                    {stat.value}
                                </h3>
                            </div>
                            <div className={`rounded-lg p-2.5 ${stat.bg} ${stat.color}`}>
                                <IconComponent className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
