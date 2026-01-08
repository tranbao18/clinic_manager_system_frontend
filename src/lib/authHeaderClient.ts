// TỰ VIẾT
'use client';

export function getAuthHeaderClient() {
  if (typeof window === "undefined") return {};

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
