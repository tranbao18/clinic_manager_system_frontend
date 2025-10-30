"use client";

import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Layout,
  Card,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import AuthService from "@/lib/services/authService";

const { Content } = Layout;

export default function NewEmployeePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<string>("");
  const router = useRouter();

  // 🔹 Danh sách chức vụ
  const positions = ["Bác sĩ", "Y tá", "Lễ tân", "Kế toán", "Admin"];

  // 🔹 Danh sách chuyên khoa
  const specializations = [
    "Nội tổng hợp",
    "Nhi khoa",
    "Da liễu",
    "Tim mạch",
    "Chấn thương chỉnh hình",
    "Tai mũi họng",
  ];

  // 🔹 Mapping giới tính
  const mapGenderToApiValue = (gender: string) => {
    if (gender === "Nam") return "Male";
    if (gender === "Nữ") return "Female";
    return gender;
  };

  // 🔹 Mapping chức vụ sang role
  function mapPositionToRole(position: string) {
    const mapping: Record<string, string> = {
      "Bác sĩ": "Doctor",
      "Y tá": "Nurse",
      "Lễ tân": "Receptionist",
      "Kế toán": "Accountant",
      Admin: "Admin",
    };
    return mapping[position] || "Receptionist";
  }

  // ✅ Gộp lại: vừa tạo nhân viên + tài khoản
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const role = mapPositionToRole(values.position);

      // Chuẩn hoá payload cho nhân viên
      const employeeData = {
        fullname: values.fullname,
        dob: values.dob ? dayjs(values.dob).toISOString() : null,
        gender: mapGenderToApiValue(values.gender),
        phone: values.phone,
        email: values.email,
        position: values.position,
        specialization: values.specialization || "",
      };

      // Gửi payload đúng định dạng backend yêu cầu
      const result = await AuthService.registerAccountForEmployee(
        role,
        employeeData
      );

      message.success(
        <>
          Nhân viên & tài khoản đã tạo thành công! <br />
          <strong>Tài khoản:</strong> {result.user.username} <br />
          <strong>Mật khẩu:</strong> {result.user.generated_password}
        </>
      );

      router.push("/dashboard/employees");
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Lỗi khi tạo nhân viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content className="p-8">
        <Card title="Thêm Nhân viên mới" className="max-w-2xl mx-auto shadow">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ gender: "Nam" }}
          >
            <Form.Item
              label="Họ tên"
              name="fullname"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ tên nhân viên" />
            </Form.Item>

            <Form.Item label="Ngày sinh" name="dob">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select
                options={[
                  { label: "Nam", value: "Nam" },
                  { label: "Nữ", value: "Nữ" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^0\d{9}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input placeholder="VD: 0909123456" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="VD: name@clinic.com" />
            </Form.Item>

            <Form.Item
              label="Chức vụ"
              name="position"
              rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
            >
              <Select
                placeholder="Chọn chức vụ"
                options={positions.map((p) => ({ label: p, value: p }))}
                onChange={(value) => setPosition(value)}
              />
            </Form.Item>

            {position === "Bác sĩ" && (
              <Form.Item
                label="Chuyên khoa"
                name="specialization"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên khoa" },
                ]}
              >
                <Select
                  placeholder="Chọn chuyên khoa"
                  options={specializations.map((s) => ({
                    label: s,
                    value: s,
                  }))}
                />
              </Form.Item>
            )}

            <Form.Item>
              <div className="flex justify-end gap-4">
                <Button onClick={() => router.push("/dashboard/employees")}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Lưu nhân viên
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
