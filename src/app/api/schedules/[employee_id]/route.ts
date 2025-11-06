// src/app/api/schedules/[employee_id]/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = "http://localhost:5050/api/schedules";

// GET /api/schedules/[employee_id] - Lấy lịch trực của một nhân viên
export async function GET(
    req: Request,
    context: { params: Promise<{ employee_id: string }> }
) {
    try {
        const { employee_id } = await context.params;
        const auth = await getAuthHeaderServer();
        const headers: Record<string, string> = auth ? (auth as Record<string, string>) : {};

        const res = await fetch(`${API_URL}/${employee_id}`, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET schedule) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy lịch trực", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("GET /api/schedules/[employee_id] exception:", err);
        const message = err instanceof Error ? err.message : "Lỗi hệ thống";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PUT /api/schedules/[employee_id] - Cập nhật lịch trực (chỉ Admin)
export async function PUT(
    req: Request,
    context: { params: Promise<{ employee_id: string }> }
) {
    try {
        const { employee_id } = await context.params;
        const auth = await getAuthHeaderServer();
        const authHeaders: Record<string, string> = auth ? (auth as Record<string, string>) : {};
        const body = await req.json();

        const res = await fetch(`${API_URL}/${employee_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (PUT schedules) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể cập nhật lịch trực", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("PUT /api/schedules/[employee_id] exception:", err);
        const message = err instanceof Error ? err.message : "Lỗi hệ thống";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// DELETE /api/schedules/[employee_id] - Xóa lịch trực (chỉ Admin)
export async function DELETE(
    req: Request,
    context: { params: Promise<{ employee_id: string }> }
) {
    try {
        const { employee_id } = await context.params;
        const auth = await getAuthHeaderServer();
        const headers: Record<string, string> = auth ? (auth as Record<string, string>) : {};

        const res = await fetch(`${API_URL}/${employee_id}`, {
            method: "DELETE",
            headers,
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (DELETE schedules) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể xóa lịch trực", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("DELETE /api/schedules/[employee_id] exception:", err);
        const message = err instanceof Error ? err.message : "Lỗi hệ thống";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
