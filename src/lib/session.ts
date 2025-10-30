// src/lib/session.ts
import { IronSessionOptions } from "iron-session";

export interface SessionData {
  user?: {
    id: string;
    username: string;
    role: string;
    token?: string;
  };
}

export const sessionOptions: IronSessionOptions = {
  cookieName: "clinic_session",
  password:
    process.env.SESSION_SECRET ||
    "complex_password_for_dev_please_change_me", // ⚠️ nên đổi trong .env
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // ✅ để cookie được gửi giữa các route
    httpOnly: true,
  },
};
