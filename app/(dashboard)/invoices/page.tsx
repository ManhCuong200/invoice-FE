'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutApi } from '@/app/(auth)/_api/auth';
import {
    Company,
    Invoice,
    getCompaniesApi,
    createCompanyApi,
    getInvoicesApi,
    uploadInvoiceApi,
} from '@/app/(dashboard)/_api/invoices';

import DashboardHeader from '../_components/dashboard-header';
import StatsCards from '../_components/stats-cards';
import InvoiceUpload from '../_components/invoice-upload';
import InvoiceTable from '../_components/invoice-table';
import InvoiceDetail from '../_components/invoice-detail';

interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role: string;
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

export default function InvoicesPage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    
    // Status states
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    
    // Dialog & OCR Edit states
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailFormData, setDetailFormData] = useState<ExtractedData | null>(null);
    const [isSavingDetail, setIsSavingDetail] = useState(false);
    const [saveDetailSuccess, setSaveDetailSuccess] = useState(false);

    // 1. Auth check
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const profileStr = localStorage.getItem('userProfile');

        if (!token) {
            router.push('/login');
            return;
        }

        if (profileStr) {
            try {
                setUserProfile(JSON.parse(profileStr));
            } catch {
                localStorage.removeItem('userProfile');
            }
        }
        
        fetchCompanies();
    }, [router]);

    // 2. Fetch invoices whenever active company changes
    useEffect(() => {
        if (selectedCompanyId) {
            fetchInvoices(selectedCompanyId);
            localStorage.setItem('selectedCompanyId', selectedCompanyId);
        } else {
            setInvoices([]);
        }
    }, [selectedCompanyId]);

    // 3. Initialize OCR edit form whenever selected invoice changes
    useEffect(() => {
        if (selectedInvoice && selectedInvoice.ocrData) {
            try {
                const parsed = typeof selectedInvoice.ocrData === 'string'
                    ? JSON.parse(selectedInvoice.ocrData)
                    : selectedInvoice.ocrData;

                setDetailFormData({
                    invoiceNumber: parsed.invoiceNumber || '',
                    invoiceDate: parsed.invoiceDate || '',
                    sellerName: parsed.sellerName || '',
                    sellerTaxCode: parsed.sellerTaxCode || '',
                    buyerName: parsed.buyerName || '',
                    buyerTaxCode: parsed.buyerTaxCode || '',
                    items: parsed.items || [],
                    taxAmount: parsed.taxAmount || 0,
                    totalAmount: parsed.totalAmount || 0,
                });
                setSaveDetailSuccess(false);
            } catch (err) {
                console.error("Lỗi parse dữ liệu OCR:", err);
            }
        } else {
            setDetailFormData(null);
        }
    }, [selectedInvoice]);

    // 4. Fetch companies
    const fetchCompanies = async () => {
        try {
            const data = await getCompaniesApi();
            setCompanies(data);

            if (data.length > 0) {
                const savedId = localStorage.getItem('selectedCompanyId');
                const stillExists = data.some(c => c.id === savedId);
                setSelectedCompanyId(stillExists && savedId ? savedId : data[0].id);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách công ty:', err);
        } finally {
            setIsPageLoading(false);
        }
    };

    // 5. Fetch invoices
    const fetchInvoices = async (companyId: string) => {
        setIsInvoicesLoading(true);
        try {
            const data = await getInvoicesApi(companyId);
            setInvoices(data);
        } catch (err) {
            console.error('Lỗi khi tải danh sách hóa đơn:', err);
        } finally {
            setIsInvoicesLoading(false);
        }
    };

    // 6. Trigger upload and process OCR
    const handleInvoiceUpload = async (payload: { title: string; fileData: string; fileType: string }) => {
        if (!userProfile) return;
        setIsUploading(true);

        try {
            await uploadInvoiceApi({
                ...payload,
                companyId: selectedCompanyId,
                userId: userProfile.id,
            });
            await fetchInvoices(selectedCompanyId);
        } catch (err) {
            console.error('Lỗi tải lên hóa đơn:', err);
            alert('Không thể tải lên hóa đơn. Vui lòng kiểm tra lại cấu hình API hoặc OpenAI Key phía backend.');
        } finally {
            setIsUploading(false);
        }
    };

    // 7. Helper: Quick create a demo company if the table is empty
    const handleCreateDemoCompany = async () => {
        setIsCreatingCompany(true);
        try {
            const data = await createCompanyApi({
                name: 'Công ty TNHH Giải pháp Kế toán X',
                taxCode: '0109987654',
                address: 'Tòa nhà X, Cầu Giấy, Hà Nội'
            });
            setCompanies([data]);
            setSelectedCompanyId(data.id);
        } catch (err) {
            console.error('Lỗi tạo công ty demo:', err);
            alert('Lỗi khi kết nối với máy chủ API Backend.');
        } finally {
            setIsCreatingCompany(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (userProfile?.id) {
                await logoutApi(userProfile.id);
            }
        } catch (err) {
            console.error('Lỗi khi đăng xuất trên backend:', err);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('selectedCompanyId');
            router.push('/login');
        }
    };

    const handleViewDetail = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailOpen(true);
    };

    // 8. OCR Form detail handlers
    const handleDetailFieldChange = (field: keyof ExtractedData, value: any) => {
        if (!detailFormData) return;
        
        const updated = { ...detailFormData, [field]: value };
        
        // Auto-recalculate totalAmount if taxAmount changes
        if (field === 'taxAmount') {
            const tax = Number(value) || 0;
            const subtotal = detailFormData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
            updated.totalAmount = subtotal + tax;
        }

        setDetailFormData(updated);
    };

    const handleDetailItemChange = (index: number, field: string, value: any) => {
        if (!detailFormData) return;
        
        const newItems = [...detailFormData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };
        
        if (field === 'quantity' || field === 'unitPrice') {
            const qty = Number(newItems[index].quantity) || 0;
            const price = Number(newItems[index].unitPrice) || 0;
            newItems[index].amount = qty * price;
        }

        const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const tax = detailFormData.taxAmount;

        setDetailFormData({
            ...detailFormData,
            items: newItems,
            totalAmount: subtotal + tax
        });
    };

    const handleDetailAddItem = () => {
        if (!detailFormData) return;
        setDetailFormData({
            ...detailFormData,
            items: [
                ...detailFormData.items,
                { name: '', quantity: 1, unitPrice: 0, amount: 0 }
            ]
        });
    };

    const handleDetailRemoveItem = (index: number) => {
        if (!detailFormData) return;
        
        const newItems = detailFormData.items.filter((_, i) => i !== index);
        const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        setDetailFormData({
            ...detailFormData,
            items: newItems,
            totalAmount: subtotal + detailFormData.taxAmount
        });
    };

    const handleDetailSave = () => {
        if (!selectedInvoice || !detailFormData) return;
        setIsSavingDetail(true);
        
        // Simulating mock save request to database / storage
        setTimeout(() => {
            setIsSavingDetail(false);
            setSaveDetailSuccess(true);
            
            // Apply edits to local state
            setInvoices(prev => prev.map(inv => {
                if (inv.id === selectedInvoice.id) {
                    return {
                        ...inv,
                        ocrData: detailFormData
                    };
                }
                return inv;
            }));

            setTimeout(() => setSaveDetailSuccess(false), 3000);
        }, 1000);
    };

    if (isPageLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="mt-4 text-sm text-slate-400">Đang khởi tạo hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <DashboardHeader
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
                userProfile={userProfile}
                onLogout={handleLogout}
            />

            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {companies.length === 0 ? (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl max-w-lg mx-auto mt-10">
                        <Building className="h-16 w-16 text-blue-400 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Chưa có công ty kế toán</h2>
                        <p className="text-sm text-slate-400 mb-6 max-w-sm">
                            Để quản lý và tải lên hóa đơn OCR, trước tiên bạn cần chọn hoặc tạo mới một công ty dịch vụ kế toán.
                        </p>
                        <Button
                            onClick={handleCreateDemoCompany}
                            disabled={isCreatingCompany}
                            className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                        >
                            {isCreatingCompany ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-1.5" /> Tạo nhanh Công ty Demo
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <StatsCards invoices={invoices} />

                        <div className="grid grid-cols-1 gap-6">
                            <InvoiceUpload
                                companyId={selectedCompanyId}
                                onUpload={handleInvoiceUpload}
                                isUploading={isUploading}
                            />
                        </div>

                        <InvoiceTable
                            invoices={invoices}
                            onViewDetail={handleViewDetail}
                            isLoading={isInvoicesLoading}
                        />
                    </div>
                )}
            </main>

            <InvoiceDetail
                invoice={selectedInvoice}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedInvoice(null);
                }}
                formData={detailFormData}
                onFieldChange={handleDetailFieldChange}
                onItemChange={handleDetailItemChange}
                onAddItem={handleDetailAddItem}
                onRemoveItem={handleDetailRemoveItem}
                onSave={handleDetailSave}
                isSaving={isSavingDetail}
                saveSuccess={saveDetailSuccess}
            />
        </div>
    );
}
