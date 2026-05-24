'use client';

import { useState } from 'react';
import { Search, Eye, FileSpreadsheet, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface InvoiceTableProps {
    invoices: Invoice[];
    onViewDetail: (invoice: Invoice) => void;
    isLoading: boolean;
}

export default function InvoiceTable({ invoices, onViewDetail, isLoading }: InvoiceTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const getOcrField = (inv: Invoice, field: string) => {
        if (!inv.ocrData) return null;
        try {
            const data = typeof inv.ocrData === 'string' ? JSON.parse(inv.ocrData) : inv.ocrData;
            return data[field];
        } catch {
            return null;
        }
    };

    const formatCurrency = (value: any) => {
        const number = Number(value);
        if (isNaN(number) || number === 0) return '---';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(number);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '---';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        // Status filter
        if (statusFilter !== 'ALL' && inv.status !== statusFilter) {
            return false;
        }

        // Search term filter
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();
        const titleMatch = inv.title?.toLowerCase().includes(term);
        
        const invoiceNumber = getOcrField(inv, 'invoiceNumber')?.toString().toLowerCase() || '';
        const sellerName = getOcrField(inv, 'sellerName')?.toString().toLowerCase() || '';
        
        return titleMatch || invoiceNumber.includes(term) || sellerName.includes(term);
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="h-3.5 w-3.5" /> Thành công
                    </span>
                );
            case 'PROCESSING':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang OCR...
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
                        <Clock className="h-3.5 w-3.5" /> Chờ xử lý
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                        <AlertTriangle className="h-3.5 w-3.5" /> Thất bại
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="rounded-xl border border-white/10 bg-slate-900 shadow-xl backdrop-blur-md overflow-hidden">
            {/* Filter Bar */}
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Tìm theo số HĐ, đơn vị bán..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-950/40 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition hover:border-white/20 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Status tabs */}
                <div className="flex gap-1.5 overflow-x-auto">
                    {[
                        { label: 'Tất cả', value: 'ALL' },
                        { label: 'Thành công', value: 'COMPLETED' },
                        { label: 'Đang xử lý', value: 'PROCESSING' },
                        { label: 'Thất bại', value: 'FAILED' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                                statusFilter === tab.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-sm text-slate-400">Đang tải danh sách hóa đơn...</p>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-500 mb-4">
                        <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Không tìm thấy hóa đơn nào</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm">
                        {invoices.length === 0
                            ? 'Chưa có hóa đơn nào được tải lên cho công ty này.'
                            : 'Không có hóa đơn nào khớp với bộ lọc hoặc từ khóa tìm kiếm.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <th className="px-6 py-4">Tên File / Hóa đơn</th>
                                <th className="px-6 py-4">Số hóa đơn</th>
                                <th className="px-6 py-4">Đơn vị bán</th>
                                <th className="px-6 py-4">Ngày lập</th>
                                <th className="px-6 py-4">Tổng tiền</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                            {filteredInvoices.map((invoice) => {
                                const invNum = getOcrField(invoice, 'invoiceNumber');
                                const seller = getOcrField(invoice, 'sellerName');
                                const invDate = getOcrField(invoice, 'invoiceDate');
                                const totalAmt = getOcrField(invoice, 'totalAmount');

                                return (
                                    <tr key={invoice.id} className="hover:bg-white/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white max-w-[200px] truncate">
                                                {invoice.title || `Hóa đơn - ${invoice.id.slice(0, 8)}`}
                                            </div>
                                            <div className="text-xs text-slate-500 uppercase mt-0.5">
                                                {invoice.fileType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-200">
                                            {invNum || '---'}
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px] truncate">
                                            {seller || '---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {invDate ? formatDate(invDate) : formatDate(invoice.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-white">
                                            {totalAmt ? formatCurrency(totalAmt) : '---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onViewDetail(invoice)}
                                                className="cursor-pointer hover:bg-blue-600 hover:text-white hover:border-blue-600 transition"
                                            >
                                                <Eye className="h-4 w-4 mr-1" /> Chi tiết
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
