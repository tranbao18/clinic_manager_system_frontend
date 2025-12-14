import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payrolls`;

export async function POST(
    req: Request,
    context: { params: Promise<{ employee_id: string }> }
) {
    const { employee_id } = await context.params;
    const headers = await getAuthHeaderServer();

    const response = await fetch(`${API_URL}/send/${employee_id}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}

