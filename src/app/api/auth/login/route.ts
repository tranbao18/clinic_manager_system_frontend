import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(req: Request) {
    const { user_name, password } = await req.json();

    const res = await fetch("https://68d0d0aae6c0cbeb39a2833e.mockapi.io/user");
    const users = await res.json();
    const found = users.find(
        (u: any) => u.user_name === user_name && u.password_hash === password
    );

    if (!found) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ user: found });
    const session = await getIronSession<SessionData>(req, response, sessionOptions);
    session.user = { 
        id: found.id,
        user_name: found.user_name,
        role: found.role
    };
    await session.save();

    return response;
}
