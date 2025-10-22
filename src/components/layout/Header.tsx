"use client";

import { Layout } from "antd";
import { Select, Avatar } from "@mui/material";
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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    if (!isClient) return null; // Đảm bảo chỉ render trên client
    const handleLogout = async () => {
        try {
            await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });
            router.push("/auth/login"); // quay lại trang login
        } catch (err) {
            console.error("Logout failed", err);
        }
    };
    return (
        <AntHeader className="bg-white flex justify-between items-center px-4 shadow">
            <div className="flex items-center gap-4"></div>

            {/* User Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <Avatar alt="Admin" src="/avatar.png" />
                        <span>Admin</span>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </AntHeader>
    );
}
