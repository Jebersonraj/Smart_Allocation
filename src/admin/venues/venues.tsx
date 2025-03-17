// src/admin/venues/venues.tsx
import { useState, useEffect } from "react";
import axios from "axios";
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

// Define the Venue interface
interface Venue {
    venue_id: string | number; // Adjust based on your API (string or number)
    name: string;
    location: string;
    capacity: number;
}

export default function VenueManagement() {
    const [venues, setVenues] = useState<Venue[]>([]); // Type the venues state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [newVenue, setNewVenue] = useState<{ name: string; location: string; capacity: string }>({
        name: "",
        location: "",
        capacity: "",
    });
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const response = await axios.get<Venue[]>("http://localhost:5000/api/venues", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setVenues(response.data || []);
        } catch (error) {
            console.error("Error fetching venues:", error);
            setVenues([]); // Fallback to empty array on error
        }
    };

    const filteredVenues = venues.filter((v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddVenue = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/venues",
                {
                    ...newVenue,
                    capacity: parseInt(newVenue.capacity),
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setNewVenue({ name: "", location: "", capacity: "" });
            setIsAddDialogOpen(false);
            fetchVenues();
        } catch (error) {
            console.error("Error adding venue:", error);
        }
    };

    const handleDeleteVenue = async (id: string | number) => { // Type the id parameter
        try {
            await axios.delete(`http://localhost:5000/api/venues/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchVenues();
        } catch (error) {
            console.error("Error deleting venue:", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <AdminHeader />
            <div className="container mx-auto p-4 md:p-6 flex-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Venue Management</CardTitle>
                            <CardDescription>Manage exam venues</CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Venue
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Venue</DialogTitle>
                                    <DialogDescription>Enter venue details</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={newVenue.name}
                                            onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={newVenue.location}
                                            onChange={(e) => setNewVenue({ ...newVenue, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="capacity">Capacity</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            value={newVenue.capacity}
                                            onChange={(e) => setNewVenue({ ...newVenue, capacity: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddVenue}>Add Venue</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search venues..."
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
                                        <TableHead>Location</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVenues.length > 0 ? (
                                        filteredVenues.map((v) => (
                                            <TableRow key={v.venue_id}>
                                                <TableCell>{v.venue_id}</TableCell>
                                                <TableCell>{v.name}</TableCell>
                                                <TableCell>{v.location}</TableCell>
                                                <TableCell>{v.capacity}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteVenue(v.venue_id)}
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
                                                No venues found
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