"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import AdminHeader from "@/components/admin-header"

// Mock external faculty data
const mockExternalFaculty = [
    { id: 101, name: "Dr. Sarah Johnson", email: "sarah.j@external.com", phone: "9876543210", rfidTag: "EX001" },
    { id: 102, name: "Prof. David Lee", email: "david.l@external.com", phone: "8765432109", rfidTag: "EX002" },
    { id: 103, name: "Dr. Lisa Chen", email: "lisa.c@external.com", phone: "7654321098", rfidTag: "EX003" },
]

export default function ExternalFacultyManagement() {
    const [externalFaculty, setExternalFaculty] = useState(mockExternalFaculty)
    const [searchTerm, setSearchTerm] = useState("")
    const [newFaculty, setNewFaculty] = useState({
        name: "",
        email: "",
        phone: "",
        rfidTag: "",
    })
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const filteredFaculty = externalFaculty.filter(
        (f) =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.phone.includes(searchTerm),
    )

    const handleAddFaculty = () => {
        const id = Math.max(...externalFaculty.map((f) => f.id)) + 1
        setExternalFaculty([...externalFaculty, { id, ...newFaculty }])
        setNewFaculty({ name: "", email: "", phone: "", rfidTag: "" })
        setIsAddDialogOpen(false)
    }

    const handleDeleteFaculty = (id: number) => {
        setExternalFaculty(externalFaculty.filter((f) => f.id !== id))
    }

    return (
        <div className="flex min-h-screen flex-col">
        <AdminHeader />

        <div className="container mx-auto p-4 md:p-6 flex-1">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>External Faculty Management</CardTitle>
    <CardDescription>Manage external faculty members for invigilation</CardDescription>
                                                         </div>
                                                         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    <DialogTrigger asChild>
    <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add External Faculty
    </Button>
    </DialogTrigger>
    <DialogContent>
    <DialogHeader>
        <DialogTitle>Add External Faculty</DialogTitle>
    <DialogDescription>Enter the details of the external faculty member</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
    <div className="grid gap-2">
    <Label htmlFor="name">Full Name</Label>
    <Input
    id="name"
    value={newFaculty.name}
    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
    />
    </div>
    <div className="grid gap-2">
    <Label htmlFor="email">Email</Label>
        <Input
    id="email"
    type="email"
    value={newFaculty.email}
    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
    />
    </div>
    <div className="grid gap-2">
    <Label htmlFor="phone">Phone Number</Label>
    <Input
    id="phone"
    value={newFaculty.phone}
    onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value })}
    />
    </div>
    <div className="grid gap-2">
    <Label htmlFor="rfid">RFID Tag</Label>
    <Input
    id="rfid"
    value={newFaculty.rfidTag}
    onChange={(e) => setNewFaculty({ ...newFaculty, rfidTag: e.target.value })}
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
        placeholder="Search external faculty by name, email or phone..."
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
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>RFID Tag</TableHead>
    <TableHead>Actions</TableHead>
    </TableRow>
    </TableHeader>
    <TableBody>
    {filteredFaculty.map((f) => (
            <TableRow key={f.id}>
            <TableCell>{f.id}</TableCell>
            <TableCell>{f.name}</TableCell>
            <TableCell>{f.email}</TableCell>
            <TableCell>{f.phone}</TableCell>
            <TableCell>{f.rfidTag}</TableCell>
            <TableCell>
            <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
        <Pencil className="h-4 w-4" />
            </Button>
            <Button
        variant="ghost"
        size="icon"
        className="text-red-500"
        onClick={() => handleDeleteFaculty(f.id)}
>
    <Trash2 className="h-4 w-4" />
        </Button>
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
)
}

