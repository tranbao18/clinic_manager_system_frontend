// src/app/api/medicines/import/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const MEDICINES_IMPORT_URL = `${API_URL}/api/medicines/import`;

// 📤 POST - Import thuốc từ file Excel/CSV
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Không có file được chọn" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "text/csv", // .csv
        ];
        const isValidType =
            allowedTypes.includes(file.type) || file.name.endsWith(".csv");

        if (!isValidType) {
            return NextResponse.json(
                {
                    error:
                        "Định dạng file không được hỗ trợ. Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)",
                },
                { status: 400 }
            );
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File quá lớn. Kích thước tối đa là 10MB" },
                { status: 400 }
            );
        }

        const authHeaders = await getAuthHeaderServer();
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        // Chỉ thêm Authorization header nếu có token
        const headers: HeadersInit = {};
        if (authHeaders.Authorization) {
            headers.Authorization = authHeaders.Authorization;
        }

        const res = await fetch(MEDICINES_IMPORT_URL, {
            method: "POST",
            headers,
            body: uploadFormData,
        });

        if (!res.ok) {
            const text = await res.text();
            let errorData;
            try {
                errorData = JSON.parse(text);
            } catch {
                errorData = { error: text };
            }
            console.error("External API (POST import medicines) error:", res.status, errorData);
            return NextResponse.json(
                { error: errorData.error || "Không thể import file", detail: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi hệ thống";
        console.error("POST /api/medicines/import exception:", err);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

