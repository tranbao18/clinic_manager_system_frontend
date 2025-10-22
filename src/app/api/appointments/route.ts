// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";

const API_URL = "https://68f086550b966ad5003328d8.mockapi.io/appointments";

export async function GET() {
    try {
        const res = await fetch(`https://68f086550b966ad5003328d8.mockapi.io/appointments`, { cache: "no-store" });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
