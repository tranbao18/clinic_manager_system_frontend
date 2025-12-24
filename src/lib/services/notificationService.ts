// lib/services/notificationService.ts

export interface Notification {
  _id: string;
  recipient_id: string;
  recipient_role: string;
  type: 'appointment_created' | 'medical_record_created' | 'invoice_created' | 'payment_created' | 'appointment_completed';
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationCount {
  count: number;
}

// 📋 Lấy danh sách thông báo
export async function getNotifications(read?: boolean): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (read !== undefined) {
    params.append('read', read.toString());
  }

  const res = await fetch(`/api/notifications?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Không thể lấy thông báo" }));
    throw new Error(error.error || "Không thể lấy thông báo");
  }

  return res.json();
}

// 🔢 Lấy số lượng thông báo chưa đọc
export async function getUnreadCount(): Promise<number> {
  const res = await fetch("/api/notifications/unread-count", {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    return 0; // Trả về 0 nếu có lỗi
  }

  const data: NotificationCount = await res.json();
  return data.count || 0;
}

// ✅ Đánh dấu thông báo là đã đọc
export async function markAsRead(notificationId: string): Promise<Notification> {
  const res = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Không thể đánh dấu đã đọc" }));
    throw new Error(error.error || "Không thể đánh dấu đã đọc");
  }

  return res.json();
}

// ✅ Đánh dấu tất cả thông báo là đã đọc
export async function markAllAsRead(): Promise<void> {
  const res = await fetch("/api/notifications/read-all", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Không thể đánh dấu tất cả đã đọc" }));
    throw new Error(error.error || "Không thể đánh dấu tất cả đã đọc");
  }
}

// 🗑️ Xóa thông báo
export async function deleteNotification(notificationId: string): Promise<void> {
  const res = await fetch(`/api/notifications/${notificationId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Không thể xóa thông báo" }));
    throw new Error(error.error || "Không thể xóa thông báo");
  }
}
