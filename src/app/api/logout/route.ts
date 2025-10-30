import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(req: Request) {
  const res = new NextResponse();

  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();

  // ✅ phải trả lại headers để cookie bị xóa thực sự
  return NextResponse.json({ success: true }, { headers: res.headers });
}
