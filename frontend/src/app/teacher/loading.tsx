import LoadingSpinner from "@/components/LoadingSpinner";

export default function TeacherLoading() {
    return (
        <div className="flex items-center justify-center py-20">
            <LoadingSpinner label="Loading teacher dashboard..." size="xl" />
        </div>
    );
}
