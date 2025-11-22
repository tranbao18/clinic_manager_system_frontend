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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { getPatients, deletePatient } from "@/lib/services/patientsService";

const { Search } = Input;
const { Option } = Select;

export interface Patient {
    _id: string;
    fullname: string;
    gender: string;
    dob?: string;
    address?: string;
    phone?: string;
    email?: string;
}

const mapGenderFromApiValue = (gender: string) => {
    if (gender === "Male") return "Nam";
    if (gender === "Female") return "Nữ";
    return gender;
};

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [genderFilter, setGenderFilter] = useState<string | null>(null);
    const [role, setRole] = useState<string>("");
    const router = useRouter();

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/patients", { cache: "no-store" });
            const data = await res.json();

            // ✅ Kiểm tra nếu API trả về object { patients: [...] }
            const list = Array.isArray(data) ? data : data.patients || [];

            const mappedList = list.map((patient: any) => ({
                ...patient,
                gender: mapGenderFromApiValue(patient.gender),
            }));

            setPatients(mappedList);
            setFilteredPatients(mappedList);
        } catch (error) {
            console.error("Fetch patients error:", error);
            message.error("Không thể tải danh sách bệnh nhân");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
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

    const handleFilter = (text: string, gender: string | null) => {
        let filtered = [...patients];
        const search = normalizeText(text);

        if (search) {
            filtered = filtered.filter((item) =>
                normalizeText(item.fullname).includes(search)
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

    const handleDelete = async (_id: string) => {
        try {
            await deletePatient(_id);
            message.success("Đã xóa bệnh nhân");
            fetchPatients();
        } catch {
            message.error("Xóa thất bại");
        }
    };

    const canDelete = role === "admin";
    const canCreate = role === "receptionist";

    const columns: ColumnsType<Patient> = [
        {
            title: "Họ và tên",
            dataIndex: "fullname",
            key: "fullname",
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
                        onClick={() => router.push(`/dashboard/patients/${record._id}`)}
                    >
                        Xem chi tiết
                    </Button>
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
            <h1 className="text-2xl font-bold mb-4">Danh sách bệnh nhân</h1>

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
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                </Select>

                {canCreate && (
                    <Button
                        type="primary"
                        onClick={() => router.push("/dashboard/patients/new")}
                    >
                        + Thêm bệnh nhân
                    </Button>
                )}
                {canDelete && (
                    <Button
                        onClick={() => router.push("/dashboard/patients/disabled")}
                    >
                        Thùng rác
                    </Button>
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
                    dataSource={filteredPatients}
                    pagination={{ pageSize: 8 }}
                />
            )}
        </div>
    );
}
