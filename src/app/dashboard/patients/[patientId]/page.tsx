"use client";

import { useParams } from "next/navigation";

const patient = {
    id: 1,
    firstName: "Uzair",
    lastName: "Ahmad",
    email: "uzair@gmail.com",
    phone: "+0123456789",
    dob: "1 Jan, 1999",
    gender: "Male",
    history: [
        { department: "Cardiovascular", doctor: "Dr. Ammar", date: "12 Apr, 2025", room: "2560" },
        { department: "Cardiovascular", doctor: "Dr. Ali", date: "27 Apr, 2025", room: "2560" },
        { department: "Cardiovascular", doctor: "Dr. Khan", date: "2 Mar, 2025", room: "2560" },
    ],
};

export default function PatientDetailPage() {
    const { patientId } = useParams();

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">
                    {patient.firstName} {patient.lastName}
                </h2>

                <div className="grid grid-cols-2 gap-6">
                    {/* Patient Details */}
                    <div>
                        <h3 className="font-medium mb-2">Thông tin chi tiết</h3>
                        <div className="space-y-2">
                            <p><b>Mã:</b> {patient.id}</p>
                            <p><b>Họ :</b> {patient.firstName}</p>
                            <p><b>Tên :</b> {patient.lastName}</p>
                            <p><b>Email:</b> {patient.email}</p>
                            <p><b>Số điện thoại:</b> {patient.phone}</p>
                            <p><b>Ngày sinh:</b> {patient.dob}</p>
                            <p><b>Giới tính:</b> {patient.gender}</p>
                        </div>
                    </div>

                    {/* Admission History */}
                    <div>
                        <h3 className="font-medium mb-2">Lịch thử khám bệnh</h3>
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">Khoa</th>
                                    <th className="p-2 border">Bác sĩ</th>
                                    <th className="p-2 border">Ngày</th>
                                    <th className="p-2 border">Phòng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.history.map((h, i) => (
                                    <tr key={i}>
                                        <td className="p-2 border">{h.department}</td>
                                        <td className="p-2 border">{h.doctor}</td>
                                        <td className="p-2 border">{h.date}</td>
                                        <td className="p-2 border">{h.room}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
