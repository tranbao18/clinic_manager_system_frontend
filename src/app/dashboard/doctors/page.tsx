"use client";

import { useEffect, useState } from "react";
import { Layout, Table, Button, Input, Spin, message, Select, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { deleteDoctor, getDoctors, updateDoctor } from "@/lib/services/doctorService"; // gọi API service
import { useRouter } from "next/navigation";

const { Content } = Layout;
const { Search } = Input;

interface Doctor {
    key: string;
    id: string;
    name: string;
    avatar: string;
    gender: string;
    email: string;
    city: string;
    birthdate: string;
    address: string;
    createdAt: string;
}

export default function DoctorsPage() {
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]); // dữ liệu gốc
    const [doctors, setDoctors] = useState<Doctor[]>([]); // dữ liệu hiển thị
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const onSearch = (value: string) => {
        if (!value.trim()) {
            setDoctors(allDoctors); // nếu input rỗng → render lại danh sách gốc
        } else {
            const filtered = allDoctors.filter((doc) =>
                doc.name.toLowerCase().includes(value.toLowerCase())
            );
            setDoctors(filtered);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoctor(id);
            message.success("Xóa thành công");
            setAllDoctors((prev) => prev.filter((doc) => doc.id !== id));
            setDoctors((prev) => prev.filter((doc) => doc.id !== id));
        } catch (err) {
            message.error("Lỗi khi xóa bác sĩ");
        }
    };

    const columns: ColumnsType<Doctor> = [

        { title: "ID", dataIndex: "id" },
        {
            title: "Avatar",
            dataIndex: "avatar",
            render: (url: string) => (
                <img
                    src={url || "/user.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                />
            ),
        },
        { title: "Name", dataIndex: "name" },
        { title: "Email", dataIndex: "email" },
        { title: "Gender", dataIndex: "gender" },
        { title: "City", dataIndex: "city" },
        { title: "Address", dataIndex: "address" },
        {
            title: "Birthdate",
            dataIndex: "birthdate",
            render: (value: string) => {
                if (!value) return "-";
                const date = new Date(value);
                return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")
                    }/${date.getFullYear()}`;
            },
        },
        {
            title: "Action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button onClick={() => router.push(`/dashboard/doctors/${record.id}`)}>
                        Xem chi tiết
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa bác sĩ này?"
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

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const data = await getDoctors();
                const mapped = data.map((d: any, index: number) => ({
                    key: d.id?.toString() || index.toString(),
                    id: d.id,
                    name: d.name,
                    avatar: d.avatar,
                    email: d.email,
                    gender: d.gender,
                    city: d.city,
                    address: d.address,
                    birthdate: d.birthdate,
                    createdAt: d.createdAt,
                }));
                setAllDoctors(mapped);
                setDoctors(mapped); // khởi tạo hiển thị = danh sách gốc
            } catch (err) {
                message.error("Không thể tải dữ liệu bác sĩ");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout>
                <Content className="m-4 p-4 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-bold">Bác sĩ</h2>
                        <Button type="primary" onClick={() => router.push("doctors/new")}>Thêm bác sĩ</Button>
                    </div>

                    {/* Search Input */}
                    <div className="flex p-4 rounded">
                        <Search
                            className="w-80"
                            placeholder="Tìm kiếm tên bác sĩ"
                            onSearch={onSearch}
                            allowClear
                            enterButton
                        />
                        <Select
                            showSearch
                            allowClear
                            placeholder="Lọc Chức vụ"
                            optionFilterProp="label"
                            onChange={(value) => {
                                if (!value) {
                                    setDoctors(allDoctors);
                                } else {
                                    const filtered = allDoctors.filter((doc) => doc.id === value);
                                    setDoctors(filtered);
                                }
                            }}
                            onSearch={onSearch}
                            options={allDoctors.map((doc) => ({ label: doc.city, value: doc.id }))}
                            className="ml-4 w-60"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={doctors}
                            pagination={{ pageSize: 5, showSizeChanger: false }}
                        />
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}




