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
  Button,
  Form,
  Input,
  Modal,
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
import AuthService from "@/lib/services/authService";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [data, setData] = useState<{ user?: any; employee?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
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
  const userId = user?._id || user?.id;
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const canSelfChangePassword = !!userId && !isAdmin;

  const handleSubmitChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!userId) return;
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    try {
      setChangingPassword(true);
      await AuthService.changePassword(userId, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công");
      form.resetFields();
      setIsModalOpen(false);
    } catch (error: any) {
      message.error(error.message || "Không thể đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

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

        {canSelfChangePassword && (
          <>
            <Divider className="border-gray-200 mt-6" />
            <div className="text-center">
              <Text className="block mb-3 text-gray-600">
                Đổi mật khẩu đăng nhập của bạn
              </Text>
              <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Đổi mật khẩu
              </Button>
            </div>
            <Modal
              title="Đổi mật khẩu"
              open={isModalOpen}
              footer={null}
              destroyOnHidden
              onCancel={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}
            >
              <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmitChangePassword}
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="oldPassword"
                  rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}
                >
                  <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Nhập mật khẩu mới" },
                    { min: 6, message: "Mật khẩu cần ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[{ required: true, message: "Xác nhận mật khẩu mới" }]}
                >
                  <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
                <div className="text-right">
                  <Button
                    className="mr-2"
                    onClick={() => {
                      setIsModalOpen(false);
                      form.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={changingPassword}
                  >
                    Xác nhận
                  </Button>
                </div>
              </Form>
            </Modal>
          </>
        )}

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
