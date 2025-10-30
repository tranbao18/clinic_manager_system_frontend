"use client";

import { Layout, Menu } from "antd";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMenuByRole } from "@/lib/menu";

const { Sider } = Layout;

export default function Navbar() {
    const [collapsed, setCollapsed] = useState(false);
    const [role, setRole] = useState<string>("");
    const [selectedKey, setSelectedKey] = useState<string>("");
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        fetch("/api/session")
            .then((res) => res.json())
            .then((data) => setRole(data?.user?.role || ""));
    }, []);

    const menuItems = getMenuByRole(role);

    // 🔹 Khi pathname đổi -> tìm item khớp sâu nhất
    useEffect(() => {
        if (menuItems.length > 0) {
            let bestMatch = null;
            let maxLength = 0;

            for (const item of menuItems) {
                if (pathname === item.href || pathname.startsWith(item.href + "/")) {
                    if (item.href.length > maxLength) {
                        bestMatch = item;
                        maxLength = item.href.length;
                    }
                }
            }

            if (bestMatch) {
                setSelectedKey(bestMatch.key);
            } else {
                setSelectedKey("");
            }
        }
    }, [pathname, menuItems]);

    const handleMenuClick = (e: any) => {
        const clickedItem = menuItems.find((item) => item.key === e.key);
        if (clickedItem) {
            setSelectedKey(e.key);
            router.push(clickedItem.href);
        }
    };

    return (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <div className="text-white text-center py-4 text-lg font-bold">CMS</div>
            <Menu
                theme="dark"
                mode="inline"
                items={menuItems.map((item) => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                }))}
                selectedKeys={[selectedKey]}
                onClick={handleMenuClick}
            />
        </Sider>
    );
}
