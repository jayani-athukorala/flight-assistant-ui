import { LoaderCircle } from "lucide-react";

const Spinner = () => {
    return (
        <div className="flex justify-center py-10">
            <LoaderCircle
                className="animate-spin text-blue-600"
                size={40}
            />
        </div>
    );
};

export default Spinner;