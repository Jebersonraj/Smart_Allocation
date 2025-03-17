import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import AdminHeader from "@/components/admin-header";

export default function AttendanceRecords() {
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState("all");

    useEffect(() => {
        const fetchAttendance = async () => {
            const response = await axios.get(`http://localhost:5000/api/attendance_records?date=${selectedDate}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAttendance(response.data);
        };
        fetchAttendance();
    }, [selectedDate]);

    const uniqueDates = [...new Set(attendance.map(a => a.date))];

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
                                        <SelectItem key={date} value={date}>{date}</SelectItem>
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
                                    {attendance.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell>{a.faculty_name}</TableCell>
                                            <TableCell>{a.date}</TableCell>
                                            <TableCell>
                                                <Badge variant={a.is_present ? "default" : "destructive"}>
                                                    {a.is_present ? "Present" : "Absent"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}