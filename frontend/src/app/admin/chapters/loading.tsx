import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminChaptersLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-10 min-h-[500px]">
            <div className="w-full max-w-7xl animate-pulse space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="h-10 bg-gray-200 rounded w-40"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
            <div className="mt-8">
                <LoadingSpinner label="Loading chapters..." size="xl" />
            </div>
        </div>
    );
}
