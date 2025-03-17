import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Download, RefreshCw, AlertTriangle } from "lucide-react";
import AdminHeader from "@/components/admin-header";
import { Label } from "@radix-ui/react-label";

interface Allocation {
    allocation_id?: string;
    faculty_name?: string;
    venue_name?: string;
    date?: string;
    time_slot?: string;
}

export default function AllocationManagement() {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("all");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [date, setDate] = useState<string>("");
    const [timeSlot, setTimeSlot] = useState<string>("08:00-12:00");
    const [facultyPerVenue, setFacultyPerVenue] = useState<string>("1");

    useEffect(() => {
        fetchAllocations();
    }, []);

    const fetchAllocations = async () => {
        try {
            const response = await axios.get<Allocation[]>('http://localhost:5000/api/allocations', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAllocations(response.data || []);
        } catch (error) {
            console.error('Error fetching allocations:', error);
            setAllocations([]);
        }
    };

    const filteredAllocations = selectedDate === "all"
        ? allocations
        : allocations.filter((a): a is Allocation => a.date === selectedDate);
    const uniqueDates = [...new Set(allocations.map(a => a.date).filter(Boolean))] as string[];

    const handleGenerateAllocations = async () => {
        if (!date) {
            setShowSuccess(false);
            return;
        }
        setIsGenerating(true);
        try {
            await axios.post('http://localhost:5000/api/allocations/generate', {
                date,
                time_slot: timeSlot,
                faculty_per_venue: parseInt(facultyPerVenue)
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowSuccess(true);
            await fetchAllocations();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error generating allocations:', error);
            const errorMessage = error.response?.data?.message || 'Failed to generate allocations';
            alert(errorMessage);  // Or use a UI component like <Alert>
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Venue Allocations', 14, 20);

        const headers = ['ID', 'Faculty', 'Venue', 'Date', 'Time'];
        const data = filteredAllocations.map(a => [
            String(a.allocation_id || 'N/A'),
            String(a.faculty_name || 'Unknown'),
            String(a.venue_name || 'Unknown'),
            String(a.date || 'N/A'),
            String(a.time_slot || 'N/A')
        ]);

        doc.setFontSize(11);
        const startY = 30;
        const columnWidth = 35;
        const rowHeight = 10;

        // Draw headers
        headers.forEach((header, index) => {
            doc.text(header, 14 + index * columnWidth, startY);
        });
        doc.line(14, startY + 2, 194, startY + 2);

        // Draw data rows
        data.forEach((row, rowIndex) => {
            const yPosition = startY + 10 + (rowIndex * rowHeight);
            row.forEach((cell, cellIndex) => {
                const text = String(cell);
                // Split text if it's too long
                if (text.length > 20) {
                    const firstLine = text.substring(0, 20);
                    doc.text(firstLine, 14 + cellIndex * columnWidth, yPosition);
                } else {
                    doc.text(text, 14 + cellIndex * columnWidth, yPosition);
                }
            });
            doc.line(14, yPosition + 2, 194, yPosition + 2);
        });

        doc.save(`allocations_${selectedDate}.pdf`);
    };

    // Rest of the component remains the same...
    return (
        <div className="flex min-h-screen flex-col">
            <AdminHeader />
            <div className="container mx-auto p-4 md:p-6 flex-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Venue Allocations</CardTitle>
                            <CardDescription>Manage and generate faculty venue allocations</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleGenerateAllocations} disabled={isGenerating || !date}>
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="mr-2 h-4 w-4" /> Generate Allocations
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={handleExportPDF}>
                                <Download className="mr-2 h-4 w-4" /> Export PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showSuccess && (
                            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Success!</AlertTitle>
                                <AlertDescription>Allocations have been generated successfully.</AlertDescription>
                            </Alert>
                        )}
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Date</Label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div>
                                <Label>Time Slot</Label>
                                <Select value={timeSlot} onValueChange={setTimeSlot}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="08:00-12:00">08:00 AM - 12:00 PM</SelectItem>
                                        <SelectItem value="12:00-15:00">12:00 PM - 03:00 PM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Faculty per Venue</Label>
                                <Select value={facultyPerVenue} onValueChange={setFacultyPerVenue}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Filter by Date</Label>
                                <Select value={selectedDate} onValueChange={setSelectedDate}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Dates</SelectItem>
                                        {uniqueDates.map(date => (
                                            <SelectItem key={date} value={date}>{date}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Faculty</TableHead>
                                        <TableHead>Venue</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAllocations.length > 0 ? (
                                        filteredAllocations.map(a => (
                                            <TableRow key={a.allocation_id || Math.random().toString()}>
                                                <TableCell>{a.allocation_id || 'N/A'}</TableCell>
                                                <TableCell>{a.faculty_name || 'Unknown'}</TableCell>
                                                <TableCell>{a.venue_name || 'Unknown'}</TableCell>
                                                <TableCell>{a.date || 'N/A'}</TableCell>
                                                <TableCell>{a.time_slot || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No allocations available
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