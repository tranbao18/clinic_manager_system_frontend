"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Divider,
  Spin,
  message,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import UsersService from "@/lib/services/usersService";
import EmployeesPage from "../employees/page";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [data, setData] = useState<{ user?: any; employee?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Lấy user từ session (server) thay vì localStorage
        const meRes = await fetch("/api/users/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!meRes.ok) throw new Error("Chưa đăng nhập");
        const me = await meRes.json();

        const userId = me.id || me._id;
        if (!userId) throw new Error("Không tìm thấy ID người dùng");

        const result = await UsersService.getByUserId(userId);
        setData(result);
      } catch (err: any) {
        console.error(err);
        message.error(err.message || "Không thể tải thông tin tài khoản");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );

  if (!data)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        Không có thông tin người dùng
      </div>
    );

  const { user, employee } = data;

  return (
    <div className="p-6 flex justify-center bg-gray-50 min-h-screen">
      <Card
        className="w-full max-w-3xl shadow-xl rounded-2xl border border-gray-200"
        styles={{ body: { padding: "2rem" } }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar
            size={96}
            icon={<UserOutlined />}
            className="mb-4 bg-blue-500"
          />
          <Title level={3} className="!mb-0">
            {employee?.fullname || user?.username}
          </Title>
          <Text type="secondary" className="text-gray-500">
            {employee?.position || user?.role || "Nhân viên"}
          </Text>
        </div>

        <Divider className="border-gray-200" />

        {/* Info section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card
              className="rounded-xl shadow-sm border border-gray-100"
              size="small"
            >
              <p className="mb-2">
                <IdcardOutlined className="text-blue-500 mr-2" />
                <Text strong>Mã nhân viên:</Text> {employee?._id || "-"}
              </p>
              <p className="mb-2">
                <MailOutlined className="text-blue-500 mr-2" />
                <Text strong>Email:</Text> {employee?.email || user?.email || "-"}
              </p>
              <p>
                <PhoneOutlined className="text-blue-500 mr-2" />
                <Text strong>Điện thoại:</Text> {employee?.phone || "-"}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card
              className="rounded-xl shadow-sm border border-gray-100"
              size="small"
            >
              <p className="mb-2">
                <EnvironmentOutlined className="text-blue-500 mr-2" />
                <Text strong>Ngày sinh:</Text> {employee?.dob
              ? new Date(employee.dob).toLocaleDateString("vi-VN")
              : "-"}
              </p>
              <p className="mb-2">
                <UserOutlined className="text-blue-500 mr-2" />
                <Text strong>Tài khoản:</Text> {user?.username || "-"}
              </p>
              <p>
                <CalendarOutlined className="text-blue-500 mr-2" />
                <Text strong>Ngày tạo:</Text>{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("vi-VN")
                  : "-"}
              </p>
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <Divider className="border-gray-200 mt-6" />
        <div className="text-center text-gray-500 text-sm">
          <Text type="secondary">
            Thông tin tài khoản được cập nhật lần cuối:{" "}
            {user?.updated_at
              ? new Date(user.updated_at).toLocaleDateString("vi-VN")
              : "-"}
          </Text>
        </div>
      </Card>
    </div>
  );
}
