"use client";

import { Layout, Menu } from "antd";
import { useState, useEffect } from "react";
import { getMenuByRole } from "@/lib/menu";

const { Sider } = Layout;

export default function Navbar() {
    const [collapsed, setCollapsed] = useState(false);
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        // 👇 lấy session từ API route Next.js
        fetch("/api/session")
            .then((res) => res.json())
            .then((data) => {
                setRole(data?.user?.role || "");
            });
    }, []);

    const menuItems = getMenuByRole(role);

    return (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <div className="text-white text-center py-4 text-lg font-bold">CMS</div>
            <Menu
                theme="dark"
                mode="inline"
                items={menuItems}
                defaultSelectedKeys={["1"]}
            />
        </Sider>
    );
}
