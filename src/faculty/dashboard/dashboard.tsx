import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Allocation {
    allocation_id: string | number;
    faculty_id: string | number;
    venue_name: string;
    date: string;
    time_slot: string;
    is_present: boolean;
    rfid_tag?: string;
}

interface User {
    id: string | number;
    name: string;
    rfid_tag?: string;
}

export default function FacultyDashboard() {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const initializeData = async () => {
            await fetchUserData();
            await fetchAllocations();
        };
        initializeData();
    }, [navigate]);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const fetchUserData = async () => {
        try {
            const response = await axios.get<User>("http://localhost:5000/api/current_user", getAuthHeaders());
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
            navigate("/login");
        }
    };

    const fetchAllocations = async () => {
        try {
            const response = await axios.get<Allocation[]>("http://localhost:5000/api/allocations", getAuthHeaders());
            setAllocations(response.data);
        } catch (error) {
            console.error("Error fetching allocations:", error);
            setAllocations([]);
        }
    };

    const handleMarkAttendance = async (allocation: Allocation) => {
        try {
            await axios.post(
                "http://localhost:5000/api/attendance",
                { date: allocation.date, allocation_id: allocation.allocation_id },
                getAuthHeaders()
            );
            await fetchAllocations(); // Refresh allocations
        } catch (error) {
            console.error("Error marking attendance:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/logout", {}, getAuthHeaders());
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAdmin");
            navigate("/");
        }
    };

    const getStatus = (alloc: Allocation) => {
        const allocDate = new Date(alloc.date);
        const todayDate = new Date(today);
        if (alloc.is_present) return "Completed";
        if (allocDate > todayDate) return "Yet to Do";
        if (allocDate.toDateString() === todayDate.toDateString()) return "Ongoing";
        return "Missed";
    };

    const upcomingAllocation = allocations
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .find((alloc) => {
            const allocDate = new Date(alloc.date);
            return allocDate >= new Date(today) && !alloc.is_present;
        }) || allocations[0];

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <header className="bg-primary py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Welcome, {user?.name || "Faculty"}</h1>
                    <Button variant="ghost" onClick={handleLogout} className="text-white">
                        <LogOut className="mr- TYP2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </header>
            <div className="container mx-auto p-6 flex-1 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Key information at a glance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {user?.name || "Loading..."}</p>
                            <p><strong>RFID Tag:</strong> {user?.rfid_tag || "Not Assigned"}</p>
                        </div>
                    </CardContent>
                </Card>

                {upcomingAllocation && (
                    <Card className={`shadow-lg ${getStatus(upcomingAllocation) === "Completed" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
                        <CardHeader>
                            <CardTitle>Upcoming Duty</CardTitle>
                            <CardDescription>Your next scheduled exam venue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p><strong>Venue:</strong> {upcomingAllocation.venue_name}</p>
                                <p><strong>Date:</strong> {upcomingAllocation.date}</p>
                                <p><strong>Time:</strong> {upcomingAllocation.time_slot}</p>
                                <p><strong>Status:</strong>
                                    <Badge variant={upcomingAllocation.is_present ? "default" : "outline"}>
                                        {getStatus(upcomingAllocation)}
                                    </Badge>
                                </p>
                                {getStatus(upcomingAllocation) === "Ongoing" && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleMarkAttendance(upcomingAllocation)}
                                        className="mt-2"
                                    >
                                        <Calendar className="mr-2 h-4 w-4" /> Mark Present
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>All Your Allocations</CardTitle>
                        <CardDescription>View your past and future duties</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Venue</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allocations.length > 0 ? (
                                    allocations.map((alloc) => {
                                        const status = getStatus(alloc);
                                        const isActionable = status === "Ongoing";
                                        return (
                                            <TableRow key={alloc.allocation_id}>
                                                <TableCell>{alloc.venue_name}</TableCell>
                                                <TableCell>{alloc.date}</TableCell>
                                                <TableCell>{alloc.time_slot}</TableCell>
                                                <TableCell>
                                                    <Badge variant={alloc.is_present ? "default" : "outline"}>
                                                        {status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {isActionable && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleMarkAttendance(alloc)}
                                                        >
                                                            Mark Present
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No allocations available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}