import LoadingSpinner from "@/components/LoadingSpinner";

export default function AssignedChaptersLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
            <div className="animate-pulse w-full max-w-4xl space-y-4 mb-8">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <LoadingSpinner label="Fetching your assigned chapters..." size="xl" />
        </div>
    );
}
