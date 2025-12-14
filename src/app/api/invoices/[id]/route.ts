// src/app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";

// 🔍 GET - Lấy chi tiết hóa đơn
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaderServer();
    const url = `${API_URL}/api/invoices/${id}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("External API (GET invoice) error:", res.status, text);
      return NextResponse.json(
        { error: "Không thể lấy thông tin hóa đơn", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET /api/invoices/[id] exception:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

// ✏️ PUT - Cập nhật hóa đơn
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = {
      ...(await getAuthHeaderServer()),
      "Content-Type": "application/json",
    };

    const body = await req.json();
    const url = `${API_URL}/api/invoices/${id}`;

    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("External API (PUT invoice) error:", res.status, text);
      return NextResponse.json(
        { error: "Không thể cập nhật hóa đơn", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PUT /api/invoices/[id] exception:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

// ❌ DELETE - Xóa hóa đơn
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaderServer();
    const url = `${API_URL}/api/invoices/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("External API (DELETE invoice) error:", res.status, text);
      return NextResponse.json(
        { error: "Không thể xóa hóa đơn", detail: text },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    console.error("DELETE /api/invoices/[id] exception:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
