import { Link } from "react-router-dom"; // Updated import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-primary py-6">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white">Exam Venue Allocation System</h1>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Faculty Portal</CardTitle>
                            <CardDescription>Login to view your allocated exam venues and mark attendance</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <img src="/faculty.jpg?height=120&width=120" alt="Faculty icon" className="h-30 w-30" />
                        </CardContent>
                        <CardFooter>
                            <Link to="/login" className="w-full"> {/* Updated path */}
                                <Button className="w-full">Login as Faculty</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Admin Portal</CardTitle>
                            <CardDescription>Manage faculty, venues, and allocations</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <img src="/admin.jpg?height=120&width=120" alt="Admin icon" className="h-30 w-30" />
                        </CardContent>
                        <CardFooter>
                            <Link to="/login?role=admin" className="w-full"> {/* Updated path */}
                                <Button className="w-full" variant="outline">Login as Admin</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </main>

            <footer className="bg-muted py-6">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>© {new Date().getFullYear()} Exam Venue Allocation System</p>
                </div>
            </footer>
        </div>
    );
}