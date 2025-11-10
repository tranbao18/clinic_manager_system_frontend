"use client";

import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Popconfirm,
    message,
    Spin,
    Tag,
    Space,
    Modal,
    Upload,
    Typography,
    Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd";
import { useRouter } from "next/navigation";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import {
    getMedicineImports,
    deleteMedicineImport,
    MedicineImport,
} from "@/lib/services/medicineImportsService";
import dayjs from "dayjs";

const { Text } = Typography;

export default function MedicineImportsPage() {
    const [imports, setImports] = useState<MedicineImport[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string>("");
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: number;
        failed: number;
        errors: Array<{ row: number; medicine: string; error: string }>;
    } | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const router = useRouter();

    const fetchImports = async () => {
        try {
            setLoading(true);
            const data = await getMedicineImports();
            setImports(data);
        } catch (error) {
            console.error("Fetch medicine imports error:", error);
            message.error("Không thể tải danh sách nhập thuốc");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImports();
    }, []);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await fetch("/api/session", { cache: "no-store" });
                const data = await res.json();
                setRole((data?.user?.role || "").toLowerCase());
            } catch {
                setRole("");
            }
        };
        fetchRole();
    }, []);

    const handleDelete = async (_id: string) => {
        try {
            await deleteMedicineImport(_id);
            message.success("Đã xóa nhập thuốc");
            fetchImports();
        } catch {
            message.error("Xóa thất bại");
        }
    };

    const canDelete = role === "admin";
    const canCreate = role === "admin" || role === "accountant";
    const canImport = role === "admin" || role === "accountant";

    // Xử lý import file
    const handleImport = async () => {
        if (fileList.length === 0) {
            message.warning("Vui lòng chọn file để import");
            return;
        }

        const file = fileList[0].originFileObj;
        if (!file) {
            message.warning("File không hợp lệ");
            return;
        }

        setImporting(true);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/medicine-imports/import", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Không thể import file");
            }

            setImportResult({
                success: data.success || 0,
                failed: data.failed || 0,
                errors: data.errors || [],
            });

            if (data.success > 0) {
                message.success(
                    `Import thành công ${data.success} nhập thuốc${data.failed > 0 ? `, ${data.failed} thất bại` : ""}`
                );
                fetchImports(); // Refresh danh sách
            } else {
                message.warning("Không có nhập thuốc nào được import thành công");
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Lỗi khi import file";
            console.error("Import error:", error);
            message.error(errorMessage);
        } finally {
            setImporting(false);
        }
    };

    const handleImportModalClose = () => {
        setImportModalVisible(false);
        setFileList([]);
        setImportResult(null);
    };

    const getMedicineName = (medicine: string | any) => {
        if (!medicine) return "N/A";
        if (typeof medicine === "string") return medicine;
        if (typeof medicine === "object" && medicine.name) {
            return medicine.name;
        }
        return "N/A";
    };

    const getImporterName = (importer: string | any) => {
        if (!importer) return "N/A";
        if (typeof importer === "string") return importer;
        if (typeof importer === "object" && importer.fullname) {
            return importer.fullname;
        }
        return "N/A";
    };

    const columns: ColumnsType<MedicineImport> = [
        {
            title: "Thuốc",
            dataIndex: "medicine_id",
            key: "medicine",
            width: 200,
            render: (medicine) => getMedicineName(medicine),
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "supplier",
            key: "supplier",
            width: 150,
        },
        {
            title: "Mã lô",
            dataIndex: "batchcode",
            key: "batchcode",
            width: 120,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            render: (quantity) => (quantity ?? 0).toLocaleString(),
        },
        {
            title: "Còn lại",
            dataIndex: "remaining",
            key: "remaining",
            width: 100,
            render: (remaining, record) => {
                const remainingValue = remaining ?? 0;
                const quantity = record.quantity ?? 1;
                const percentage = quantity > 0 ? (remainingValue / quantity) * 100 : 0;
                let color = "green";
                if (percentage < 20) color = "red";
                else if (percentage < 50) color = "orange";
                return (
                    <Tag color={color}>
                        {remainingValue.toLocaleString()} ({percentage.toFixed(0)}%)
                    </Tag>
                );
            },
        },
        {
            title: "Giá nhập",
            dataIndex: "unit_price",
            key: "unit_price",
            width: 120,
            render: (price: number) => {
                const priceValue = price ?? 0;
                return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(priceValue);
            },
        },
        {
            title: "Hạn sử dụng",
            dataIndex: "expiry_date",
            key: "expiry_date",
            width: 120,
            render: (date: string) => {
                const expiryDate = dayjs(date);
                const isExpired = expiryDate.isBefore(dayjs());
                const isNearExpiry = expiryDate.isBefore(dayjs().add(30, "days"));
                return (
                    <Tag color={isExpired ? "red" : isNearExpiry ? "orange" : "green"}>
                        {expiryDate.format("DD/MM/YYYY")}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày nhập",
            dataIndex: "import_date",
            key: "import_date",
            width: 120,
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Người nhập",
            dataIndex: "imported_by",
            key: "imported_by",
            width: 150,
            render: (importer) => getImporterName(importer),
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            render: (_, record) => (
                <div className="flex gap-2">
                    {canDelete && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger size="small">Xóa</Button>
                        </Popconfirm>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Danh sách nhập thuốc</h1>

            <Space className="mb-4">
                {canCreate && (
                    <>
                        <Button
                            type="primary"
                            onClick={() => router.push("/dashboard/medicine-imports/new")}
                        >
                            + Nhập thuốc mới
                        </Button>
                        {canImport && (
                            <Button
                                icon={<FileExcelOutlined />}
                                onClick={() => setImportModalVisible(true)}
                            >
                                Import Excel/CSV
                            </Button>
                        )}
                    </>
                )}
            </Space>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={imports}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            )}

            {/* Modal Import */}
            <Modal
                title="📥 Import nhập thuốc từ file Excel/CSV"
                open={importModalVisible}
                onCancel={handleImportModalClose}
                onOk={handleImport}
                okText="Import"
                cancelText="Hủy"
                confirmLoading={importing}
                width={600}
            >
                <div className="space-y-4">
                    <Alert
                        message="Hướng dẫn"
                        description={
                            <div className="mt-2">
                                <Text strong>Định dạng file:</Text>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>File Excel (.xlsx, .xls) hoặc CSV (.csv)</li>
                                    <li>Kích thước tối đa: 10MB</li>
                                </ul>
                                <Text strong className="block mt-2">
                                    Cấu trúc file:
                                </Text>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>
                                        <Text code>Tên thuốc</Text> (bắt buộc, phải tồn tại trong hệ thống)
                                    </li>
                                    <li>
                                        <Text code>Nhà cung cấp</Text> (bắt buộc)
                                    </li>
                                    <li>
                                        <Text code>Mã lô</Text> (bắt buộc)
                                    </li>
                                    <li>
                                        <Text code>Số lượng</Text> (bắt buộc, phải lớn hơn 0)
                                    </li>
                                    <li>
                                        <Text code>Giá nhập</Text> (bắt buộc, phải lớn hơn 0)
                                    </li>
                                    <li>
                                        <Text code>Hạn sử dụng</Text> (bắt buộc, định dạng: YYYY-MM-DD)
                                    </li>
                                    <li>
                                        <Text code>Ngày nhập</Text> (bắt buộc, định dạng: YYYY-MM-DD)
                                    </li>
                                    <li>
                                        <Text code>Người nhập</Text> (bắt buộc, tên nhân viên phải tồn tại)
                                    </li>
                                </ul>
                            </div>
                        }
                        type="info"
                        showIcon
                        className="mb-4"
                    />

                    <Upload
                        fileList={fileList}
                        beforeUpload={(file) => {
                            const isValidType =
                                file.type ===
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                                file.type === "application/vnd.ms-excel" ||
                                file.type === "text/csv" ||
                                file.name.endsWith(".csv");

                            if (!isValidType) {
                                message.error(
                                    "Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)"
                                );
                                return false;
                            }

                            if (file.size > 10 * 1024 * 1024) {
                                message.error("File quá lớn. Kích thước tối đa là 10MB");
                                return false;
                            }

                            setFileList([file]);
                            return false;
                        }}
                        onRemove={() => {
                            setFileList([]);
                            return true;
                        }}
                        maxCount={1}
                        accept=".xlsx,.xls,.csv"
                    >
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>

                    {importResult && (
                        <div className="mt-4">
                            <Alert
                                message={`Import hoàn tất: ${importResult.success} thành công, ${importResult.failed} thất bại`}
                                type={importResult.failed === 0 ? "success" : "warning"}
                                showIcon
                                className="mb-2"
                            />
                            {importResult.errors.length > 0 && (
                                <div className="mt-2 max-h-40 overflow-y-auto">
                                    <Text strong className="text-red-600">
                                        Chi tiết lỗi:
                                    </Text>
                                    <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                                        {importResult.errors.map((err, idx) => (
                                            <li key={idx}>
                                                Dòng {err.row}: {err.medicine} - {err.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

