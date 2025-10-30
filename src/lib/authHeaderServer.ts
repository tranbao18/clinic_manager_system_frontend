// src/lib/authHeaderServer.ts
'use server';

import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function getAuthHeaderServer() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  const token = session?.user?.token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
