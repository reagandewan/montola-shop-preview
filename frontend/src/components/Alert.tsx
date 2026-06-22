export function Alert({ type, message }: { type: "error" | "success" | "info"; message: string }) {
    const colors = {
        error: "bg-red-100 text-red-800",
        success: "bg-green-100 text-green-800",
        info: "bg-blue-100 text-blue-800"
    };

    return (
        <div className={`${colors[type]} flex items-center p-2 rounded mb-3`}>
            {message}
        </div>
    );
}
