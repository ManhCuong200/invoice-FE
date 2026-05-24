'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceUploadProps {
    companyId: string;
    onUpload: (payload: { title: string; fileData: string; fileType: string }) => Promise<void>;
    isUploading: boolean;
}

export default function InvoiceUpload({ companyId, onUpload, isUploading }: InvoiceUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = (selectedFile: File) => {
        setError(null);
        
        if (!companyId) {
            setError("Vui lòng chọn công ty kế toán dịch vụ ở thanh menu phía trên trước khi tải lên hóa đơn.");
            return;
        }

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Định dạng file không hợp lệ. Chỉ chấp nhận file PNG, JPG, JPEG hoặc PDF.");
            return;
        }

        // Limit size to 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("Dung lượng file vượt quá giới hạn (tối đa 10MB).");
            return;
        }

        setFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleUploadSubmit = async () => {
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const fileData = reader.result as string;
                
                // Extract file extension
                const extension = file.name.split('.').pop()?.toLowerCase() || '';
                const fileType = ['png', 'jpg', 'jpeg', 'pdf'].includes(extension) ? extension : 'jpeg';

                await onUpload({
                    title: file.name,
                    fileData,
                    fileType,
                });
                
                // Clear state on successful upload
                setFile(null);
            };
            reader.onerror = () => {
                setError("Lỗi khi đọc dữ liệu tệp tin.");
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError("Có lỗi xảy ra trong quá trình mã hóa file.");
        }
    };

    return (
        <div className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-1">Tải lên hóa đơn mới</h3>
            <p className="text-xs text-slate-400 mb-4">
                Hỗ trợ định dạng PDF, PNG, JPG, JPEG. Hệ thống sẽ tự động phân tích và trích xuất dữ liệu bằng AI OCR.
            </p>

            <form
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onSubmit={(e) => e.preventDefault()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                    dragActive
                        ? 'border-blue-500 bg-blue-500/5'
                        : file
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : 'border-white/10 bg-slate-950/20 hover:border-white/20'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleChange}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="text-sm font-semibold text-slate-200">Đang tải lên và trích xuất OCR...</p>
                        <p className="text-xs text-slate-400">Quá trình này có thể mất vài giây</p>
                    </div>
                ) : file ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-200 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setFile(null)}
                                className="cursor-pointer"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleUploadSubmit}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            >
                                <Check className="h-4 w-4 mr-1" /> Xác nhận tải lên
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={triggerFileInput}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">
                            Kéo thả tệp vào đây, hoặc <span className="text-blue-400 underline hover:text-blue-300">chọn từ thiết bị</span>
                        </p>
                        <p className="text-xs text-slate-500">Kích thước file tối đa 10MB</p>
                    </div>
                )}
            </form>

            {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
