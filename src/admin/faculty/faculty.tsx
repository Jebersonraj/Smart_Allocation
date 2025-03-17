import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import AdminHeader from "@/components/admin-header";

export default function FacultyManagement() {
    const [faculty, setFaculty] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newFaculty, setNewFaculty] = useState({ name: "", mobile_number: "", email_id: "", is_admin: false });
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const navigate = useNavigate(); // Add this

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login');
            navigate('/login?role=admin');
            return;
        }
        try {
            const response = await axios.get('http://localhost:5000/api/faculty', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFaculty(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.status, error.response?.data);
                if (error.response?.status === 403) {
                    navigate('/login?role=admin');
                } else if (error.response?.status === 422) {
                    console.error('Unprocessable entity:', error.response?.data);
                    alert('Invalid request. Please check your authentication.');
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.mobile_number.includes(searchTerm)
    );

    const handleAddFaculty = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/faculty', newFaculty, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewFaculty({ name: "", mobile_number: "", email_id: "", is_admin: false });
            setIsAddDialogOpen(false);
            fetchFaculty();
        } catch (error) {
            console.error('Add faculty error:', error);
        }
    };

    const handleDeleteFaculty = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/faculty/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFaculty();
        } catch (error) {
            console.error('Delete faculty error:', error);
        }
    };

    // Rest of your component remains unchanged...
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
                                <Button><Plus className="mr-2 h-4 w-4" /> Add Faculty</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Faculty</DialogTitle>
                                    <DialogDescription>Enter faculty details</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={newFaculty.name} onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mobile">Mobile Number</Label>
                                        <Input id="mobile" value={newFaculty.mobile_number} onChange={e => setNewFaculty({ ...newFaculty, mobile_number: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={newFaculty.email_id} onChange={e => setNewFaculty({ ...newFaculty, email_id: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddFaculty}>Add Faculty</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search faculty..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
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
                                    {filteredFaculty.map(f => (
                                        <TableRow key={f.faculty_id}>
                                            <TableCell>{f.faculty_id}</TableCell>
                                            <TableCell>{f.name}</TableCell>
                                            <TableCell>{f.mobile_number}</TableCell>
                                            <TableCell>{f.email_id}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteFaculty(f.faculty_id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
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