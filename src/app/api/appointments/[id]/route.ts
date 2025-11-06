// src/app/api/appointments/[id]/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = "http://localhost:5050/api/appointments/";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeaders = await getAuthHeaderServer();
        const body = await req.json();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (authHeaders.Authorization) {
            headers.Authorization = authHeaders.Authorization;
        }

        const res = await fetch(`${API_URL}${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (PUT appointment) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể cập nhật lịch hẹn", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi hệ thống";
        console.error("PUT /api/appointments/[id] exception:", err);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeaders = await getAuthHeaderServer();
        const headers: Record<string, string> = {};
        if (authHeaders.Authorization) {
            headers.Authorization = authHeaders.Authorization;
        }

        const res = await fetch(`${API_URL}${id}`, {
            method: "DELETE",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (DELETE appointment) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể xóa lịch hẹn", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi hệ thống";
        console.error("DELETE /api/appointments/[id] exception:", err);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

