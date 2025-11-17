import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/changepass`;

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const headers = await getAuthHeaderServer();

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("PATCH /api/users/changepass/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

