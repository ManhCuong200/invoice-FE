import { api } from '@/services/api/axios';

export interface Company {
    id: string;
    name: string;
    taxCode?: string;
    address?: string;
}

export interface Invoice {
    id: string;
    title?: string;
    fileUrl: string;
    fileType: string;
    invoiceType: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    ocrData?: any;
    createdAt: string;
}

/**
 * Lấy danh sách công ty từ Backend
 */
export const getCompaniesApi = async (): Promise<Company[]> => {
    const res = await api.get<Company[]>('/companies');
    return res.data;
};

/**
 * Tạo mới một công ty dịch vụ kế toán
 */
export const createCompanyApi = async (body: { name: string; taxCode?: string; address?: string }): Promise<Company> => {
    const res = await api.post<Company>('/companies', body);
    return res.data;
};

/**
 * Lấy danh sách hóa đơn theo ID công ty
 */
export const getInvoicesApi = async (companyId?: string): Promise<Invoice[]> => {
    const res = await api.get<Invoice[]>('/invoices', {
        params: companyId ? { companyId } : {}
    });
    return res.data;
};

/**
 * Tải lên tệp hóa đơn và kích hoạt luồng trích xuất OCR
 */
export const uploadInvoiceApi = async (body: {
    title?: string;
    fileData: string;
    fileType: string;
    companyId: string;
    userId: string;
}): Promise<Invoice> => {
    const res = await api.post<Invoice>('/invoices/upload', body);
    return res.data;
};
