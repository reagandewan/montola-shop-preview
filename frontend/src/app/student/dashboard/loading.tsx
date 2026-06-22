import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
            <LoadingSpinner label="Opening your dashboard..." size="xl" />
        </div>
    );
}
