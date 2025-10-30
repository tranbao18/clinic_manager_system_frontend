import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employees`;

// 🟢 GET chi tiết nhân viên
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ phải await
  const headers = await getAuthHeaderServer();

  const response = await fetch(`${API_URL}/${id}`, {
    headers: { ...headers, "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

// 🟡 PUT cập nhật nhân viên
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const headers = await getAuthHeaderServer();

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

// 🔴 DELETE nhân viên
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const headers = await getAuthHeaderServer();

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
