import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminHeader from "@/components/admin-header";
import { FileText, MapPin, Users, UserPlus, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label";

interface Allocation {
    allocation_id: number;
    faculty_name: string;
    venue_name: string;
    date: string;
    time_slot: string;
}

interface AuthHeaders {
    headers?: {
        Authorization: string;
    };
}

interface ErrorResponse {
    message?: string;
}

interface SuccessResponse {
    message: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "quick-actions">("overview");
    const [facultyCount, setFacultyCount] = useState<number>(0);
    const [venueCount, setVenueCount] = useState<number>(0);
    const [allocationCount, setAllocationCount] = useState<number>(0);
    const [recentAllocations, setRecentAllocations] = useState<Allocation[]>([]);
    const [facultyFile, setFacultyFile] = useState<File | null>(null);
    const [venueFile, setVenueFile] = useState<File | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login?role=admin");
            return;
        }
        fetchCounts();
        fetchRecentAllocations();
    }, [navigate]);

    const getAuthHeaders = (): AuthHeaders => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login?role=admin");
            return {};
        }
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    const fetchCounts = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers.headers?.Authorization) return;

            const [facultyRes, venueRes, allocRes] = await Promise.all([
                axios.get("http://localhost:5000/api/faculty", headers),
                axios.get("http://localhost:5000/api/venues", headers),
                axios.get("http://localhost:5000/api/allocations", headers),
            ]);
            setFacultyCount(facultyRes.data.length);
            setVenueCount(venueRes.data.length);
            setAllocationCount(allocRes.data.length);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            if (axiosError.response?.status === 401 || axiosError.response?.status === 422) {
                localStorage.removeItem("token");
                navigate("/login?role=admin");
            }
        }
    };

    const fetchRecentAllocations = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers.headers?.Authorization) return;

            const response = await axios.get<Allocation[]>("http://localhost:5000/api/allocations", headers);
            setRecentAllocations(response.data.slice(0, 5));
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            if (axiosError.response?.status === 401 || axiosError.response?.status === 422) {
                localStorage.removeItem("token");
                navigate("/login?role=admin");
            }
        }
    };

    const handleTabChange = (value: string) => {
        if (value === "overview" || value === "quick-actions") {
            setActiveTab(value);
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
                                    <Link to="/admin/allocations"><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Allocations</Button></Link>
                                    <Link to="/admin/attendance"><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Attendance Records</Button></Link>
                                    <Link to="/admin/external"><Button variant="ghost" className="w-full justify-start"><UserPlus className="mr-2 h-4 w-4" /> External Faculty</Button></Link>
                                    <Link to="/logout"><Button variant="ghost" className="w-full justify-start text-red-500"><LogOut className="mr-2 h-4 w-4" /> Logout</Button></Link>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-3">
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                                        <CardHeader className="pb-2"><CardTitle className="text-xl">Allocations</CardTitle><CardDescription>Total allocations</CardDescription></CardHeader>
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
                                            {recentAllocations.map((alloc) => (
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
                                    <CardHeader>
                                        <CardTitle>Bulk Import</CardTitle>
                                        <CardDescription>Upload Excel files to import faculty or venues</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="faculty-upload">Import Faculty</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="faculty-upload"
                                                    type="file"
                                                    accept=".xlsx"
                                                    onChange={(e) => handleFileChange("faculty", e)}
                                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                />
                                                <Button
                                                    onClick={() => handleBulkImport("faculty")}
                                                    disabled={!facultyFile}
                                                >
                                                    Upload Faculty
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Required columns: faculty_id, name, mobile_number, email_id, is_admin, rfid_tag
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="venues-upload">Import Venues</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="venues-upload"
                                                    type="file"
                                                    accept=".xlsx"
                                                    onChange={(e) => handleFileChange("venues", e)}
                                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                />
                                                <Button
                                                    onClick={() => handleBulkImport("venues")}
                                                    disabled={!venueFile}
                                                >
                                                    Upload Venues
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Required columns: venue_id, name, location, capacity
                                            </p>
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