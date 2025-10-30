"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Typography, Divider, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🧠 Dữ liệu mẫu tạm thời trong khi chưa có API
    const sampleUser = {
      id: "EMP001",
      fullname: "Nguyễn Văn A",
      username: "nguyenvana",
      role: "Bác sĩ nha khoa",
      email: "nguyenvana@clinic.com",
      phone: "0987 654 321",
      address: "123 Đường Nguyễn Huệ, TP.HCM",
      createdAt: "2024-08-15T09:30:00Z",
    };

    setTimeout(() => {
      setUser(sampleUser);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Spin fullscreen />;

  return (
    <div className="p-6 flex justify-center">
      <Card
        className="w-full max-w-2xl shadow-lg rounded-xl"
        title={
          <div className="flex items-center gap-4">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <Title level={4} className="mb-0">
                {user.fullname}
              </Title>
              <Text type="secondary">{user.role}</Text>
            </div>
          </div>
        }
      >
        <Divider />

        <div className="space-y-3">
          <p>
            <IdcardOutlined /> <Text strong>Mã nhân viên:</Text> {user.id}
          </p>
          <p>
            <MailOutlined /> <Text strong>Email:</Text> {user.email}
          </p>
          <p>
            <PhoneOutlined /> <Text strong>Số điện thoại:</Text> {user.phone}
          </p>
          <p>
            <Text strong>Địa chỉ:</Text> {user.address}
          </p>
          <p>
            <Text strong>Tài khoản đăng nhập:</Text> {user.username}
          </p>
          <p>
            <Text strong>Ngày tạo tài khoản:</Text>{" "}
            {new Date(user.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </Card>
    </div>
  );
}
