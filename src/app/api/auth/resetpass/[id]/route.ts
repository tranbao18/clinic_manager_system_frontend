import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resetpass`;

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("API route: Resetting password for user ID:", id);
    
    const headers = await getAuthHeaderServer();
    console.log("API route: Auth headers present:", !!headers.Authorization);

    const backendUrl = `${API_URL}/${id}`;
    console.log("API route: Calling backend:", backendUrl);

    const res = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "Lỗi không xác định từ server" };
    }

    console.log("API route: Backend response:", { status: res.status, data });

    if (!res.ok) {
      console.error("API route: Backend error response:", data);
      return NextResponse.json(
        { error: data.error || data.message || `Lỗi từ server (${res.status})` },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("PATCH /api/auth/resetpass/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi server khi gọi API reset password" },
      { status: 500 }
    );
  }
}

