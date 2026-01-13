import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://meppod.onrender.com";

export async function GET(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const headers = await getAuthHeaderServer();
    const url = `${API_URL}/api/invoices/${id}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Không thể lấy thông tin hóa đơn", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = context.params;

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
      return NextResponse.json(
        { error: "Không thể cập nhật hóa đơn", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const headers = await getAuthHeaderServer();
    const url = `${API_URL}/api/invoices/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Không thể xóa hóa đơn", detail: text },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
