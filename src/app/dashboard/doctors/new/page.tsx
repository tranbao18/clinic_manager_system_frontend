"use client";

import { useState } from "react";
import { Layout, Button, message, Spin } from "antd";
import { createDoctor } from "@/lib/services/doctorService";
import DoctorForm from "@/components/doctor/DoctorForm";
import { useRouter } from "next/navigation";

const { Content } = Layout;

export default function DoctorFormPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                birthdate: values.birthdate ? values.birthdate.format("YYYY-MM-DD") : null,
                // Upload trả về fileList → lấy thumbUrl hoặc cho nhập link avatar
                avatar: values.avatar?.[0]?.thumbUrl || values.avatar?.[0]?.url || ""
            };
            await createDoctor(payload);
            message.success("Thêm bác sĩ thành công");
            router.push("/dashboard/doctors");
        } catch (err) {
            message.error("Lỗi khi thêm bác sĩ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Content className="m-4 p-6 bg-white rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Thêm Bác sĩ</h2>
                    <Button onClick={() => router.back()}>Quay lại</Button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Spin size="large" />
                    </div>
                ) : (
                    <DoctorForm onFinish={handleSubmit} loading={loading} />
                )}
            </Content>
        </Layout>
    );
}
