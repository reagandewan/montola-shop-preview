import LoadingSpinner from "@/components/LoadingSpinner";

export default function StudentChapterLoading() {
    return (
        <div className="w-full min-h-[400px] flex items-center justify-center">
            <LoadingSpinner label="Loading lesson..." size="lg" />
        </div>
    );
}
