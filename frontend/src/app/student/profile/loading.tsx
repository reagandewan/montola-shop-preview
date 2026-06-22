import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProfileLoading() {
    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 mb-10"></div>
                </div>
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner label="Loading your profile settings..." size="xl" />
                </div>
            </div>
        </div>
    );
}
