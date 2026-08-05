interface StatCardProps {
    label: string;
    value: string | number;
    color?: string;
}

const StatCard = ({label, value, color = "text-gray-900"}: StatCardProps) => {
    return (
        <div className="bg-white border rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <h2 className={`text-3xl font-bold mt-2 ${color}`}>
                {value}
            </h2>
        </div>
    );
};

export default StatCard;
