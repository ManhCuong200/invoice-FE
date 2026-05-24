'use client';

import { X, FileText, Check, AlertCircle, Plus, Trash2, Loader2 } from 'lucide-react';
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

interface ExtractedData {
    invoiceNumber: string;
    invoiceDate: string;
    sellerName: string;
    sellerTaxCode: string;
    buyerName: string;
    buyerTaxCode: string;
    items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        amount: number;
    }>;
    taxAmount: number;
    totalAmount: number;
}

interface InvoiceDetailProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
    formData: ExtractedData | null;
    onFieldChange: (field: keyof ExtractedData, value: any) => void;
    onItemChange: (index: number, field: string, value: any) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onSave: () => void;
    isSaving: boolean;
    saveSuccess: boolean;
}

export default function InvoiceDetail({
    invoice,
    isOpen,
    onClose,
    formData,
    onFieldChange,
    onItemChange,
    onAddItem,
    onRemoveItem,
    onSave,
    isSaving,
    saveSuccess,
}: InvoiceDetailProps) {
    if (!isOpen || !invoice) return null;

    const renderPreview = () => {
        if (!invoice.fileUrl) {
            return (
                <div className="flex h-full flex-col items-center justify-center bg-slate-950 text-slate-500">
                    <FileText className="h-16 w-16 mb-2" />
                    <span>Không có tệp hóa đơn xem trước</span>
                </div>
            );
        }

        const isPdf = invoice.fileType.toLowerCase() === 'pdf' || invoice.fileUrl.startsWith('data:application/pdf');

        if (isPdf) {
            return (
                <object
                    data={invoice.fileUrl}
                    type="application/pdf"
                    className="h-full w-full rounded-lg"
                >
                    <embed src={invoice.fileUrl} type="application/pdf" />
                </object>
            );
        }

        return (
            <div className="flex h-full items-center justify-center bg-slate-950 p-2 overflow-auto">
                <img
                    src={invoice.fileUrl}
                    alt="Invoice Preview"
                    className="max-h-full max-w-full rounded-lg object-contain"
                />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="flex flex-col w-full max-w-6xl h-[90vh] rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950/40">
                    <div>
                        <h2 className="text-lg font-bold text-white">Đối chiếu dữ liệu OCR hóa đơn</h2>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {invoice.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Main Content Side-by-Side */}
                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Left Panel: Preview */}
                    <div className="hidden md:flex md:w-1/2 p-4 border-r border-white/10 bg-slate-950/40 flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                            Tài liệu đính kèm ({invoice.fileType.toUpperCase()})
                        </span>
                        <div className="flex-1 rounded-lg overflow-hidden border border-white/5 bg-slate-950">
                            {renderPreview()}
                        </div>
                    </div>

                    {/* Right Panel: Editable Form */}
                    <div className="flex-1 w-full md:w-1/2 p-6 overflow-y-auto bg-slate-900/60 custom-scrollbar">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">
                            Dữ liệu AI trích xuất (Có thể chỉnh sửa đối chiếu)
                        </span>

                        {invoice.status === 'PROCESSING' || invoice.status === 'PENDING' ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
                                <p className="text-sm text-slate-300 font-medium">Hóa đơn đang được xử lý OCR...</p>
                                <p className="text-xs text-slate-500 mt-1">Vui lòng quay lại khi hoàn thành.</p>
                            </div>
                        ) : invoice.status === 'FAILED' ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                                <p className="text-sm text-red-400 font-medium">Xử lý OCR thất bại</p>
                                <p className="text-xs text-slate-500 mt-1">Đã có lỗi xảy ra trong quá trình nhận dạng dữ liệu.</p>
                            </div>
                        ) : !formData ? (
                            <div className="text-sm text-slate-400 text-center py-20">Không có dữ liệu trích xuất</div>
                        ) : (
                            <div className="space-y-6">
                                {/* Group: Invoice General */}
                                <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
                                    <div className="col-span-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                                        Thông tin chung
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Số hóa đơn</label>
                                        <input
                                            type="text"
                                            value={formData.invoiceNumber}
                                            onChange={(e) => onFieldChange('invoiceNumber', e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Ngày lập</label>
                                        <input
                                            type="date"
                                            value={formData.invoiceDate}
                                            onChange={(e) => onFieldChange('invoiceDate', e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Group: Seller & Buyer */}
                                <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                                        Bên bán (Seller)
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Tên đơn vị bán</label>
                                        <input
                                            type="text"
                                            value={formData.sellerName}
                                            onChange={(e) => onFieldChange('sellerName', e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Mã số thuế bên bán</label>
                                        <input
                                            type="text"
                                            value={formData.sellerTaxCode}
                                            onChange={(e) => onFieldChange('sellerTaxCode', e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                                        Bên mua (Buyer)
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Tên đơn vị mua</label>
                                        <input
                                            type="text"
                                            value={formData.buyerName}
                                            onChange={(e) => onFieldChange('buyerName', e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Mã số thuế bên mua</label>
                                        <input
                                            type="text"
                                            value={formData.buyerTaxCode}
                                            onChange={(e) => onFieldChange('buyerTaxCode', e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Group: Items table */}
                                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                            Danh sách mặt hàng / Dịch vụ
                                        </span>
                                        <Button
                                            size="xs"
                                            onClick={onAddItem}
                                            className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Thêm dòng
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[500px]">
                                            <thead>
                                                <tr className="text-xs text-slate-400 border-b border-white/10">
                                                    <th className="py-2 pr-2">Tên sản phẩm</th>
                                                    <th className="py-2 px-2 w-16">SL</th>
                                                    <th className="py-2 px-2 w-28">Đơn giá</th>
                                                    <th className="py-2 px-2 w-28">Thành tiền</th>
                                                    <th className="py-2 pl-2 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {formData.items.map((item, idx) => (
                                                    <tr key={idx} className="group">
                                                        <td className="py-2 pr-2">
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => onItemChange(idx, 'name', e.target.value)}
                                                                className="w-full rounded-md border border-white/5 bg-slate-950/40 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => onItemChange(idx, 'quantity', Number(e.target.value))}
                                                                className="w-full rounded-md border border-white/5 bg-slate-950/40 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none text-right"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={item.unitPrice}
                                                                onChange={(e) => onItemChange(idx, 'unitPrice', Number(e.target.value))}
                                                                className="w-full rounded-md border border-white/5 bg-slate-950/40 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none text-right"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2 text-right text-xs font-semibold text-slate-200">
                                                            {new Intl.NumberFormat('vi-VN').format(item.amount || 0)}
                                                        </td>
                                                        <td className="py-2 pl-2 text-right">
                                                            <button
                                                                onClick={() => onRemoveItem(idx)}
                                                                className="text-slate-500 hover:text-red-400 p-1 rounded transition cursor-pointer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Group: Payment Totals */}
                                <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
                                    <div className="col-span-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                                        Tổng thanh toán (VND)
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Thuế VAT</label>
                                        <input
                                            type="number"
                                            value={formData.taxAmount}
                                            onChange={(e) => {
                                                const tax = Number(e.target.value) || 0;
                                                onFieldChange('taxAmount', tax);
                                            }}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Tổng cộng tiền thanh toán</label>
                                        <input
                                            type="number"
                                            value={formData.totalAmount}
                                            onChange={(e) => onFieldChange('totalAmount', Number(e.target.value))}
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white font-bold focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4 bg-slate-950/40">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                        className="cursor-pointer"
                    >
                        Đóng
                    </Button>
                    {formData && invoice.status === 'COMPLETED' && (
                        <Button
                            onClick={onSave}
                            disabled={isSaving}
                            className={`${saveSuccess ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'
                                } text-white transition cursor-pointer flex items-center gap-1.5`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Đang cập nhật...
                                </>
                            ) : saveSuccess ? (
                                <>
                                    <Check className="h-4 w-4" /> Đã lưu thành công!
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" /> Xác nhận đối chiếu
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
