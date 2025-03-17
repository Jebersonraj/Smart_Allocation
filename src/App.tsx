import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home.tsx";
import LoginPage from "./login/login.tsx";
import LogoutPage from "./logout/logout.tsx";
import AdminDashboard from "./admin/dashboard/dashboard.tsx";
import FacultyManagement from "./admin/faculty/faculty.tsx";
import VenueManagement from "./admin/venues/venues.tsx";
import AllocationManagement from "./admin/allocations/allocations.tsx";
import AttendanceRecords from "./admin/attendance/attendance.tsx";
import ExternalFacultyManagement from "./admin/external/external.tsx";
import FacultyDashboard from "./faculty/dashboard/dashboard.tsx";
import RFIDAttendance from "./rfid-attendance/attendance.tsx";

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/logout" element={<LogoutPage />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/faculty" element={<FacultyManagement />} />
                <Route path="/admin/venues" element={<VenueManagement />} />
                <Route path="/admin/allocations" element={<AllocationManagement />} />
                <Route path="/admin/attendance" element={<AttendanceRecords />} />
                <Route path="/admin/external" element={<ExternalFacultyManagement />} />

                {/* Faculty Routes */}
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

                {/* RFID Attendance Route */}
                <Route path="/rfid-attendance" element={<RFIDAttendance />} />
            </Routes>
        </Router>
    );
}