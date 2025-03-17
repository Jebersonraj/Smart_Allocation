import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

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
        const interval = setInterval(fetchFacultyAttendance, 30000);
        return () => clearInterval(interval);
    }, [fetchFacultyAttendance]);

    const handleScanRFID = async () => {
        if (!rfidTag.trim()) {
            setStatus("error");
            setMessage("Please enter a valid RFID tag");
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
        } catch (error) {
            setStatus("error");
            setMessage("Failed to mark attendance");
            console.error("RFID scan error:", error);
        } finally {
            setTimeout(() => {
                setStatus("idle");
                setMessage("");
                setRfidTag("");
            }, 3000);
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
    }, [rfidTag, handleScanRFID]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>RFID Attendance System - {today}</CardTitle>
                    <CardDescription>Scan RFID tags to mark attendance for today's exams</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                    </p>
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

                    {/* RFID Scanner Input */}
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <img
                                src="/placeholder.svg?height=120&width=120"
                                alt="RFID Scanner"
                                className="h-32 w-32"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Scan or enter RFID Tag ID"
                                value={rfidTag}
                                onChange={(e) => setRfidTag(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                Press Enter or use RFID scanner to mark attendance
                            </p>
                            <Button
                                className="w-full"
                                onClick={handleScanRFID}
                                disabled={rfidTag.trim() === ""}
                            >
                                Mark Attendance
                            </Button>
                        </div>
                    </div>

                    {/* Faculty Attendance Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Faculty Name</TableHead>
                                    <TableHead>RFID Tag</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {facultyList.map((faculty) => (
                                    <TableRow key={faculty.id}>
                                        <TableCell>{faculty.faculty_name}</TableCell>
                                        <TableCell>{faculty.rfid_tag}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={faculty.is_present ? "default" : "destructive"}
                                            >
                                                {faculty.is_present ? "Present" : "Absent"}
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
    );
}