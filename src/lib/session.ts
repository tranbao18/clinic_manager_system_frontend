import { IronSessionOptions } from "iron-session";

export const sessionOptions: IronSessionOptions = {
    password:
        process.env.SESSION_SECRET ??
        "complex_password_at_least_32_characters",
    cookieName: "myapp_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        maxAge: undefined,
    },
};

export type SessionData = {
    user?: {
        id: string;
        user_name: string;
        role: string;
        token?: string;
    };
};
