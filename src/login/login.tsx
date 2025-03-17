import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = new URLSearchParams(location.search).get("role") === "admin";
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", phone: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError("");
        try {
            const response = await axios.post(
                'http://localhost:5000/api/login',
                {
                    email: values.email,
                    password: values.phone
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { token, is_admin, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAdmin', JSON.stringify(is_admin));

            if (is_admin) {
                navigate("/admin/dashboard");
            } else {
                navigate("/faculty/dashboard");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.message || "Login failed");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>{isAdmin ? "Admin Login" : "Faculty Login"}</CardTitle>
                    <CardDescription>Enter your credentials to access the portal</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="text-red-500 text-sm mb-4">{error}</div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enter Your Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your.email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enter Your Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">Contact administrator if you cannot access your account</p>
                </CardFooter>
            </Card>
        </div>
    );
}