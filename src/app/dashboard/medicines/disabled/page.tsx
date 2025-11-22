"use client";

import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Popconfirm,
    message,
    Spin,
    Input,
    Space,
    Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { getDisabledMedicines, restoreMedicine, Medicine } from "@/lib/services/medicinesService";
import { UndoOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Search } = Input;

export default function DisabledMedicinesPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const router = useRouter();

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const data = await getDisabledMedicines();
            setMedicines(data);
            setFilteredMedicines(data);
        } catch (error) {
            console.error("Fetch disabled medicines error:", error);
            message.error("Không thể tải danh sách thuốc đã xóa");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const normalizeText = (str: string) =>
        str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .toLowerCase()
            .trim();

    const onSearch = (value: string) => {
        setSearchText(value);
        const search = normalizeText(value);

        if (!search) {
            setFilteredMedicines(medicines);
        } else {
            const filtered = medicines.filter((item) => {
                const nameMatch = normalizeText(item.name).includes(search);
                const categories = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
                const categoryMatch = categories.some((cat) =>
                    normalizeText(cat).includes(search)
                );
                return nameMatch || categoryMatch;
            });
            setFilteredMedicines(filtered);
        }
    };

    const handleRestore = async (_id: string) => {
        try {
            await restoreMedicine(_id);
            message.success("Đã khôi phục thuốc");
            fetchMedicines();
        } catch {
            message.error("Khôi phục thất bại");
        }
    };

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
            title: "Trạng thái",
            key: "status",
            render: () => (
                <Tag color="red">Đã xóa</Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 200,
            render: (_, record) => (
                <div className="flex gap-2">
                    <Popconfirm
                        title="Bạn có chắc chắn muốn khôi phục?"
                        onConfirm={() => handleRestore(record._id)}
                        okText="Khôi phục"
                        cancelText="Hủy"
                    >
                        <Button type="primary" icon={<UndoOutlined />}>
                            Khôi phục
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push("/dashboard/medicines")}
                        className="mb-2"
                    >
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">Danh sách thuốc đã xóa</h1>
                    
                </div>
            </div>

            <Space className="mb-4 flex flex-wrap" align="center">
                <Search
                    placeholder="Nhập tên thuốc hoặc danh mục..."
                    allowClear
                    enterButton="Tìm kiếm"
                    onSearch={onSearch}
                    style={{ width: 300 }}
                />
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
        </div>
    );
}

