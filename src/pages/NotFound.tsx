import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center py-24">

            <h1 className="text-6xl font-bold">
                404
            </h1>

            <p className="mt-4 text-gray-600">
                Page not found.
            </p>

            <Link
                to="/"
                className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
                Go Home
            </Link>

        </div>
    );
};

export default NotFound;