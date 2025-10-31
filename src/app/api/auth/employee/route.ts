import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/employees";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const headers = await getAuthHeaderServer();

    const res = await fetch(`${API_URL}/${id}`, {
        headers: { ...headers, "Content-Type": "application/json" },
        cache: "no-store",
    });

    const data = await res.json();
    console.log(data);
    return NextResponse.json(data, { status: res.status });
}
