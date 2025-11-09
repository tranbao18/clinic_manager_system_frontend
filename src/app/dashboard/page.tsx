"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock, Calendar, Heart, Sparkles } from "lucide-react";
import UsersService from "@/lib/services/usersService";

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

// Fallback quote in case API fails
const fallbackQuote = {
    text: "Mỗi ngày là cơ hội mới để làm cho cuộc sống tốt đẹp hơn.",
    author: "Khuyết danh",
};

// Role names in Vietnamese
const roleNames: { [key: string]: string } = {
    doctor: "Bác sĩ",
    nurse: "Y tá",
    receptionist: "Lễ tân",
    accountant: "Kế toán",
    admin: "Quản trị viên",
};

interface Quote {
    text: string;
    author: string;
}

export default function Dashboard() {
    const [role, setRole] = useState<string>("");
    const [employeeName, setEmployeeName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentQuote, setCurrentQuote] = useState<Quote>(fallbackQuote);

    // Fetch user role and employee name
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Use /api/users/me to get user info (same as profile page)
                const meRes = await fetch("/api/users/me", {
                    credentials: "include",
                    cache: "no-store",
                });
                
                if (!meRes.ok) {
                    throw new Error("Chưa đăng nhập");
                }
                
                const me = await meRes.json();
                const userRole = (me?.role || "").toLowerCase();
                setRole(userRole);

                // Fetch employee name using userId
                const userId = me.id || me._id;
                if (userId) {
                    try {
                        console.log("Fetching employee data for userId:", userId);
                        const userData = await UsersService.getByUserId(userId);
                        console.log("User data received:", userData);
                        
                        if (userData?.employee?.fullname) {
                            setEmployeeName(userData.employee.fullname);
                            console.log("Employee name set to:", userData.employee.fullname);
                        } else if (me?.username) {
                            setEmployeeName(me.username);
                            console.log("Using username as fallback:", me.username);
                        }
                    } catch (err) {
                        console.error("Error fetching employee data:", err);
                        // Fallback to username if employee fetch fails
                        if (me?.username) {
                            setEmployeeName(me.username);
                        }
                    }
                } else if (me?.username) {
                    setEmployeeName(me.username);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // Fetch quote from API
    const fetchQuote = async () => {
        try {
            // Using quotable.io API - free, no auth required
            const response = await fetch("https://api.quotable.io/random", {
                cache: "no-store",
            });
            
            console.log("Quote API response status:", response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log("Quote data received:", data);
                setCurrentQuote({
                    text: data.content || data.quote || fallbackQuote.text,
                    author: data.author || data.authorName || "Unknown",
                });
            } else {
                const errorText = await response.text();
                console.error("Quote API error response:", errorText);
                throw new Error("Failed to fetch quote");
            }
        } catch (error) {
            console.error("Error fetching quote from API:", error);
            // Use fallback quote if API fails
            setCurrentQuote(fallbackQuote);
        }
    };

    // Fetch quote on mount and every 30 seconds
    useEffect(() => {
        if (!loading && role !== "admin") {
            fetchQuote();
            const quoteTimer = setInterval(() => {
                fetchQuote();
            }, 30000); // Update every 30 seconds

            return () => clearInterval(quoteTimer);
        }
    }, [loading, role]);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        const days = [
            "Chủ Nhật",
            "Thứ Hai",
            "Thứ Ba",
            "Thứ Tư",
            "Thứ Năm",
            "Thứ Sáu",
            "Thứ Bảy",
        ];
        const months = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
        ];

        const day = days[date.getDay()];
        const dayNum = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day}, ${dayNum} ${month} ${year}`;
    };

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Chào buổi sáng";
        if (hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    const isAdmin = role === "admin";

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-6 overflow-y-auto space-y-6">
                    {isAdmin ? (
                        // Admin view: Show statistics
                        <>
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
                        </>
                    ) : (
                        // Non-admin view: Show welcome, date/time, and quotes
                        <div className="space-y-6">
                            {/* Welcome Card */}
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <Heart className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-800">
                                                {getGreeting()}, {employeeName || "bạn"}!
                                            </h1>
                                            <p className="text-lg text-gray-600">
                                                {roleNames[role] || "Nhân viên"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-lg">
                                        Chúc bạn có một ngày làm việc hiệu quả và tràn đầy năng lượng!
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Date and Time Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                            <h2 className="text-xl font-semibold text-gray-700">Ngày</h2>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatDate(currentTime)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Clock className="w-6 h-6 text-green-600" />
                                            <h2 className="text-xl font-semibold text-gray-700">Giờ</h2>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-800 font-mono">
                                            {formatTime(currentTime)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quote Card */}
                            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                                <CardContent className="p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-purple-100 rounded-full mt-1">
                                            <Sparkles className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                                Câu nói truyền cảm hứng
                                            </h2>
                                            <blockquote className="text-lg text-gray-800 italic mb-4 leading-relaxed">
                                                "{currentQuote.text}"
                                            </blockquote>
                                            <p className="text-sm text-gray-600 text-right">
                                                — {currentQuote.author}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}