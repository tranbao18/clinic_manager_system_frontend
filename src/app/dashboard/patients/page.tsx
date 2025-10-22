"use client";

import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Spin, Input, Select, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { getPatients, deletePatient, Patient } from "@/lib/services/patientsService";

const { Search } = Input;
const { Option } = Select;

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [genderFilter, setGenderFilter] = useState<string | null>(null);
    const router = useRouter();

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await getPatients();
            setPatients(data);
            setFilteredPatients(data);
        } catch (error) {
            message.error("Không thể tải danh sách bệnh nhân");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const normalizeText = (str: string) => {
        return str
            .normalize("NFD") // tách dấu tiếng Việt
            .replace(/[\u0300-\u036f]/g, "") // xóa dấu
            .replace(/[^a-zA-Z0-9\s]/g, "") // bỏ ký tự đặc biệt
            .toLowerCase()
            .trim();
    };

    const handleFilter = (text: string, gender: string | null) => {
        let filtered = [...patients];

        const search = normalizeText(text);

        if (search) {
            filtered = filtered.filter((item) =>
                normalizeText(item.fullName).includes(search)
            );
        }

        if (gender) {
            filtered = filtered.filter((item) => item.gender === gender);
        }

        setFilteredPatients(filtered);
    };

    const onSearch = (value: string) => {
        setSearchText(value);
        handleFilter(value, genderFilter);
    };

    const onGenderChange = (value: string | null) => {
        setGenderFilter(value);
        handleFilter(searchText, value);
    };

    const handleDelete = async (id: string) => {
        try {
            await deletePatient(id);
            message.success("Đã xóa bệnh nhân");
            fetchPatients();
        } catch (error) {
            message.error("Xóa thất bại");
        }
    };

    const columns: ColumnsType<Patient> = [
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        onClick={() => router.push(`/dashboard/patients/${record.id}`)}
                    >
                        Xem chi tiết
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Danh sách bệnh nhân</h1>

            {/* 🔎 Thanh tìm kiếm + lọc giới tính + thêm mới */}
            <Space className="mb-4 flex flex-wrap" align="center">
                <Search
                    placeholder="Nhập tên bệnh nhân..."
                    allowClear
                    enterButton="Tìm kiếm"
                    onSearch={onSearch}
                    style={{ width: 300 }}
                />

                <Select
                    placeholder="Lọc theo giới tính"
                    allowClear
                    onChange={onGenderChange}
                    style={{ width: 200 }}
                >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                </Select>

                {/* 🧩 Nút thêm mới */}
                <Button
                    type="primary"
                    onClick={() => router.push("/dashboard/patients/new")}
                >
                    + Thêm bệnh nhân
                </Button>
            </Space>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredPatients}
                    pagination={{ pageSize: 8 }}
                />
            )}
        </div>
    );
}
