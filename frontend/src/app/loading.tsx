import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner label="Switching page..." size="xl" />
        </div>
    );
}
