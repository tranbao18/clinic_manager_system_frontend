// src/app/api/quotes/random/route.ts
// Proxy API để lấy quote từ zenquotes.io, tránh CORS issue
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Sử dụng zenquotes.io API - free, reliable, no auth required
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch("https://zenquotes.io/api/random", {
            cache: "no-store",
            signal: controller.signal,
            headers: {
                "Accept": "application/json",
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        // zenquotes.io returns array with {q: quote, a: author}
        if (Array.isArray(data) && data.length > 0) {
            return NextResponse.json({
                text: data[0].q || data[0].quote || data[0].text || "",
                author: data[0].a || data[0].author || "Unknown",
            });
        }

        // Fallback for other API formats
        if (data.content || data.quote) {
            return NextResponse.json({
                text: data.content || data.quote || "",
                author: data.author || data.authorName || "Unknown",
            });
        }

        throw new Error("Invalid API response format");
    } catch (error: any) {
        console.error("Error fetching quote from zenquotes.io:", error);
        // Trả về lỗi để client biết cần dùng fallback
        return NextResponse.json(
            { error: error.message || "Failed to fetch quote" },
            { status: 500 }
        );
    }
}

