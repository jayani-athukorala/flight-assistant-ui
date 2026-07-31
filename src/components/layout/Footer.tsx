import { Plane } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white mt-auto">

            <div className="max-w-7xl mx-auto py-8 px-6">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                        <Plane size={20} />

                        <span className="font-semibold">
              Flight Reservation System
            </span>

                    </div>

                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} All rights reserved.
                    </p>

                </div>

            </div>

        </footer>
    );
};

export default Footer;