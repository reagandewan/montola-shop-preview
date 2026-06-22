"use client";

interface LoadingSpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "primary" | "white" | "gray";
    label?: string;
}

export default function LoadingSpinner({
    className = "",
    size = "md",
    variant = "primary",
    label
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4"
    };

    const variantClasses = {
        primary: "border-primary-600/20 border-b-primary-600",
        white: "border-white/20 border-b-white",
        gray: "border-gray-200 border-b-gray-600"
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div
                className={`
                    ${sizeClasses[size]}
                    ${variantClasses[variant]}
                    rounded-full
                    animate-spin
                `}
                role="status"
                aria-label="loading"
            />
            {label && (
                <p className={`
                    text-sm font-medium
                    ${variant === 'white' ? 'text-white/80' : 'text-gray-500'}
                    tracking-wide
                `}>
                    {label}
                </p>
            )}
        </div>
    );
}
