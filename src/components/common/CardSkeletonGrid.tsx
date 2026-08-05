interface CardSkeletonGridProps {
    count?: number;
}

const CardSkeletonGrid = ({count = 6}: CardSkeletonGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {
                Array.from({length: count}).map((_,i)=>(
                    <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse"/>
                ))
            }
        </div>
    );
};

export default CardSkeletonGrid;