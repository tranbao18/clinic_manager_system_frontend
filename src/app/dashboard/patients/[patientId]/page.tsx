"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input, Button, Form, Spin, message, Card, Select } from "antd";
import {
    getPatientById,
    updatePatient,
    Patient,
} from "@/lib/services/patientsService"; // ✅ Sửa lại import

export default function PatientDetailPage() {
    const { patientId } = useParams<{ patientId: string }>();
    const router = useRouter();
    const [form] = Form.useForm();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!patientId) return; // ⛔ Không gọi khi chưa có id

        const fetchPatient = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/patients/${patientId}`, { cache: "no-store" });
                const text = await res.text();
                console.log("Raw response:", text); // 👈 Xem JSON thực tế
                const data = JSON.parse(text);
                if (!res.ok) throw new Error(data.error || "API Error");

                setPatient(data);
                form.setFieldsValue({
                    ...data,
                    dob: data.dob?.split("T")[0] || "",
                });
            } catch (err) {
                console.error(err);
                message.error("Không thể tải thông tin bệnh nhân");
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [patientId]);


    const handleUpdate = async (values: Partial<Patient>) => {
        try {
            setSaving(true);
            await updatePatient(patientId, values);
            message.success("Cập nhật thông tin thành công!");
            router.push("/dashboard/patients");
        } catch (error) {
            message.error("Cập nhật thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !patient) {
        return (
            <div className="flex justify-center items-center py-10">
                <Spin size="large" />
            </div>
        );
    }


    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card title="Thông tin chi tiết bệnh nhân">
                <Form layout="vertical" form={form} onFinish={handleUpdate}>
                    <Form.Item label="Họ và tên" name="fullName">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Ngày sinh" name="dob">
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        label="Giới tính"
                        name="gender"
                        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                    >
                        <Select placeholder="Chọn giới tính">
                            <Select.Option value="male">Male</Select.Option>
                            <Select.Option value="female">Female</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Địa chỉ" name="address">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Số điện thoại" name="phone">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Email" name="email">
                        <Input type="email" />
                    </Form.Item>

                    <Form.Item label="Tiền sử bệnh" name="medicalHistory">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <div className="flex justify-end gap-3">
                        <Button onClick={() => router.back()}>Quay lại</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
