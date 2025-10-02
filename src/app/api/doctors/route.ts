import { NextResponse } from "next/server";

const API_URL = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/users";

// GET: lấy danh sách bác sĩ
export async function GET() {
    try {
        const res = await fetch(API_URL, { cache: "no-store" });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: thêm bác sĩ mới
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
