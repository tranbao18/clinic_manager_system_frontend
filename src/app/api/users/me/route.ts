import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  return NextResponse.json(session.user, {
    headers: { "Cache-Control": "no-store" },
  });
}
