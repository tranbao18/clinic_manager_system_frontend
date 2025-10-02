"use client";

import { useEffect, useState } from "react";
import { Layout, Button, message, Spin } from "antd";
import DoctorForm from "@/components/doctor/DoctorForm";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchDoctorById } from "@/store/Slice/doctorSlice";
import { updateDoctor } from "@/lib/services/doctorService";

const { Content } = Layout;

export default function DoctorEditPage() {
    const [submitting, setSubmitting] = useState(false); // 👈 đổi tên
    const router = useRouter();
    const { doctorId } = useParams(); // lấy id từ URL

    const dispatch = useDispatch<AppDispatch>();
    const { currentDoctor: doctor, loading } = useSelector(
        (state: RootState) => state.doctors
    );

    useEffect(() => {
        if (doctorId) {
            dispatch(fetchDoctorById(doctorId as string));
        }
    }, [doctorId, dispatch]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="text-center py-10">
                <p>Không tìm thấy bác sĩ</p>
                <Button className="mt-4" onClick={() => router.back()}>Quay lại</Button>
            </div>
        );
    }

    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true); // 👈 đổi theo tên mới
            const payload = {
                ...values,
                id: doctorId,
                birthdate: values.birthdate ? values.birthdate.format("YYYY-MM-DD") : null,
                avatar: values.avatar?.[0]?.thumbUrl || values.avatar?.[0]?.url || "",
            };

            await updateDoctor(doctorId as string, payload);
            message.success("Cập nhật bác sĩ thành công");
            router.push("/dashboard/doctors");
        } catch (err) {
            message.error("Lỗi khi cập nhật bác sĩ");
        } finally {
            setSubmitting(false); // 👈
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Content className="m-4 p-6 bg-white rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Chỉnh sửa Bác sĩ</h2>
                    <Button onClick={() => router.back()}>Quay lại</Button>
                </div>

                <DoctorForm
                    onFinish={handleSubmit}
                    loading={submitting} // 👈 dùng submitting cho form
                    initialValues={doctor}
                />
            </Content>
        </Layout>
    );
}
