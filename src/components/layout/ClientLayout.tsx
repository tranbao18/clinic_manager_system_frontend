"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [allowed, setAllowed] = useState<boolean>(true);
    const isAuthPage = pathname.startsWith("/auth");

    if (isAuthPage) {
        // Trả về body hợp lệ
        return (
            <body className="min-h-screen flex items-center justify-center bg-gray-100">
                {children}
            </body>
        );
    }

    // Simple role-based guard mapping theo prefix route
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch("/api/session", { cache: "no-store" });
                const data = await res.json();
                const role: string = (data?.user?.role || "").toLowerCase();

                if (!role) {
                    router.push("/auth/login");
                    return;
                }

                const rules: { prefix: string; roles: string[] }[] = [
                    { prefix: "/dashboard/employees", roles: ["admin"] },
                    { prefix: "/dashboard/patients", roles: ["doctor", "nurse", "receptionist", "admin"] },
                    { prefix: "/dashboard/appointments", roles: ["doctor", "receptionist", "admin"] },
                    { prefix: "/dashboard/report", roles: ["admin", "accountant"] },
                    { prefix: "/dashboard/schedules", roles: ["doctor", "nurse", "admin"] },
                ];

                const matched = rules.find(r => pathname.startsWith(r.prefix));
                if (matched && !matched.roles.includes(role)) {
                    setAllowed(false);
                    router.push("/dashboard");
                    return;
                }

                setAllowed(true);
            } catch {
                router.push("/auth/login");
            }
        };
        checkAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    return (
        <body className="flex">
            <Navbar />
            <div className="flex-1 flex flex-col bg-gray-50">
                <Header />
                <main>{allowed ? children : null}</main>
            </div>
        </body>
    );
}
