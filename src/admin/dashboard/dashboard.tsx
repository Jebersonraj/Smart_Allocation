import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminHeader from "@/components/admin-header";
import { Calendar, FileText, MapPin, Users, UserPlus, Download, Upload, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [facultyCount, setFacultyCount] = useState(0);
    const [venueCount, setVenueCount] = useState(0);
    const [allocationCount, setAllocationCount] = useState(0);
    const [recentAllocations, setRecentAllocations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login?role=admin');
            return;
        }
        fetchCounts();
        fetchRecentAllocations();
    }, [navigate]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        console.log('Token being sent:', token);
        if (!token) {
            navigate('/login?role=admin');
            return {};
        }
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    const fetchCounts = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers.headers.Authorization) return;

            const [facultyRes, venueRes, allocRes] = await Promise.all([
                axios.get('http://localhost:5000/api/faculty', headers),
                axios.get('http://localhost:5000/api/venues', headers),
                axios.get('http://localhost:5000/api/allocations', headers)
            ]);
            setFacultyCount(facultyRes.data.length);
            setVenueCount(venueRes.data.length);
            setAllocationCount(allocRes.data.length);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Fetch counts error:', error.response?.status, error.response?.data);
                if (error.response?.status === 401 || error.response?.status === 422) {
                    localStorage.removeItem('token');
                    navigate('/login?role=admin');
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    const fetchRecentAllocations = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers.headers.Authorization) return;

            const response = await axios.get('http://localhost:5000/api/allocations', headers);
            setRecentAllocations(response.data.slice(0, 5));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Fetch allocations error:', error.response?.status, error.response?.data);
                if (error.response?.status === 401 || error.response?.status === 422) {
                    localStorage.removeItem('token');
                    navigate('/login?role=admin');
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    const handleBulkImport = async (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post(`http://localhost:5000/api/bulk-import/${type}`, formData, {
                ...getAuthHeaders(),
                'Content-Type': 'multipart/form-data'
            });
            fetchCounts();
            fetchRecentAllocations();
        } catch (error) {
            console.error('Bulk import error:', error);
        }
    };


    return (
        <div className="flex min-h-screen flex-col">
            <AdminHeader />
            <div className="container mx-auto p-4 md:p-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader><CardTitle>Admin Menu</CardTitle></CardHeader>
                            <CardContent>
                                <nav className="space-y-2">
                                    <Link to="/admin/faculty"><Button variant="ghost" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Faculty Management</Button></Link>
                                    <Link to="/admin/venues"><Button variant="ghost" className="w-full justify-start"><MapPin className="mr-2 h-4 w-4" /> Venue Management</Button></Link>
                                    <Link to="/admin/allocations"><Button variant="ghost" className="w-full justify-start"><Calendar className="mr-2 h-4 w-4" /> Allocations</Button></Link>
                                    <Link to="/admin/attendance"><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Attendance Records</Button></Link>
                                    <Link to="/admin/external"><Button variant="ghost" className="w-full justify-start"><UserPlus className="mr-2 h-4 w-4" /> External Faculty</Button></Link>
                                    <Link to="/logout"><Button variant="ghost" className="w-full justify-start text-red-500"><LogOut className="mr-2 h-4 w-4" /> Logout</Button></Link>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-xl">Faculty</CardTitle><CardDescription>Total registered faculty</CardDescription></CardHeader>
                                        <CardContent><p className="text-3xl font-bold">{facultyCount}</p></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-xl">Venues</CardTitle><CardDescription>Available exam venues</CardDescription></CardHeader>
                                        <CardContent><p className="text-3xl font-bold">{venueCount}</p></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-xl">Allocations</CardTitle><CardDescription>Completed allocations</CardDescription></CardHeader>
                                        <CardContent><p className="text-3xl font-bold">{allocationCount}</p></CardContent>
                                    </Card>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Allocations</CardTitle>
                                        <CardDescription>Last 5 venue allocations</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {recentAllocations.map((alloc: any) => (
                                                <div key={alloc.allocation_id} className="flex justify-between text-sm">
                                                    <span>{alloc.faculty_name} → {alloc.venue_name}</span>
                                                    <span>{alloc.date} ({alloc.time_slot})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="quick-actions" className="space-y-4">
                                <Card>
                                    <CardHeader><CardTitle>Bulk Import</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Import Faculty</label>
                                            <Input
                                                id="faculty-upload"
                                                type="file"
                                                accept=".xlsx"
                                                className="hidden"
                                                onChange={(e) => handleBulkImport('faculty', e)}
                                            />

                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Import Venues</label>
                                            <Input
                                                id="venues-upload"
                                                type="file"
                                                accept=".xlsx"
                                                className="hidden"
                                                onChange={(e) => handleBulkImport('venues', e)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}