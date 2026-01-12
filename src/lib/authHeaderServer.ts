// TỰ VIẾT
'use server';

import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies, headers } from "next/headers";

export async function getAuthHeaderServer() {
  // First prefer an Authorization header forwarded from the client (useful when client stores token in localStorage)
  try {
    const hdrs: any = await headers();
    const forwarded = hdrs.get?.("authorization") || hdrs.get?.("Authorization") || hdrs.authorization;
    if (forwarded) {
      return { Authorization: forwarded };
    }
  } catch (e) {
    // ignore
  }

  // Fallback to iron-session stored token (cookie)
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  const token = session?.user?.token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
