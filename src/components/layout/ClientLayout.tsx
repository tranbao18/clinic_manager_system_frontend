"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith("/auth");

    if (isAuthPage) {
        // Trả về body hợp lệ
        return (
            <body className="min-h-screen flex items-center justify-center bg-gray-100">
                {children}
            </body>
        );
    }

    return (
        <body className="flex">
            <Navbar />
            <div className="flex-1 flex flex-col bg-gray-50">
                <Header />
                <main>{children}</main>
            </div>
        </body>
    );
}
