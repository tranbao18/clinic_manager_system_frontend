"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Descriptions,
  Button,
  Spin,
  message,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import EmployeesService from "@/lib/services/employeesService";
import AuthService from "@/lib/services/authService";
import dayjs, { Dayjs } from "dayjs";

const { Content } = Layout;
const { Option } = Select;

interface Employee {
  _id: string;
  fullname: string;
  gender: string;
  phone: string;
  email: string;
  position: string;
  specialization?: string;
  address?: string;
  dob?: string;
  created_at: string;
}

interface UserAccount {
  _id: string;
  username: string;
  password_hash: string;
  created_at: string;
  role?: string;
}

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const formattedDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const mapGenderDisplay = (gender?: string) => {
    if (!gender) return "-";
    if (gender === "Male") return "Nam";
    if (gender === "Female") return "Nữ";
    return gender;
  };

  // 🔹 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Lấy thông tin nhân viên (luôn tồn tại)
        const empData = await EmployeesService.getById(id as string);
        setEmployee(empData);

        // 2️⃣ Lấy thông tin tài khoản (có thể null)
        const data = await AuthService.getEmployeeById(id as string);
        setAccount(data?.user || null);

        // 3️⃣ Gán giá trị cho form
        form.setFieldsValue({
          fullname: empData.fullname,
          gender: empData.gender,
          dob: empData.date_of_birth || empData.dob ? dayjs(empData.date_of_birth || empData.dob) : null,
          position: empData.position,
          specialization: empData.specialization,
          phone: empData.phone,
          email: empData.email,
          address: empData.address,
        });
      } catch {
        message.error("Không thể tải dữ liệu nhân viên hoặc tài khoản");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, form]);

  // 🔹 Lưu cập nhật
  const handleSave = async (values: {
    fullname: string;
    gender: string;
    email: string;
    phone?: string;
    address?: string;
    dob?: Dayjs | null;
    position?: string;
    specialization?: string;
  }) => {
    try {
      setSaving(true);
      if (!employee?._id) return;

      // Chuyển đổi dayjs object thành ISO string nếu có
      const payload = {
        ...values,
        dob: values.dob ? dayjs(values.dob).toISOString() : undefined,
      };

      await EmployeesService.updateEmployee(employee._id, payload);
      message.success("Cập nhật thông tin nhân viên thành công!");
      setEmployee({ ...employee, ...payload });
      setEditMode(false);
    } catch {
      message.error("Không thể cập nhật thông tin nhân viên");
    } finally {
      setSaving(false);
    }
  };

  if (!employee && !loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-500">
        Không tìm thấy thông tin nhân viên
      </div>
    );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content className="m-4 p-4 bg-white rounded shadow relative">
        {(loading || saving) && (
          <div className="absolute inset-0 bg-white/60 flex justify-center items-center z-50">
            <Spin size="large" />
          </div>
        )}

        <div
          className={`transition-opacity duration-300 ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Chi tiết Nhân viên</h2>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/dashboard/employees")}>
                Quay lại
              </Button>
              {!editMode ? (
                <Button type="primary" onClick={() => setEditMode(true)}>
                  Chỉnh sửa
                </Button>
              ) : (
                <Button onClick={() => setEditMode(false)}>Hủy</Button>
              )}
            </div>
          </div>

          {/* 🔹 Thông tin nhân viên */}
          <Card title="Thông tin nhân viên" className="mb-6">
            <div style={{ display: !editMode ? "block" : "none" }}>
              <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label="Họ và tên">
                  {employee?.fullname}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {mapGenderDisplay(employee?.gender)}
                </Descriptions.Item>

                <Descriptions.Item label="Chức vụ">
                  {employee?.position}
                </Descriptions.Item>
                <Descriptions.Item label="Chuyên môn">
                  {employee?.specialization || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {employee?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {employee?.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {employee?.dob ? formattedDate(employee.dob) : "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ">
                  {employee?.address || "-"}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions bordered column={1} size="middle" className="mt-4">
                <Descriptions.Item label="Ngày tạo hồ sơ">
                  {formattedDate(employee?.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              style={{ display: editMode ? "block" : "none" }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Họ và tên"
                  name="fullname"
                  rules={[{ required: true, message: "Nhập họ tên" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Chức vụ" name="position">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Chuyên môn" name="specialization">
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input />
                </Form.Item>
                <Form.Item label="Ngày sinh" name="dob">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                >
                  <Input.TextArea />
                </Form.Item>
              </div>

              <div className="text-right">
                <Button onClick={() => setEditMode(false)} className="mr-2">
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </Card>

          {/* 🔹 Thông tin tài khoản */}
          <Card title="Thông tin tài khoản đăng nhập">
            {account ? (
              <Descriptions bordered size="middle" column={2}>
                <Descriptions.Item label="Tên đăng nhập">
                  {account.username}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  {account.role || "-"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="text-gray-500">
                Nhân viên này chưa có tài khoản.
              </div>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
