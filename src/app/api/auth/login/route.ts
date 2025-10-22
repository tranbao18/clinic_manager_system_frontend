import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(req: Request) {
    try {
        const { username, passwordHash  } = await req.json();

        // 🔹 Gọi API user list
        const res = await fetch("https://68ef7b4db06cc802829d91ae.mockapi.io/users");
        if (!res.ok) {
            return NextResponse.json({ error: "Không thể kết nối server người dùng" }, { status: 500 });
        }

        const users = await res.json();

        // 🔹 Tìm user khớp username & password
        const found = users.find(
            (u: any) => u.username === username && u.passwordHash === passwordHash 
        );

        if (!found) {
            return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu sai" }, { status: 401 });
        }

        // ✅ Tạo phản hồi trước
        const response = NextResponse.json({ user: found });

        // ✅ Gắn session
        const session = await getIronSession<SessionData>(req, response, sessionOptions);
        session.user = {
            id: found.id,
            username: found.username,
            role: found.role,
        };
        await session.save();

        return response;
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}
