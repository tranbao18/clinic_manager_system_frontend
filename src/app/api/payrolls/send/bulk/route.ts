// KẾ THỪA
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payrolls`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const headers = await getAuthHeaderServer();

        const response = await fetch(`${API_URL}/send/bulk`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("POST /api/payrolls/send/bulk error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

