import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employees`;

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const headers = await getAuthHeaderServer();

  const response = await fetch(`${API_URL}/${id}`, {
    headers: { ...headers, "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const headers = await getAuthHeaderServer();
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get("hard");
    let url = `${API_URL}/${id}`;
    if (hard === "true") url += `?hard=true`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { message: "Xóa thành công" };
    } catch {
      data = { message: text || "Xóa thành công" };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("DELETE /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi xóa nhân viên" },
      { status: 500 }
    );
  }
}
