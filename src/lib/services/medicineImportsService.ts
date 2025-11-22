// src/lib/services/medicineImportsService.ts
export interface MedicineImport {
    _id: string;
    medicine_id: string | {
        _id: string;
        name: string;
        category: string[];
        unit: string;
        price: number;
    };
    supplier: string;
    batchcode: string;
    quantity: number;
    remaining: number;
    unit_price: number;
    expiry_date: string;
    import_date: string;
    imported_by: string | {
        _id: string;
        fullname: string;
    };
    updated_at: string;
}

export interface CreateMedicineImportData {
    medicine_id: string;
    supplier: string;
    batchcode: string;
    quantity: number;
    unit_price: number;
    expiry_date: string;
    import_date: string;
    imported_by: string;
}

export interface UpdateMedicineImportData {
    remaining?: number;
}

// 📦 Lấy danh sách nhập thuốc
export async function getMedicineImports(): Promise<MedicineImport[]> {
    try {
        const res = await fetch("/api/medicine-imports", { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`Failed to fetch medicine imports: ${res.status}`);
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ getMedicineImports errors:", errorMessage);
        return [];
    }
}

// 🔍 Lấy chi tiết nhập thuốc theo ID
export async function getMedicineImportById(id: string): Promise<MedicineImport> {
    const res = await fetch(`/api/medicine-imports/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy thông tin nhập thuốc");
    return res.json();
}

// ➕ Tạo nhập thuốc mới
export async function createMedicineImport(data: CreateMedicineImportData): Promise<MedicineImport> {
    const res = await fetch("/api/medicine-imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể tạo nhập thuốc" }));
        throw new Error(error.error || "Không thể tạo nhập thuốc");
    }
    return res.json();
}

// ✏️ Cập nhật nhập thuốc
export async function updateMedicineImport(
    id: string,
    data: UpdateMedicineImportData
): Promise<MedicineImport> {
    const res = await fetch(`/api/medicine-imports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể cập nhật nhập thuốc" }));
        throw new Error(error.error || "Không thể cập nhật nhập thuốc");
    }
    return res.json();
}

// ❌ Xóa nhập thuốc (soft delete - set disabled: true)
export async function deleteMedicineImport(id: string): Promise<void> {
    const res = await fetch(`/api/medicine-imports/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể xóa nhập thuốc" }));
        throw new Error(error.error || "Không thể xóa nhập thuốc");
    }
}

// 📦 Lấy danh sách nhập thuốc đã xóa (disabled: true)
export async function getDisabledMedicineImports(): Promise<MedicineImport[]> {
    const res = await fetch("/api/medicine-imports?disabled=true", { cache: "no-store" });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể lấy danh sách nhập thuốc đã xóa" }));
        throw new Error(error.error || "Không thể lấy danh sách nhập thuốc đã xóa");
    }
    return res.json();
}

// ♻️ Khôi phục nhập thuốc (set disabled: false)
export async function restoreMedicineImport(id: string): Promise<MedicineImport> {
    const res = await fetch(`/api/medicine-imports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: false }),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể khôi phục nhập thuốc" }));
        throw new Error(error.error || "Không thể khôi phục nhập thuốc");
    }
    return res.json();
}

