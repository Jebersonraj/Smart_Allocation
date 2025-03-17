import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import AdminHeader from "@/components/admin-header";

// Define the Faculty interface with faculty_id as optional
interface Faculty {
    faculty_id?: string | number; // Made optional with ?
    name: string;
    mobile_number: string;
    email_id: string;
    is_admin?: boolean;
}

export default function FacultyManagement() {
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [newFaculty, setNewFaculty] = useState<Faculty>({
        name: "",
        mobile_number: "",
        email_id: "",
        is_admin: false,
    });
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, redirecting to login");
            navigate("/login?role=admin");
            return;
        }
        try {
            const response = await axios.get<Faculty[]>("http://localhost:5000/api/faculty", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFaculty(response.data || []);
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response) {
                console.error("Axios error:", axiosError.response.status, axiosError.response.data);
                if (axiosError.response.status === 403 || axiosError.response.status === 401) {
                    navigate("/login?role=admin");
                } else if (axiosError.response.status === 422) {
                    console.error("Unprocessable entity:", axiosError.response.data);
                    alert("Invalid request. Please check your authentication.");
                }
            } else {
                console.error("Unexpected error:", error);
            }
        }
    };

    // Filter faculty with null checks
    const filteredFaculty = faculty.filter((f) =>
        (f.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (f.email_id?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (f.mobile_number?.includes(searchTerm) || false)
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
    const paginatedFaculty = filteredFaculty.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleAddFaculty = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post("http://localhost:5000/api/faculty", newFaculty, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Reset newFaculty (faculty_id is optional, so it’s fine to omit it)
            setNewFaculty({ name: "", mobile_number: "", email_id: "", is_admin: false });
            setIsAddDialogOpen(false);
            fetchFaculty();
        } catch (error) {
            console.error("Add faculty error:", error);
        }
    };

    const handleDeleteFaculty = async (id: string | number | undefined) => {
        const token = localStorage.getItem("token");
        if (!id) return; // Guard against undefined id
        try {
            await axios.delete(`http://localhost:5000/api/faculty/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchFaculty();
        } catch (error) {
            console.error("Delete faculty error:", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <AdminHeader />
            <div className="container mx-auto p-4 md:p-6 flex-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Faculty Management</CardTitle>
                            <CardDescription>Manage faculty members for invigilation</CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Faculty
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Faculty</DialogTitle>
                                    <DialogDescription>Enter faculty details</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={newFaculty.name}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mobile">Mobile Number</Label>
                                        <Input
                                            id="mobile"
                                            value={newFaculty.mobile_number}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, mobile_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={newFaculty.email_id}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, email_id: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddFaculty}>Add Faculty</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search faculty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Mobile</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFaculty.length > 0 ? (
                                        paginatedFaculty.map((f) => (
                                            <TableRow key={f.faculty_id || Math.random().toString()}>
                                                <TableCell>{f.faculty_id || "N/A"}</TableCell>
                                                <TableCell>{f.name || "N/A"}</TableCell>
                                                <TableCell>{f.mobile_number || "N/A"}</TableCell>
                                                <TableCell>{f.email_id || "N/A"}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteFaculty(f.faculty_id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No faculty found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {totalPages > 0 && (
                            <div className="mt-4 flex justify-between items-center">
                                <Button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                >
                                    Previous
                                </Button>
                                <span>
                  Page {currentPage} of {totalPages}
                </span>
                                <Button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}