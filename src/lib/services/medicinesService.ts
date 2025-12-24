// src/lib/services/medicinesService.ts
export interface Medicine {
    _id: string;
    name: string;
    category: string[]; // Array of categories
    unit: string;
    price: number;
    total_remaining?: number; // Tổng số lượng còn lại từ medicine-imports
    created_at: string;
    updated_at: string;
}

export interface CreateMedicineData {
    name: string;
    category: string[]; // Array of categories
    unit: string;
    price: number;
}

export interface UpdateMedicineData {
    name?: string;
    category?: string[]; // Array of categories
    unit?: string;
    price?: number;
}

// Danh sách các danh mục thuốc có sẵn
export const MEDICINE_CATEGORIES = [
    "Kháng sinh",
    "Giảm đau",
    "Hạ sốt",
    "Kháng viêm",
    "Vitamin",
    "Khoáng chất",
    "Tim mạch",
    "Tiêu hóa",
    "Hô hấp",
    "Da liễu",
    "Thuốc mắt",
    "Tai mũi họng",
    "Thần kinh",
    "Nội tiết",
    "Khác",
] as const;

// 📦 Lấy danh sách thuốc
export async function getMedicines(): Promise<Medicine[]> {
    try {
        const res = await fetch("/api/medicines", { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`Failed to fetch medicines: ${res.status}`);
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ getMedicines errors:", errorMessage);
        return [];
    }
}

// 🔍 Lấy chi tiết thuốc theo ID
export async function getMedicineById(id: string): Promise<Medicine> {
    const res = await fetch(`/api/medicines/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy thông tin thuốc");
    return res.json();
}

// ➕ Tạo thuốc mới
export async function createMedicine(data: CreateMedicineData): Promise<Medicine> {
    const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể tạo thuốc" }));
        throw new Error(error.error || "Không thể tạo thuốc");
    }
    return res.json();
}

// ✏️ Cập nhật thuốc
export async function updateMedicine(
    id: string,
    data: UpdateMedicineData
): Promise<Medicine> {
    const res = await fetch(`/api/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể cập nhật thuốc" }));
        throw new Error(error.error || "Không thể cập nhật thuốc");
    }
    return res.json();
}

// ❌ Xóa thuốc (soft delete - set disabled: true)
export async function deleteMedicine(id: string): Promise<void> {
    const res = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể xóa thuốc" }));
        throw new Error(error.error || "Không thể xóa thuốc");
    }
}

// 📦 Lấy danh sách thuốc đã xóa (disabled: true)
export async function getDisabledMedicines(): Promise<Medicine[]> {
    const res = await fetch("/api/medicines?disabled=true", { cache: "no-store" });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể lấy danh sách thuốc đã xóa" }));
        throw new Error(error.error || "Không thể lấy danh sách thuốc đã xóa");
    }
    return res.json();
}

// ♻️ Khôi phục thuốc (set disabled: false)
export async function restoreMedicine(id: string): Promise<Medicine> {
    const res = await fetch(`/api/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: false }),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể khôi phục thuốc" }));
        throw new Error(error.error || "Không thể khôi phục thuốc");
    }
    return res.json();
}

// ❌ Xóa vĩnh viễn thuốc (hard delete)
export async function hardDeleteMedicine(id: string): Promise<void> {
    const res = await fetch(`/api/medicines/${id}?hard=true`, { method: "DELETE" });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể xóa vĩnh viễn thuốc" }));
        throw new Error(error.error || "Không thể xóa vĩnh viễn thuốc");
    }
}

// ❌ Xóa vĩnh viễn nhiều thuốc (bulk hard delete). Body: { ids: string[] }
export async function hardDeleteMedicines(ids: string[]): Promise<void> {
    const res = await fetch(`/api/medicines/bulk-delete?hard=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể xóa vĩnh viễn các thuốc" }));
        throw new Error(error.error || "Không thể xóa vĩnh viễn các thuốc");
    }
}

