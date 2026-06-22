import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminPaymentsLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-10 min-h-[500px]">
            <div className="w-full max-w-7xl animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-12 bg-gray-100 rounded mb-2"></div>
                <div className="h-12 bg-gray-50 rounded mb-2"></div>
                <div className="h-64 bg-gray-200 rounded-xl mt-8"></div>
            </div>
            <div className="mt-8">
                <LoadingSpinner label="Loading payment verification records..." size="xl" />
            </div>
        </div>
    );
}
