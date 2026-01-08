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
import { getDisabledAppointments, restoreAppointment, Appointment } from "@/lib/services/appointmentsService";
import { UndoOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Search } = Input;

export default function DisabledAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const router = useRouter();

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await getDisabledAppointments();
            setAppointments(data);
            setFilteredAppointments(data);
        } catch (error) {
            console.error("Fetch disabled appointments error:", error);
            message.error("Không thể tải danh sách lịch hẹn đã xóa");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
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
            setFilteredAppointments(appointments);
        } else {
            const filtered = appointments.filter((item) =>
                normalizeText(item.reason || "").includes(search) ||
                normalizeText(item.status || "").includes(search)
            );
            setFilteredAppointments(filtered);
        }
    };

    const handleRestore = async (_id: string) => {
        try {
            await restoreAppointment(_id);
            message.success("Đã khôi phục lịch hẹn");
            fetchAppointments();
        } catch {
            message.error("Khôi phục thất bại");
        }
    };

    const columns: ColumnsType<Appointment> = [
        {
            title: "Ngày hẹn",
            dataIndex: "appointment_date",
            key: "appointment_date",
            render: (date: string) => {
                if (!date) return "-";
                const d = new Date(date);
                return d.toLocaleString("vi-VN");
            },
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const statusColors: Record<string, string> = {
                    "Scheduled": "blue",
                    "Completed": "green",
                    "Cancelled": "red",
                };
                return (
                    <Tag color={statusColors[status] || "default"}>
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: "Trạng thái xóa",
            key: "deleted_status",
            render: () => (
                <Tag color="red">Đã xóa</Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
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
    // TỰ VIẾT
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push("/dashboard/appointments")}
                        className="mb-2"
                    >
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">Danh sách lịch hẹn đã xóa</h1>

                </div>
            </div>

            <Space className="mb-4 flex flex-wrap" align="center">
                <Search
                    placeholder="Tìm kiếm theo lý do hoặc trạng thái..."
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
                    dataSource={filteredAppointments}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            )}
        </div>
    );
    // 
}

