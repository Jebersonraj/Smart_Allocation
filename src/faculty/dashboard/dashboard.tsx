// src/faculty/dashboard/dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Calendar } from "lucide-react";

export default function FacultyDashboard() {
    const [allocations, setAllocations] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserData();
        fetchAllocations();
    }, [navigate]);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/current_user', getAuthHeaders());
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            navigate('/login');
        }
    };

    const fetchAllocations = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/allocations', getAuthHeaders());
            setAllocations(response.data.filter(alloc => alloc.faculty_id === user?.id));
        } catch (error) {
            console.error('Error fetching allocations:', error);
        }
    };

    const handleMarkAttendance = async (date) => {
        try {
            await axios.post('http://localhost:5000/api/attendance', { date }, getAuthHeaders());
            fetchAllocations();
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-primary py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Faculty Dashboard</h1>
                    <Button variant="ghost" onClick={() => navigate('/logout')}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </header>
            <div className="container mx-auto p-4 md:p-6 flex-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {user?.name}</CardTitle>
                        <CardDescription>Your upcoming exam allocations</CardDescription>
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
                                {allocations.map((alloc) => (
                                    <TableRow key={alloc.allocation_id}>
                                        <TableCell>{alloc.venue_name}</TableCell>
                                        <TableCell>{alloc.date}</TableCell>
                                        <TableCell>{alloc.time_slot}</TableCell>
                                        <TableCell>{alloc.is_present ? 'Present' : 'Absent'}</TableCell>
                                        <TableCell>
                                            {!alloc.is_present && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleMarkAttendance(alloc.date)}
                                                >
                                                    Mark Present
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}