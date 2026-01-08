// KẾ THỪA
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payrolls`;

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

    const { searchParams } = new URL(req.url);
    const sendEmail = searchParams.get("sendEmail");

    let url = `${API_URL}/${id}`;
    if (sendEmail === "false") {
        url += "?sendEmail=false";
    }

    const response = await fetch(url, {
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
    const { id } = await context.params;
    const headers = await getAuthHeaderServer();

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { ...headers, "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}

