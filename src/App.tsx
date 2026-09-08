import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import FlightsPage from "./pages/FlightsPage";
import AvailableFlightsPage from "./pages/AvailableFlightsPage";
import BookingLookupPage from "./pages/BookingLookupPage";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import AssistantWidget from "./components/assistant/AssistantWidget";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminRoute from "./routes/AdminRoute";

function App() {
    return (
        <div className="flex min-h-screen flex-col">

            <Navbar />

            <main className="flex-1">

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/flights"
                        element={<AdminRoute><FlightsPage /></AdminRoute>}
                    />

                    <Route
                        path="/admin/bookings"
                        element={<AdminRoute><AdminBookingsPage /></AdminRoute>}
                    />

                    <Route
                        path="/available"
                        element={
                            <AvailableFlightsPage />
                        }
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/bookings"
                        element={
                            <ProtectedRoute>
                                <BookingLookupPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/booking/:id"
                        element={
                            <ProtectedRoute>
                                <BookingPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={<NotFound />}
                    />

                </Routes>

            </main>

            <Footer />

            <AssistantWidget />

        </div>
    );
}

export default App;
