"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Input,
    Button,
    Form,
    Spin,
    message,
    Card,
    Select,
    Row,
    Col,
    Descriptions,
    Empty,
} from "antd";
import dayjs from "dayjs";
import {
    getPatientById,
    updatePatient,
    Patient,
} from "@/lib/services/patientsService";

// 🔹 Hàm chuyển đổi giới tính theo backend
const mapGenderToApiValue = (gender: string) => {
    if (gender === "Nam") return "Male";
    if (gender === "Nữ") return "Female";
    return gender;
};

// 🔹 Hàm chuyển đổi giới tính từ backend sang hiển thị
const mapGenderFromApiValue = (gender: string) => {
    if (gender === "Male") return "Nam";
    if (gender === "Female") return "Nữ";
    return gender;
};

export default function PatientDetailPage() {
    const { patientId } = useParams<{ patientId: string }>();
    const router = useRouter(); 
    const [form] = Form.useForm();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 📦 Lấy dữ liệu bệnh nhân
    useEffect(() => {
        if (!patientId) return;

        const fetchPatient = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/patients/${patientId}`, {
                    cache: "no-store",
                });
                const data = await res.json();
                if (!res.ok)
                    throw new Error(data.error || "Không thể lấy thông tin bệnh nhân");

                // Map giới tính từ API về dạng hiển thị
                const mappedData = {
                    ...data,
                    gender: mapGenderFromApiValue(data.gender),
                    dob: data.dob ? data.dob.split("T")[0] : "",
                };

                setPatient(mappedData);
                form.setFieldsValue(mappedData);
            } catch (err) {
                console.error(err);
                message.error("Không thể tải thông tin bệnh nhân");
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [patientId, form]);

    // 🧩 Cập nhật thông tin
    const handleUpdate = async (values: Partial<Patient>) => {
        try {
            setSaving(true);

            // Chuyển đổi giới tính sang dạng backend chấp nhận
            const payload = {
                ...patient,
                ...values,
                gender: mapGenderToApiValue(values.gender || patient.gender),
                dob: values.dob || patient.dob,
            };

            const updated = await updatePatient(patientId, payload);

            // Map ngược lại khi hiển thị
            const displayData = {
                ...updated,
                gender: mapGenderFromApiValue(updated.gender),
            };

            setPatient(displayData);
            setIsEditing(false);
            message.success("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error(error);
            message.error("Cập nhật thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex justify-center items-center py-10">
                <p className="text-gray-500">Không tìm thấy bệnh nhân</p>
            </div>
        );
    }

    const formatDate = (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "—";

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <Button onClick={() => router.back()} className="mb-4">
                    ← Quay lại
                </Button>
            </div>
            {/* 🔹 Nếu đang ở chế độ XEM THÔNG TIN */}
            {!isEditing && (
                <>
                    <Card
                        title="🩺 Hồ sơ bệnh nhân"
                        variant="borderless"
                        className="shadow-md rounded-2xl"
                        extra={
                            <Button
                                type="primary"
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600"
                            >
                                Chỉnh sửa
                            </Button>
                        }
                    >
                        <Descriptions bordered column={2} size="middle">
                            <Descriptions.Item label="Mã bệnh nhân">
                                {patient._id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Họ và tên">
                                {patient.fullname}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {patient.gender}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {formatDate(patient.dob)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {patient.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {patient.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {patient.address || "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {formatDate(patient.created_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật gần nhất">
                                {formatDate(patient.updated_at)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        title="🧾 Tiền sử bệnh"
                        variant="borderless"
                        className="shadow-md rounded-2xl"
                    >
                        {patient.medical_history && patient.medical_history.length > 0 ? (
                            <div className="space-y-3">
                                {patient.medical_history.map((entry: any, index: number) => (
                                    <Card
                                        key={index}
                                        type="inner"
                                        title={`Khoa: ${entry.khoa}`}
                                        className="border-l-4 border-blue-500"
                                    >
                                        <p className="text-gray-700">{entry.description}</p>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Empty description="Chưa có tiền sử bệnh" />
                        )}
                    </Card>
                </>
            )}

            {/* 🔹 Nếu đang ở chế độ CHỈNH SỬA */}
            {isEditing && (
                <Card
                    title="📝 Chỉnh sửa thông tin bệnh nhân"
                    variant="borderless"
                    className="shadow-md rounded-2xl"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        className="mt-4"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Họ và tên"
                                    name="fullname"
                                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                >
                                    <Input placeholder="Nhập họ và tên" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Ngày sinh" name="dob">
                                    <Input type="date" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Giới tính"
                                    name="gender"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn giới tính" },
                                    ]}
                                >
                                    <Select placeholder="Chọn giới tính">
                                        <Select.Option value="Nam">Nam</Select.Option>
                                        <Select.Option value="Nữ">Nữ</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Số điện thoại" name="phone">
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Email" name="email">
                                    <Input type="email" placeholder="example@email.com" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Địa chỉ" name="address">
                                    <Input placeholder="Nhập địa chỉ" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saving}
                                className="bg-blue-600"
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </Form>
                </Card>
            )}
        </div>
    );
}
