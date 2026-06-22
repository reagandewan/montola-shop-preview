import LoadingSpinner from "@/components/LoadingSpinner";

export default function UsersLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-10 min-h-[500px]">
            <div className="w-full max-w-7xl animate-pulse space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="mt-8">
                <LoadingSpinner label="Fetching user list..." size="xl" />
            </div>
        </div>
    );
}
