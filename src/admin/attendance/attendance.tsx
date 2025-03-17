import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import AdminHeader from "@/components/admin-header";

// Define the Attendance interface
interface Attendance {
    id: string | number; // Adjust type based on your API (string or number)
    faculty_name: string;
    date: string;
    is_present: boolean;
}

export default function AttendanceRecords() {
    const [attendance, setAttendance] = useState<Attendance[]>([]); // Type the state
    const [selectedDate, setSelectedDate] = useState<string>("all");

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.get<Attendance[]>( // Type the axios response
                    `http://localhost:5000/api/attendance_records?date=${selectedDate}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }
                );
                setAttendance(response.data || []); // Fallback to empty array if data is undefined
            } catch (error) {
                console.error("Error fetching attendance records:", error);
                setAttendance([]); // Set to empty array on error
            }
        };
        fetchAttendance();
    }, [selectedDate]);

    const uniqueDates = [...new Set(attendance.map((a) => a.date))];

    const handleExportCSV = () => {
        alert("CSV export functionality would be implemented here");
    };

    return (
        <div className="flex min-h-screen flex-col">
            <AdminHeader />
            <div className="container mx-auto p-4 md:p-6 flex-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Attendance Records</CardTitle>
                            <CardDescription>View and manage faculty attendance for exams</CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleExportCSV}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center space-x-2">
                            <span className="text-sm font-medium">Date:</span>
                            <Select value={selectedDate} onValueChange={setSelectedDate}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Dates</SelectItem>
                                    {uniqueDates.map((date) => (
                                        <SelectItem key={date} value={date}>
                                            {date}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Faculty</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.length > 0 ? (
                                        attendance.map((a) => (
                                            <TableRow key={a.id}>
                                                <TableCell>{a.faculty_name}</TableCell>
                                                <TableCell>{a.date}</TableCell>
                                                <TableCell>
                                                    <Badge variant={a.is_present ? "default" : "destructive"}>
                                                        {a.is_present ? "Present" : "Absent"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">
                                                No attendance records available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}