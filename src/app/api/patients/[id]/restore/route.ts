import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL_PATIENTS = "http://127.0.0.1:5050/api/patients";

// TỰ VIẾT
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const headers = await getAuthHeaderServer();
        const backendUrl = `${API_URL_PATIENTS}/${id}/restore`;

        const res = await fetch(backendUrl, {
            method: "PUT",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
        });

        console.log('🔍 Backend response status:', res.status);

        if (!res.ok) {
            const text = await res.text();
            console.error(`Backend restore error:`, res.status, text);
            return NextResponse.json(
                { error: `Không thể khôi phục bệnh nhân ${id}`, detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        console.log('🔍 Restore successful:', data);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Restore patient exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}
//