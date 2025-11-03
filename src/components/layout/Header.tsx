"use client";

import { Layout } from "antd";
import { Avatar } from "antd";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import AuthService from "@/lib/services/authService";

const { Header: AntHeader } = Layout;

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Chỉ fetch profile, không auto-clear token khi khởi động
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/me", {
          credentials: "include",
          cache: "no-store", // ✅ Tắt cache ở phía client luôn
        });
        if (!res.ok) throw new Error("Không thể lấy thông tin user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Gọi AuthService logout để xóa token ở backend và frontend
      await AuthService.logout();
      
      // Xóa session (thông qua /api/logout route)
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed", err);
      // Vẫn chuyển đến trang login dù có lỗi
      router.push("/auth/login");
    }
  };

  if (loading) return null;

  return (
    <AntHeader className="bg-white flex justify-between items-center px-4 shadow">
      <div className="flex items-center gap-4"></div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar
              size={36}
              className="bg-gray-500"
              icon={<UserOutlined />}
            />
            <span>{user?.username || "User"}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* ✅ Click chuyển đến trang Profile */}
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </AntHeader>
  );
}
