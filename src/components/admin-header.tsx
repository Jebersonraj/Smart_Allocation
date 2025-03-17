import { Link } from "react-router-dom"; // Updated import
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminHeader() {
  return (
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            <nav className="hidden md:flex space-x-4">
              <Link to="/admin/dashboard" className="text-white hover:text-white/80">
                Dashboard
              </Link>
              <Link to="/admin/faculty" className="text-white hover:text-white/80">
                Faculty
              </Link>
              <Link to="/admin/venues" className="text-white hover:text-white/80">
                Venues
              </Link>
              <Link to="/admin/allocations" className="text-white hover:text-white/80">
                Allocations
              </Link>
              <Link to="/admin/attendance" className="text-white hover:text-white/80">
                Attendance
              </Link>
            </nav>
          </div>
          <Link to="/logout">
            <Button variant="ghost" className="text-white">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </header>
  );
}