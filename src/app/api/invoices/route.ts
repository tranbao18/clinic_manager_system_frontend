// src/app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const INVOICES_URL = `${API_URL}/api/invoices`;

// 📦 GET - Lấy danh sách hóa đơn
export async function GET(req: Request) {
    try {
        const authHeaders = await getAuthHeaderServer();
        const headers: Record<string, string> = {};
        if (authHeaders.Authorization) {
            headers.Authorization = authHeaders.Authorization;
        }
        
        // Backend không hỗ trợ filter, lấy tất cả và filter ở frontend
        const res = await fetch(INVOICES_URL, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            let errorDetail = "";
            try {
                const errorData = await res.json();
                errorDetail = errorData.error || errorData.message || JSON.stringify(errorData);
            } catch {
                const text = await res.text();
                errorDetail = text || `HTTP ${res.status} ${res.statusText}`;
            }
            
            console.error("External API (GET invoices) error:", {
                status: res.status,
                statusText: res.statusText,
                detail: errorDetail,
                url: INVOICES_URL
            });
            
            // Nếu là lỗi 401/403 (unauthorized/forbidden), trả về mảng rỗng thay vì lỗi
            if (res.status === 401 || res.status === 403) {
                console.warn("⚠️ Không có quyền truy cập invoices, trả về mảng rỗng");
                return NextResponse.json([]);
            }
            
            return NextResponse.json(
                { error: "Không thể lấy danh sách hóa đơn", detail: errorDetail },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (err: any) {
        console.error("GET /api/invoices exception:", err);
        // Trả về mảng rỗng thay vì lỗi để không làm crash app
        return NextResponse.json([]);
    }
}

// ➕ POST - Tạo hóa đơn mới
export async function POST(req: Request) {
    try {
        const authHeaders = await getAuthHeaderServer();
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (authHeaders.Authorization) {
            headers.Authorization = authHeaders.Authorization;
        }

        const body = await req.json();
        const res = await fetch(INVOICES_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST invoice) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể tạo hóa đơn", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/invoices exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

