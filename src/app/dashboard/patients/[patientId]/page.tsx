"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Input,
    Button,
    Form,
    Spin,
    message,
    Card,
    Select,
    Row,
    Col,
    Descriptions,
    Empty,
    Table,
    Space,
    Modal,
    InputNumber,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    getPatientById,
    updatePatient,
    Patient,
} from "@/lib/services/patientsService";
import {
    getMedicalRecordsByPatientId,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    MedicalRecord,
} from "@/lib/services/medicalRecordService";
import { getMedicines, Medicine } from "@/lib/services/medicinesService";

// 🔹 Hàm chuyển đổi giới tính theo backend
const mapGenderToApiValue = (gender: string) => {
    if (gender === "Nam") return "Male";
    if (gender === "Nữ") return "Female";
    return gender;
};

// 🔹 Hàm chuyển đổi giới tính từ backend sang hiển thị
const mapGenderFromApiValue = (gender: string) => {
    if (gender === "Male") return "Nam";
    if (gender === "Female") return "Nữ";
    return gender;
};

export default function PatientDetailPage() {
    const { patientId } = useParams<{ patientId: string }>();
    const router = useRouter(); 
    const [form] = Form.useForm();
    const [medicalRecordForm] = Form.useForm();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Medical Records state
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isMedicalRecordModalVisible, setIsMedicalRecordModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
    const [savingRecord, setSavingRecord] = useState(false);

    // 📦 Lấy dữ liệu bệnh nhân
    useEffect(() => {
        if (!patientId) return;

        const fetchPatient = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/patients/${patientId}`, {
                    cache: "no-store",
                });
                const data = await res.json();
                if (!res.ok)
                    throw new Error(data.error || "Không thể lấy thông tin bệnh nhân");

                // Map giới tính từ API về dạng hiển thị
                const mappedData = {
                    ...data,
                    gender: mapGenderFromApiValue(data.gender),
                    dob: data.dob ? data.dob.split("T")[0] : "",
                };

                setPatient(mappedData);
                form.setFieldsValue(mappedData);
            } catch (err) {
                console.error(err);
                message.error("Không thể tải thông tin bệnh nhân");
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [patientId, form]);

    // 📦 Lấy danh sách hồ sơ y tế
    useEffect(() => {
        if (!patientId) return;

        const fetchMedicalRecords = async () => {
            try {
                setLoadingRecords(true);
                const records = await getMedicalRecordsByPatientId(patientId);
                setMedicalRecords(records);
            } catch (err) {
                console.error(err);
                message.error("Không thể tải hồ sơ y tế");
            } finally {
                setLoadingRecords(false);
            }
        };

        fetchMedicalRecords();
    }, [patientId]);

    // 📦 Lấy danh sách thuốc
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const meds = await getMedicines();
                setMedicines(meds);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMedicines();
    }, []);

    // 📦 Lấy thông tin user hiện tại
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await fetch("/api/users/me", {
                    credentials: "include",
                    cache: "no-store",
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchCurrentUser();
    }, []);

    // Kiểm tra quyền: Receptionist và Nurse chỉ được xem, không được thêm/sửa/xóa
    const userRole = currentUser?.role?.toLowerCase() || "";
    const canManageMedicalRecords = userRole === "admin" || userRole === "doctor";

    // 🧩 Cập nhật thông tin
    const handleUpdate = async (values: Partial<Patient>) => {
        try {
            setSaving(true);

            // Chuyển đổi giới tính sang dạng backend chấp nhận
            const payload = {
                ...patient,
                ...values,
                gender: mapGenderToApiValue(values.gender || patient.gender),
                dob: values.dob || patient.dob,
            };

            const updated = await updatePatient(patientId, payload);

            // Map ngược lại khi hiển thị
            const displayData = {
                ...updated,
                gender: mapGenderFromApiValue(updated.gender),
            };

            setPatient(displayData);
            setIsEditing(false);
            message.success("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error(error);
            message.error("Cập nhật thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex justify-center items-center py-10">
                <p className="text-gray-500">Không tìm thấy bệnh nhân</p>
            </div>
        );
    }

    const formatDate = (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "—";

    const formatDateTime = (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—";

    // 🧩 Xử lý tạo/sửa hồ sơ y tế
    const handleMedicalRecordSubmit = async (values: any) => {
        try {
            setSavingRecord(true);
            
            // Kiểm tra doctor_id
            const doctorId = currentUser?.employee_id || currentUser?._id;
            if (!doctorId) {
                message.error("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.");
                return;
            }
            
            // Lọc prescriptions hợp lệ (có đầy đủ thông tin)
            const validPrescriptions = (values.prescriptions || []).filter(
                (p: any) => p.medicine_id && p.quantity && p.dosage
            );
            
            // Tạo payload, chỉ bao gồm các trường có giá trị
            const payload: any = {
                patient_id: patientId,
                doctor_id: doctorId,
                diagnosis: values.diagnosis,
            };
            
            // Chỉ thêm các trường optional nếu có giá trị
            if (values.treatment) payload.treatment = values.treatment;
            if (values.notes) payload.notes = values.notes;
            if (validPrescriptions.length > 0) payload.prescriptions = validPrescriptions;

            if (editingRecord) {
                await updateMedicalRecord(editingRecord._id, payload);
                message.success("Cập nhật hồ sơ y tế thành công!");
            } else {
                await createMedicalRecord(payload);
                message.success("Tạo hồ sơ y tế thành công!");
            }

            // Reload danh sách
            const records = await getMedicalRecordsByPatientId(patientId);
            setMedicalRecords(records);
            
            setIsMedicalRecordModalVisible(false);
            setEditingRecord(null);
            medicalRecordForm.resetFields();
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Thao tác thất bại");
        } finally {
            setSavingRecord(false);
        }
    };

    // 🧩 Mở modal tạo mới
    const handleAddMedicalRecord = () => {
        setEditingRecord(null);
        medicalRecordForm.resetFields();
        medicalRecordForm.setFieldsValue({
            prescriptions: [],
        });
        setIsMedicalRecordModalVisible(true);
    };

    // 🧩 Mở modal chỉnh sửa
    const handleEditMedicalRecord = (record: MedicalRecord) => {
        setEditingRecord(record);
        medicalRecordForm.setFieldsValue({
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            notes: record.notes,
            prescriptions: record.prescriptions.length > 0 
                ? record.prescriptions.map((p: any) => ({
                    medicine_id: typeof p.medicine_id === 'object' ? p.medicine_id._id : p.medicine_id,
                    quantity: p.quantity,
                    dosage: p.dosage,
                }))
                : [{}],
        });
        setIsMedicalRecordModalVisible(true);
    };

    // 🧩 Xóa hồ sơ y tế
    const handleDeleteMedicalRecord = async (id: string) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa hồ sơ y tế này?",
            onOk: async () => {
                try {
                    await deleteMedicalRecord(id);
                    message.success("Xóa hồ sơ y tế thành công!");
                    const records = await getMedicalRecordsByPatientId(patientId);
                    setMedicalRecords(records);
                } catch (error: any) {
                    message.error(error.message || "Xóa thất bại");
                }
            },
        });
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <Button onClick={() => router.back()} className="mb-4">
                    ← Quay lại
                </Button>
            </div>
            {/* 🔹 Nếu đang ở chế độ XEM THÔNG TIN */}
            {!isEditing && (
                <>
                    <Card
                        title="🩺 Hồ sơ bệnh nhân"
                        variant="borderless"
                        className="shadow-md rounded-2xl"
                        extra={
                            <Button
                                type="primary"
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600"
                            >
                                Chỉnh sửa
                            </Button>
                        }
                    >
                        <Descriptions bordered column={2} size="middle">
                            <Descriptions.Item label="Mã bệnh nhân">
                                {patient._id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Họ và tên">
                                {patient.fullname}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {patient.gender}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {formatDate(patient.dob)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {patient.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {patient.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {patient.address || "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {formatDate(patient.created_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật gần nhất">
                                {formatDate(patient.updated_at)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        title="🧾 Tiền sử bệnh"
                        variant="borderless"
                        className="shadow-md rounded-2xl"
                    >
                        {patient.medical_history && patient.medical_history.length > 0 ? (
                            <div className="space-y-3">
                                {patient.medical_history.map((entry: any, index: number) => (
                                    <Card
                                        key={index}
                                        type="inner"
                                        title={`Khoa: ${entry.khoa}`}
                                        className="border-l-4 border-blue-500"
                                    >
                                        <p className="text-gray-700">{entry.description}</p>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Empty description="Chưa có tiền sử bệnh" />
                        )}
                    </Card>

                    <Card
                        title="📋 Hồ sơ y tế"
                        variant="borderless"
                        className="shadow-md rounded-2xl"
                        extra={
                            canManageMedicalRecords && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddMedicalRecord}
                                    className="bg-green-600"
                                >
                                    Thêm hồ sơ y tế
                                </Button>
                            )
                        }
                    >
                        {loadingRecords ? (
                            <div className="flex justify-center py-10">
                                <Spin />
                            </div>
                        ) : medicalRecords.length > 0 ? (
                            <div className="space-y-4">
                                {medicalRecords.map((record) => (
                                    <Card
                                        key={record._id}
                                        type="inner"
                                        className="border-l-4 border-green-500"
                                        actions={
                                            canManageMedicalRecords
                                                ? [
                                                      <Button
                                                          key="edit"
                                                          type="link"
                                                          icon={<EditOutlined />}
                                                          onClick={() => handleEditMedicalRecord(record)}
                                                      >
                                                          Sửa
                                                      </Button>,
                                                      <Button
                                                          key="delete"
                                                          type="link"
                                                          danger
                                                          icon={<DeleteOutlined />}
                                                          onClick={() => handleDeleteMedicalRecord(record._id)}
                                                      >
                                                          Xóa
                                                      </Button>,
                                                  ]
                                                : undefined
                                        }
                                    >
                                        <Descriptions column={2} size="small">
                                            <Descriptions.Item label="Ngày tạo">
                                                {formatDateTime(record.created_at)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Bác sĩ">
                                                {typeof record.doctor_id === 'object' 
                                                    ? record.doctor_id.fullname 
                                                    : '—'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Chẩn đoán" span={2}>
                                                {record.diagnosis}
                                            </Descriptions.Item>
                                            {record.treatment && (
                                                <Descriptions.Item label="Điều trị" span={2}>
                                                    {record.treatment}
                                                </Descriptions.Item>
                                            )}
                                            {record.notes && (
                                                <Descriptions.Item label="Ghi chú" span={2}>
                                                    {record.notes}
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>
                                        
                                        {record.prescriptions && record.prescriptions.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold mb-2">Toa thuốc:</h4>
                                                <Table
                                                    dataSource={record.prescriptions.map((p: any, idx: number) => ({
                                                        key: idx,
                                                        medicine: typeof p.medicine_id === 'object' 
                                                            ? p.medicine_id.name 
                                                            : '—',
                                                        unit: typeof p.medicine_id === 'object' 
                                                            ? p.medicine_id.unit 
                                                            : '—',
                                                        quantity: p.quantity,
                                                        dosage: p.dosage,
                                                    }))}
                                                    columns={[
                                                        { title: "Thuốc", dataIndex: "medicine", key: "medicine" },
                                                        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                                                        { title: "Đơn vị", dataIndex: "unit", key: "unit" },
                                                        { title: "Liều dùng", dataIndex: "dosage", key: "dosage" },
                                                    ]}
                                                    pagination={false}
                                                    size="small"
                                                />
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Empty description="Chưa có hồ sơ y tế" />
                        )}
                    </Card>
                </>
            )}

            {/* 🔹 Nếu đang ở chế độ CHỈNH SỬA */}
            {isEditing && (
                <Card
                    title="📝 Chỉnh sửa thông tin bệnh nhân"
                    variant="borderless"
                    className="shadow-md rounded-2xl"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        className="mt-4"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Họ và tên"
                                    name="fullname"
                                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                >
                                    <Input placeholder="Nhập họ và tên" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Ngày sinh" name="dob">
                                    <Input type="date" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Giới tính"
                                    name="gender"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn giới tính" },
                                    ]}
                                >
                                    <Select placeholder="Chọn giới tính">
                                        <Select.Option value="Nam">Nam</Select.Option>
                                        <Select.Option value="Nữ">Nữ</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Số điện thoại" name="phone">
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Email" name="email">
                                    <Input type="email" placeholder="example@email.com" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Địa chỉ" name="address">
                                    <Input placeholder="Nhập địa chỉ" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saving}
                                className="bg-blue-600"
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </Form>
                </Card>
            )}

            {/* Modal tạo/sửa hồ sơ y tế */}
            <Modal
                title={editingRecord ? "Chỉnh sửa hồ sơ y tế" : "Thêm hồ sơ y tế mới"}
                open={isMedicalRecordModalVisible}
                onCancel={() => {
                    setIsMedicalRecordModalVisible(false);
                    setEditingRecord(null);
                    medicalRecordForm.resetFields();
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={medicalRecordForm}
                    layout="vertical"
                    onFinish={handleMedicalRecordSubmit}
                >
                    <Form.Item
                        label="Chẩn đoán"
                        name="diagnosis"
                        rules={[{ required: true, message: "Vui lòng nhập chẩn đoán" }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập chẩn đoán" />
                    </Form.Item>

                    <Form.Item
                        label="Điều trị"
                        name="treatment"
                    >
                        <Input.TextArea rows={3} placeholder="Nhập phương pháp điều trị" />
                    </Form.Item>

                    <Form.Item
                        label="Ghi chú"
                        name="notes"
                    >
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
                    </Form.Item>

                    <Form.Item label="Toa thuốc">
                        <Form.List name="prescriptions">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} gutter={16} className="mb-2">
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "medicine_id"]}
                                                    rules={[{ required: true, message: "Chọn thuốc" }]}
                                                >
                                                    <Select placeholder="Chọn thuốc" showSearch>
                                                        {medicines.map((med) => (
                                                            <Select.Option key={med._id} value={med._id}>
                                                                {med.name} ({med.unit})
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "quantity"]}
                                                    rules={[{ required: true, message: "Nhập số lượng" }]}
                                                >
                                                    <InputNumber
                                                        placeholder="Số lượng"
                                                        min={1}
                                                        style={{ width: "100%" }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={9}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "dosage"]}
                                                    rules={[{ required: true, message: "Nhập liều dùng" }]}
                                                >
                                                    <Input placeholder="Liều dùng (ví dụ: 2 lần/ngày)" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={() => remove(name)}
                                                >
                                                    Xóa
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Thêm thuốc
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            onClick={() => {
                                setIsMedicalRecordModalVisible(false);
                                setEditingRecord(null);
                                medicalRecordForm.resetFields();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={savingRecord}
                            className="bg-green-600"
                        >
                            {editingRecord ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
