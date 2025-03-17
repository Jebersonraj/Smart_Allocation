import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LogoutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await axios.post('http://localhost:5000/api/logout', {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('isAdmin');
                navigate("/");
            }
        };
        performLogout();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Logging out...</h1>
                <p className="text-muted-foreground">Please wait while we log you out.</p>
            </div>
        </div>
    );
}