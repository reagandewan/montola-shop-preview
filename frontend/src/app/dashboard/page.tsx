"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
    id: number;
    email: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

export default function DashboardPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState("");
    const router = useRouter();

    // Check if token exists
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) router.push("/auth/login");
    }, [router]);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get<User[]>("/users");
                setUsers(res.data);

            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch users");
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            {error && <p className="text-red-500 mb-3">{error}</p>}

            <table className="min-w-full bg-white shadow rounded">
                <thead>
                <tr>
                    <th className="py-2 px-4 border">ID</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Roles</th>
                    <th className="py-2 px-4 border">Created At</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td className="py-2 px-4 border">{user.id}</td>
                        <td className="py-2 px-4 border">{user.email}</td>
                        <td className="py-2 px-4 border">{user.roles.join(", ")}</td>
                        <td className="py-2 px-4 border">{new Date(user.createdAt).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
