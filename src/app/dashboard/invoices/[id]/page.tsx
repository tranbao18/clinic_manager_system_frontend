"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Button,
    Form,
    Spin,
    message,
    Card,
    Row,
    Col,
    Descriptions,
    Table,
    Space,
    Modal,
    InputNumber,
    Select,
    DatePicker,
    Tag,
    Typography,
    Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    getInvoiceById,
    updateInvoiceStatus,
    Invoice,
} from "@/lib/services/invoiceService";
import {
    getPaymentsByInvoiceId,
    createPayment,
    deletePayment,
    Payment,
} from "@/lib/services/paymentService";

const { Title, Text } = Typography;
const { Option } = Select;

const getStatusColor = (status: string) => {
    switch (status) {
        case "Paid":
            return "green";
        case "Partial":
            return "orange";
        case "Unpaid":
            return "red";
        default:
            return "default";
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case "Paid":
            return "Đã thanh toán";
        case "Partial":
            return "Thanh toán một phần";
        case "Unpaid":
            return "Chưa thanh toán";
        default:
            return status;
    }
};

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [paymentForm] = Form.useForm();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [creatingPayment, setCreatingPayment] = useState(false);

    const fetchInvoice = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getInvoiceById(id);
            setInvoice(data);
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Không thể tải thông tin hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        if (!id) return;
        try {
            setLoadingPayments(true);
            const data = await getPaymentsByInvoiceId(id);
            setPayments(data);
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Không thể tải danh sách thanh toán");
        } finally {
            setLoadingPayments(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
        fetchPayments();
    }, [id]);

    const handleCreatePayment = async (values: any) => {
        if (!id) return;
        try {
            setCreatingPayment(true);
            await createPayment({
                invoice_id: id,
                method: values.method,
                amount: values.amount,
                date: values.date.format("YYYY-MM-DD"),
            });
            message.success("Tạo thanh toán thành công");
            setIsPaymentModalVisible(false);
            paymentForm.resetFields();
            await fetchPayments();
            await fetchInvoice(); // Refresh để cập nhật status
        } catch (error: any) {
            message.error(error.message || "Không thể tạo thanh toán");
        } finally {
            setCreatingPayment(false);
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        try {
            await deletePayment(paymentId);
            message.success("Xóa thanh toán thành công");
            await fetchPayments();
            await fetchInvoice(); // Refresh để cập nhật status
        } catch (error: any) {
            message.error(error.message || "Không thể xóa thanh toán");
        }
    };

    const handleUpdateStatus = async () => {
        if (!id) return;
        try {
            await updateInvoiceStatus(id);
            message.success("Cập nhật trạng thái thành công");
            await fetchInvoice();
        } catch (error: any) {
            message.error(error.message || "Không thể cập nhật trạng thái");
        }
    };

    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remaining = (invoice?.total_amount || 0) - totalPaid;

    const paymentColumns = [
        {
            title: "Ngày thanh toán",
            dataIndex: "date",
            key: "date",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Phương thức",
            dataIndex: "method",
            key: "method",
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number) => (
                <Text strong>{amount?.toLocaleString("vi-VN")} đ</Text>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: Payment) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeletePayment(record._id)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ padding: "24px", textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div style={{ padding: "24px" }}>
                <Card>
                    <Empty description="Không tìm thấy hóa đơn" />
                </Card>
            </div>
        );
    }

    const patient = typeof invoice.patient_id === 'object' ? invoice.patient_id : null;
    const appointment = typeof invoice.appointment_id === 'object' ? invoice.appointment_id : null;

    return (
        <div style={{ padding: "24px" }}>
            <Space style={{ marginBottom: "16px" }}>
                <Button onClick={() => router.push("/dashboard/invoices")}>
                    ← Quay lại
                </Button>
            </Space>

            <Title level={2}>Chi tiết Hóa đơn</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Thông tin Hóa đơn" style={{ marginBottom: "16px" }}>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Mã hóa đơn">
                                <Text copyable={{ text: invoice._id }}>{invoice._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Bệnh nhân">
                                {patient?.fullname || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày khám">
                                {appointment?.appointment_date
                                    ? dayjs(appointment.appointment_date).format("DD/MM/YYYY")
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
                                    {invoice.total_amount?.toLocaleString("vi-VN")} đ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đã thanh toán">
                                <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                                    {totalPaid.toLocaleString("vi-VN")} đ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Còn lại">
                                <Text strong style={{ fontSize: "16px", color: remaining > 0 ? "#ff4d4f" : "#52c41a" }}>
                                    {remaining.toLocaleString("vi-VN")} đ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getStatusColor(invoice.status)}>
                                    {getStatusText(invoice.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(invoice.created_at).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        title="Lịch sử Thanh toán"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsPaymentModalVisible(true)}
                                disabled={remaining <= 0}
                            >
                                Thêm thanh toán
                            </Button>
                        }
                    >
                        <Table
                            columns={paymentColumns}
                            dataSource={payments}
                            rowKey="_id"
                            loading={loadingPayments}
                            pagination={false}
                            locale={{ emptyText: "Chưa có thanh toán nào" }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Tóm tắt">
                        <Space direction="vertical" style={{ width: "100%" }} size="large">
                            <div>
                                <Text type="secondary">Tổng tiền:</Text>
                                <br />
                                <Title level={4} style={{ margin: 0 }}>
                                    {invoice.total_amount?.toLocaleString("vi-VN")} đ
                                </Title>
                            </div>
                            <Divider />
                            <div>
                                <Text type="secondary">Đã thanh toán:</Text>
                                <br />
                                <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
                                    {totalPaid.toLocaleString("vi-VN")} đ
                                </Title>
                            </div>
                            <Divider />
                            <div>
                                <Text type="secondary">Còn lại:</Text>
                                <br />
                                <Title level={4} style={{ margin: 0, color: remaining > 0 ? "#ff4d4f" : "#52c41a" }}>
                                    {remaining.toLocaleString("vi-VN")} đ
                                </Title>
                            </div>
                            <Divider />
                            <Button
                                type="default"
                                block
                                onClick={handleUpdateStatus}
                            >
                                Cập nhật trạng thái
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Thêm Thanh toán"
                open={isPaymentModalVisible}
                onCancel={() => {
                    setIsPaymentModalVisible(false);
                    paymentForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={paymentForm}
                    layout="vertical"
                    onFinish={handleCreatePayment}
                >
                    <Form.Item
                        name="method"
                        label="Phương thức thanh toán"
                        rules={[{ required: true, message: "Vui lòng chọn phương thức" }]}
                    >
                        <Select placeholder="Chọn phương thức">
                            <Option value="Cash">Tiền mặt</Option>
                            <Option value="Bank Transfer">Chuyển khoản</Option>
                            <Option value="Credit Card">Thẻ tín dụng</Option>
                            <Option value="Other">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Số tiền"
                        rules={[
                            { required: true, message: "Vui lòng nhập số tiền" },
                            {
                                type: "number",
                                min: 1,
                                message: "Số tiền phải lớn hơn 0",
                            },
                            {
                                validator: (_, value) => {
                                    if (value && value > remaining) {
                                        return Promise.reject(
                                            new Error(`Số tiền không được vượt quá ${remaining.toLocaleString("vi-VN")} đ`)
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập số tiền"
                            max={remaining}
                        />
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Ngày thanh toán"
                        rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                        initialValue={dayjs()}
                    >
                        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creatingPayment}
                            >
                                Tạo thanh toán
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsPaymentModalVisible(false);
                                    paymentForm.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

