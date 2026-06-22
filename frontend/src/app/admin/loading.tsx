import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center py-20 min-h-[60vh]">
            <LoadingSpinner label="Loading admin panel..." size="xl" />
        </div>
    );
}
