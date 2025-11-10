"use client";

import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Popconfirm,
    message,
    Spin,
    Input,
    Select,
    Space,
    Tag,
    Modal,
    Upload,
    Typography,
    Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd";
import { useRouter } from "next/navigation";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import { getMedicines, deleteMedicine, Medicine } from "@/lib/services/medicinesService";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

export default function MedicinesPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [role, setRole] = useState<string>("");
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: number;
        failed: number;
        errors: Array<{ row: number; name: string; error: string }>;
    } | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const router = useRouter();

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const data = await getMedicines();
            setMedicines(data);
            setFilteredMedicines(data);
        } catch (error) {
            console.error("Fetch medicines error:", error);
            message.error("Không thể tải danh sách thuốc");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
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

    const normalizeText = (str: string) =>
        str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .toLowerCase()
            .trim();

    const handleFilter = (text: string, category: string | null) => {
        let filtered = [...medicines];
        const search = normalizeText(text);

        if (search) {
            filtered = filtered.filter((item) => {
                const nameMatch = normalizeText(item.name).includes(search);
                const categories = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
                const categoryMatch = categories.some((cat) =>
                    normalizeText(cat).includes(search)
                );
                return nameMatch || categoryMatch;
            });
        }

        if (category) {
            filtered = filtered.filter((item) => {
                const categories = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
                return categories.includes(category);
            });
        }

        setFilteredMedicines(filtered);
    };

    const onSearch = (value: string) => {
        setSearchText(value);
        handleFilter(value, categoryFilter);
    };

    const onCategoryChange = (value: string | null) => {
        setCategoryFilter(value);
        handleFilter(searchText, value);
    };

    const handleDelete = async (_id: string) => {
        try {
            await deleteMedicine(_id);
            message.success("Đã xóa thuốc");
            fetchMedicines();
        } catch {
            message.error("Xóa thất bại");
        }
    };

    const canDelete = role === "admin";
    const canCreate = role === "admin" || role === "accountant";
    const canUpdate = role === "admin" || role === "accountant";
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

            const res = await fetch("/api/medicines/import", {
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
                    `Import thành công ${data.success} thuốc${data.failed > 0 ? `, ${data.failed} thất bại` : ""}`
                );
                fetchMedicines(); // Refresh danh sách
            } else {
                message.warning("Không có thuốc nào được import thành công");
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

    // Lấy danh sách các category duy nhất từ tất cả thuốc
    const categories = Array.from(
        new Set(
            medicines
                .flatMap((m) => {
                    // Xử lý cả trường hợp category là string hoặc array
                    if (Array.isArray(m.category)) {
                        return m.category;
                    }
                    return m.category ? [m.category] : [];
                })
                .filter(Boolean)
        )
    ).sort();

    const columns: ColumnsType<Medicine> = [
        {
            title: "Tên thuốc",
            dataIndex: "name",
            key: "name",
            width: 200,
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            width: 200,
            render: (category: string | string[]) => {
                const categories = Array.isArray(category) ? category : (category ? [category] : []);
                if (categories.length === 0) {
                    return <Tag color="default">Không có</Tag>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {categories.map((cat, idx) => (
                            <Tag key={idx} color="blue">
                                {cat}
                            </Tag>
                        ))}
                    </div>
                );
            },
        },
        {
            title: "Đơn vị",
            dataIndex: "unit",
            key: "unit",
            width: 100,
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            width: 120,
            render: (price: number) => {
                return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(price);
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: 200,
            render: (_, record) => (
                <div className="flex gap-2">
                    {canUpdate && (
                        <Button
                            type="primary"
                            onClick={() => router.push(`/dashboard/medicines/${record._id}/edit`)}
                        >
                            Sửa
                        </Button>
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger>Xóa</Button>
                        </Popconfirm>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Danh sách thuốc</h1>

            <Space className="mb-4 flex flex-wrap" align="center">
                <Search
                    placeholder="Nhập tên thuốc hoặc danh mục..."
                    allowClear
                    enterButton="Tìm kiếm"
                    onSearch={onSearch}
                    style={{ width: 300 }}
                />

                <Select
                    placeholder="Lọc theo danh mục"
                    allowClear
                    onChange={onCategoryChange}
                    style={{ width: 200 }}
                >
                    {categories.map((cat) => (
                        <Option key={cat} value={cat}>
                            {cat}
                        </Option>
                    ))}
                </Select>

                {canCreate && (
                    <>
                        <Button
                            type="primary"
                            onClick={() => router.push("/dashboard/medicines/new")}
                        >
                            + Thêm thuốc
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
                    dataSource={filteredMedicines}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            )}

            {/* Modal Import */}
            <Modal
                title="📥 Import thuốc từ file Excel/CSV"
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
                                        <Text code>Tên thuốc</Text> (bắt buộc)
                                    </li>
                                    <li>
                                        <Text code>Danh mục</Text> (tùy chọn, phân cách bằng dấu phẩy, tối đa 3)
                                    </li>
                                    <li>
                                        <Text code>Đơn vị</Text> (bắt buộc)
                                    </li>
                                    <li>
                                        <Text code>Giá</Text> (bắt buộc, phải lớn hơn 0)
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
                                                Dòng {err.row}: {err.name} - {err.error}
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

