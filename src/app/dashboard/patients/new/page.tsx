"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Form, message, Card, Select } from "antd";
import { createPatient, Patient } from "@/lib/services/patientsService";

export default function AddPatientPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const handleAddPatient = async (values: Omit<Patient, "id">) => {
        try {
            setSaving(true);
            await createPatient(values);
            message.success("Thêm bệnh nhân thành công!");
            router.push("/dashboard/patients");
        } catch (error) {
            console.error(error);
            message.error("Không thể thêm bệnh nhân");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card title="Thêm bệnh nhân mới">
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleAddPatient}
                    initialValues={{
                        fullName: "",
                        dob: "",
                        gender: "",
                        address: "",
                        phone: "",
                        email: "",
                        medicalHistory: "",
                    }}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
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
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
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
                        <Button onClick={() => router.back()}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                        >
                            Thêm bệnh nhân
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
