import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import FlightsPage from "./pages/FlightsPage";
import AvailableFlightsPage from "./pages/AvailableFlightsPage";
import BookingLookupPage from "./pages/BookingLookupPage";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <Navbar />

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route
                        path="/flights"
                        element={<FlightsPage />}
                    />

                    <Route
                        path="/available"
                        element={<AvailableFlightsPage />}
                    />

                    <Route
                        path="/bookings"
                        element={<BookingLookupPage />}
                    />

                    <Route
                        path="*"
                        element={<NotFound />}
                    />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;