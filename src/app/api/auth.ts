export type User = {
    id: string;
    user_name: string;
    password_hash: string;
    role?: string;
};

// ✅ Hàm login sẽ gọi API Next.js để set session
export async function login(user_name: string, password: string): Promise<User | null> {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_name, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("Login failed:", data.error);
            return null;
        }

        return data.user || null;
    } catch (err) {
        console.error("Login error:", err);
        return null;
    }
}

export async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
}
