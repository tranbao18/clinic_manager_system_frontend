import { NextResponse } from "next/server";

const API_URL = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/users";

// GET: lấy chi tiết bác sĩ theo id
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const res = await fetch(`${API_URL}/${params.id}`, { cache: "no-store" });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: cập nhật 1 phần thông tin bác sĩ theo id
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json(); // chỉ gửi field muốn update, vd { name: "Tên mới" }
        const res = await fetch(`${API_URL}/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: xóa bác sĩ theo id
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await fetch(`${API_URL}/${params.id}`, { method: "DELETE" });
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
