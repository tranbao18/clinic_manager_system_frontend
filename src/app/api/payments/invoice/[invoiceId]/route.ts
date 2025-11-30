// src/app/api/payments/invoice/[invoiceId]/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";

// 🔍 GET - Lấy thanh toán theo invoice_id
export async function GET(
    req: Request,
    { params }: { params: Promise<{ invoiceId: string }> }
) {
    try {
        const { invoiceId } = await params;
        const headers = await getAuthHeaderServer();
        const url = `${API_URL}/api/payments/invoice/${invoiceId}`;
        
        const res = await fetch(url, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET payments by invoice) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy thanh toán của hóa đơn", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (err: any) {
        console.error("GET /api/payments/invoice/[invoiceId] exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

