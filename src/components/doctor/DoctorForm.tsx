"use client";

import { Form, Input, Button, DatePicker, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface DoctorFormProps {
    onFinish: (values: any) => void;
    loading?: boolean;
    initialValues?: any;
}

export default function DoctorForm({ onFinish, loading, initialValues }: DoctorFormProps) {
    return (
        <Form
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialValues}
        >
            <Form.Item label="Tên bác sĩ" name="name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Ảnh đại diện" name="avatar" valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList}>
                <Upload
                    name="file"
                    listType="picture"
                    maxCount={1}
                    beforeUpload={() => false}
                >
                    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
            </Form.Item>

            <Form.Item label="Giới tính" name="gender">
                <Select
                    options={[
                        { label: "Nam", value: "male" },
                        { label: "Nữ", value: "female" },
                        { label: "Khác", value: "other" },
                    ]}
                />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ type: "email" }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Thành phố" name="city">
                <Input />
            </Form.Item>

            <Form.Item label="Ngày sinh" name="birthdate">
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address">
                <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu
                </Button>
            </Form.Item>
        </Form>
    );
}
