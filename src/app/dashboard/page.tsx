import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Menu, Search } from "lucide-react";

const data = [
    { name: "5k", uv: 30 },
    { name: "10k", uv: 45 },
    { name: "15k", uv: 35 },
    { name: "20k", uv: 65 },
    { name: "25k", uv: 50 },
    { name: "30k", uv: 40 },
    { name: "35k", uv: 55 },
    { name: "40k", uv: 20 },
    { name: "45k", uv: 60 },
    { name: "50k", uv: 55 },
    { name: "55k", uv: 52 },
    { name: "60k", uv: 48 },
];

export default function Dashboard() {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                {/* Dashboard content */}
                <main className="flex-1 p-6 overflow-y-auto space-y-6">
                    {/* Top stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="text-sm text-gray-500">Total User</h2>
                                <p className="text-2xl font-bold">40,689</p>
                                <span className="text-green-500 text-sm">↑ 8.5% Up from yesterday</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="text-sm text-gray-500">Total Order</h2>
                                <p className="text-2xl font-bold">10,293</p>
                                <span className="text-green-500 text-sm">↑ 1.3% Up from past week</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="text-sm text-gray-500">Total Sales</h2>
                                <p className="text-2xl font-bold">$89,000</p>
                                <span className="text-red-500 text-sm">↓ 4.3% Down from yesterday</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="text-sm text-gray-500">Total Pending</h2>
                                <p className="text-2xl font-bold">2,040</p>
                                <span className="text-green-500 text-sm">↑ 1.8% Up from yesterday</span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sales Details */}

                    {/* Deals Details */}
                    <Card>
                        <CardContent className="p-4">
                            <h2 className="font-semibold mb-4">Deals Details</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b text-gray-500 text-sm">
                                            <th className="py-2">Product Name</th>
                                            <th>Location</th>
                                            <th>Date - Time</th>
                                            <th>Piece</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-2 flex items-center gap-2">
                                                <Image
                                                    src="/favicon.ico"
                                                    alt="Moni Roy"
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                                Apple Watch
                                            </td>
                                            <td>6096 Marjoline Landing</td>
                                            <td>12.09.2019 - 12:53 PM</td>
                                            <td>423</td>
                                            <td>$34,295</td>
                                            <td>
                                                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                                                    Delivered
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}