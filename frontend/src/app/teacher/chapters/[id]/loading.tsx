import LoadingSpinner from "@/components/LoadingSpinner";

export default function TeacherChapterDetailLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[500px]">
            <div className="w-full max-w-7xl animate-pulse space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 h-[600px] bg-gray-200 rounded-xl"></div>
                    <div className="md:col-span-2 h-[600px] bg-gray-200 rounded-xl"></div>
                </div>
            </div>
            <div className="mt-10">
                <LoadingSpinner label="Loading chapter details and curriculum editor..." size="xl" />
            </div>
        </div>
    );
}
