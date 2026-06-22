"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, required, className = "", ...props }, ref) => {
        return (
            <div className="mb-4">
                {label && (
                    <label className="block mb-1 font-semibold text-gray-700">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full p-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                    } ${className}`}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
