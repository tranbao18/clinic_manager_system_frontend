"use client";

import { useEffect, useState } from "react";
import { Layout, Button, message, Spin, Modal } from "antd";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchDoctorById } from "@/store/Slice/doctorSlice";
import { updateDoctor } from "@/lib/services/doctorService";
import DoctorForm from "@/components/doctor/DoctorForm";

const { Content } = Layout;

export default function DoctorDetailPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const router = useRouter();
    const { doctorId } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { currentDoctor: doctor, loading } = useSelector(
        (state: RootState) => state.doctors
    );

    useEffect(() => {
        if (doctorId) dispatch(fetchDoctorById(doctorId as string));
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
                <Button className="mt-4" onClick={() => router.back()}>
                    Quay lại
                </Button>
            </div>
        );
    }

    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);
            const payload = {
                ...values,
                id: doctorId,
                birthdate: values.birthdate
                    ? values.birthdate.format("YYYY-MM-DD")
                    : null,
                avatar:
                    values.avatar?.[0]?.thumbUrl || values.avatar?.[0]?.url || "",
            };

            await updateDoctor(doctorId as string, payload);
            dispatch(fetchDoctorById(doctorId as string)); // refresh lại data
            setIsEditing(false); // quay về chế độ xem
            setTimeout(() => {
                Modal.success({
                    title: "Thành công",
                    content: "Thông tin bác sĩ đã được cập nhật thành công!",
                    okText: "Đóng",
                });
            }, 100);
        } catch (err) {
            message.error("Lỗi khi cập nhật bác sĩ");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Content className="m-4 p-6 bg-white rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        Chi tiết bác sĩ {doctor?.name}
                    </h2>
                    <div className="flex gap-2">
                        <Button onClick={() => router.back()}>Quay lại</Button>
                        {!isEditing ? (
                            <Button type="primary" onClick={() => setIsEditing(true)}>
                                Chỉnh sửa
                            </Button>
                        ) : (
                            <Button onClick={() => setIsEditing(false)}>Hủy chỉnh sửa</Button>
                        )}
                    </div>
                </div>

                <DoctorForm
                    onFinish={handleSubmit}
                    loading={submitting}
                    initialValues={doctor}
                    disabled={!isEditing} // 👈 quan trọng
                />

                {isEditing && (
                    <div className="text-right mt-6">
                        <Button
                            type="primary"
                            loading={submitting}
                            onClick={() => {
                                const form = document.getElementById("doctor-form") as HTMLFormElement;
                                if (form) form.requestSubmit();
                            }}
                        >
                            Cập nhật
                        </Button>
                    </div>
                )}
            </Content>
        </Layout>
    );
}
