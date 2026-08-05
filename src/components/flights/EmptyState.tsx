interface EmptyStateProps {
    title:string;
    message:string;
}

export default function EmptyState({title, message}:EmptyStateProps){

    return (
        <div className="text-center py-20">
            <div className="text-6xl">
                ✈️
            </div>

            <h2 className="text-2xl font-bold mt-4">
                {title}
            </h2>

            <p className="text-gray-500 mt-2">
                {message}
            </p>
        </div>
    );
}