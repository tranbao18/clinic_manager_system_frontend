"use client";

import { Layout, Table, Button } from "antd";
const { Content } = Layout;

const patientData = [
    {
        key: "1",
        id: 1,
        name: "Uzair",
        phone: "+0123456789",
        email: "uzair@gmail.com",
        dob: "1/Jan/1999",
        gender: "Male",
        role: "Doctor",
    },
    {
        key: "2",
        id: 2,
        name: "Haris",
        phone: "+0123456789",
        email: "haris@gmail.com",
        dob: "1/Dec/1991",
        gender: "Male",
        role: "Nurse",
    },
    {
        key: "3",
        id: 3,
        name: "Hamza",
        phone: "+0123456789",
        email: "hamza@gmail.com",
        dob: "1/Jan/2001",
        gender: "Male",
        role: "Nurse",
    },
];

const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Name", dataIndex: "name" },
    { title: "Phone Number", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    { title: "Date of Birth", dataIndex: "dob" },
    { title: "Gender", dataIndex: "gender" },
    { title: "Role", dataIndex: "role" },
    {
        title: "Action",
        render: () => (
            <div className="flex gap-2">
                <Button type="link">Edit</Button>
                <Button danger type="link">Delete</Button>
            </div>
        ),
    },
];

export default function EmployeesPage() {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout>
                <Content className="m-4 p-4 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Danh sách nhân viên</h2>
                        <Button type="primary">Thêm nhân viên</Button>
                    </div>
                    <Table columns={columns} dataSource={patientData} pagination={false} />
                </Content>
            </Layout>
        </Layout>
    );
}
