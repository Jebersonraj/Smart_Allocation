import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Download } from "lucide-react";

interface FacultyAttendance {
    id: number;
    faculty_id: number;
    faculty_name: string;
    rfid_tag: string;
    date: string;
    is_present: boolean;
}

export default function RFIDAttendance() {
    const [rfidTag, setRfidTag] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [facultyList, setFacultyList] = useState<FacultyAttendance[]>([]);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "">("");
    const today = new Date().toISOString().split('T')[0];

    const fetchFacultyAttendance = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/attendance_records?date=${today}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setFacultyList(response.data);
            setLastUpdated(Date.now());
        } catch (error) {
            console.error("Error fetching attendance:", error);
            setStatus("error");
            setMessage("Failed to fetch attendance records");
        }
    }, [today]);

    useEffect(() => {
        fetchFacultyAttendance();
        const interval = setInterval(fetchFacultyAttendance, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, [fetchFacultyAttendance]);

    const handleScanRFID = async () => {
        if (!rfidTag.trim() || !/^\d{10}$/.test(rfidTag)) {
            setStatus("error");
            setMessage("Please enter a valid 10-digit RFID tag");
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/attendance',
                { rfid_tag: rfidTag, date: today },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setStatus("success");
            setMessage(response.data.message);
            await fetchFacultyAttendance();
        } catch (error: any) {
            setStatus("error");
            setMessage(error.response?.data?.message || "Failed to mark attendance");
        } finally {
            setTimeout(() => {
                setStatus("idle");
                setMessage("");
                setRfidTag("");
            }, 3000);
        }
    };

    const handleManualAttendance = async (facultyId: number) => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/attendance',
                { date: today },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setStatus("success");
            setMessage(response.data.message);
            await fetchFacultyAttendance();
        } catch (error: any) {
            setStatus("error");
            setMessage(error.response?.data?.message || "Failed to mark attendance");
        }
    };

    const handleExport = async () => {
        if (!exportFormat) return;
        try {
            const response = await axios.get(
                `http://localhost:5000/api/attendance_records?date=${today}&export=${exportFormat}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    responseType: 'blob'
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${today}.${exportFormat}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export error:", error);
            setStatus("error");
            setMessage("Failed to export attendance");
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && rfidTag.trim()) {
                handleScanRFID();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [rfidTag]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Attendance System - {today}</CardTitle>
                    <CardDescription>Mark attendance using RFID or manually</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-2">
                            <Select value={exportFormat} onValueChange={setExportFormat}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Export as" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleExport} disabled={!exportFormat}>
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                        </div>
                    </div>

                    {status === "success" && (
                        <Alert className="bg-green-50 text-green-800 border-green-200">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                    {status === "error" && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <img src="/rfid-icon.png" alt="RFID Scanner" className="h-32 w-32" />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Scan or enter 10-digit RFID Tag"
                                value={rfidTag}
                                onChange={(e) => setRfidTag(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleScanRFID}>
                                Mark RFID Attendance
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Faculty Name</TableHead>
                                    <TableHead>RFID Tag</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {facultyList.map((faculty) => (
                                    <TableRow key={faculty.id}>
                                        <TableCell>{faculty.faculty_name}</TableCell>
                                        <TableCell>{faculty.rfid_tag || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant={faculty.is_present ? "default" : "destructive"}>
                                                {faculty.is_present ? "Present" : "Absent"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {!faculty.is_present && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleManualAttendance(faculty.faculty_id)}
                                                >
                                                    Mark Manual
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}