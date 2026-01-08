// KẾ THỪA
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const MEDICAL_RECORDS_URL = `${API_URL}/api/medical-records`;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const disabled = searchParams.get("disabled");
        
        const headers = await getAuthHeaderServer();
        
        let url = MEDICAL_RECORDS_URL;
        if (disabled === "true") {
            url += `?disabled=true`;
        }
        
        const res = await fetch(url, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET medical records) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách hồ sơ y tế", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        let list = Array.isArray(data) ? data : data.medicalRecords || [];
        
        if (disabled === "true") {
            list = list.filter((item: any) => item.disabled === true);
        } else if (disabled === "false") {
            list = list.filter((item: any) => item.disabled !== true);
        }
        
        return NextResponse.json(list);
    } catch (err: any) {
        console.error("GET /api/medical-records exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const body = await req.json();
        const res = await fetch(MEDICAL_RECORDS_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST medical record) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể tạo hồ sơ y tế", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/medical-records exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

