"use client";

import { Layout } from "antd";
import { Avatar } from "@mui/material";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const { Header: AntHeader } = Layout;

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy thông tin user đang đăng nhập
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
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) return null;

  return (
    <AntHeader className="bg-white flex justify-between items-center px-4 shadow">
      <div className="flex items-center gap-4"></div>

      {/* ✅ Hiển thị thông tin user */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar alt={user?.username} src={user?.avatar || "/avatar.png"} />
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
