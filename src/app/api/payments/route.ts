// src/app/api/payments/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const PAYMENTS_URL = `${API_URL}/api/payments`;

// 📦 GET - Lấy danh sách thanh toán
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const invoice_id = searchParams.get("invoice_id");
        
        const headers = await getAuthHeaderServer();
        
        // Tạo URL với query params
        let url = PAYMENTS_URL;
        if (invoice_id) {
            url += `?invoice_id=${invoice_id}`;
        }
        
        const res = await fetch(url, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET payments) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách thanh toán", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (err: any) {
        console.error("GET /api/payments exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

// ➕ POST - Tạo thanh toán mới
export async function POST(req: Request) {
    try {
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const body = await req.json();
        const res = await fetch(PAYMENTS_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST payment) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể tạo thanh toán", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/payments exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

