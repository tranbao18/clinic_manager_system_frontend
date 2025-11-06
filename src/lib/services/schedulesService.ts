// src/lib/services/schedulesService.ts

export interface ShiftSchedule {
    employee_id: string;
    employee_name: string;
    shift_schedule: any; // Mixed type - có thể là object, array, hoặc bất kỳ cấu trúc nào
}

export interface CreateScheduleInput {
    employee_id: string;
    shift_schedule: any;
}

async function getAuthHeaderClient() {
    try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = await res.json();
        const token = data?.user?.token;
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
    } catch {
        return {};
    }
}

const SchedulesService = {
    // Lấy tất cả lịch trực (Admin: tất cả, Others: chỉ lịch trực của mình)
    async getAll(): Promise<ShiftSchedule[]> {
        try {
            const headers = await getAuthHeaderClient();
            const res = await fetch("/api/schedules", {
                cache: "no-store",
                headers,
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch schedules: ${res.status}`);
            }

            const data = await res.json();
            return Array.isArray(data) ? data : [data];
        } catch (error: any) {
            console.error("❌ getSchedules errors:", error?.message || error);
            return [];
        }
    },

    // Lấy lịch trực của một nhân viên cụ thể
    async getByEmployeeId(employee_id: string): Promise<ShiftSchedule | null> {
        try {
            const headers = await getAuthHeaderClient();
            const res = await fetch(`/api/schedules/${employee_id}`, {
                cache: "no-store",
                headers,
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch schedule: ${res.status}`);
            }

            const data = await res.json();
            return Array.isArray(data) ? data[0] : data;
        } catch (error: any) {
            console.error("❌ getScheduleByEmployeeId errors:", error?.message || error);
            return null;
        }
    },

    // Tạo/cập nhật lịch trực (chỉ Admin)
    async create(input: CreateScheduleInput): Promise<ShiftSchedule> {
        try {
            const headers = await getAuthHeaderClient();
            const res = await fetch("/api/schedules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
                body: JSON.stringify(input),
                cache: "no-store",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Failed to create schedule: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("❌ createSchedule errors:", error?.message || error);
            throw error;
        }
    },

    // Cập nhật lịch trực (chỉ Admin)
    async update(employee_id: string, shift_schedule: any): Promise<ShiftSchedule> {
        try {
            const headers = await getAuthHeaderClient();
            const res = await fetch(`/api/schedules/${employee_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
                body: JSON.stringify({ shift_schedule }),
                cache: "no-store",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Failed to update schedule: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("❌ updateSchedule errors:", error?.message || error);
            throw error;
        }
    },

    // Xóa lịch trực (chỉ Admin)
    async delete(employee_id: string): Promise<void> {
        try {
            const headers = await getAuthHeaderClient();
            const res = await fetch(`/api/schedules/${employee_id}`, {
                method: "DELETE",
                headers,
                cache: "no-store",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Failed to delete schedule: ${res.status}`);
            }
        } catch (error: any) {
            console.error("❌ deleteSchedule errors:", error?.message || error);
            throw error;
        }
    },
};

export default SchedulesService;

