"use client";

import { useEffect, useState } from "react";
import { getAllUsers, adminRegister } from "@/lib/admin";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
import { useI18n } from "@/contexts/I18nProvider";

export default function AdminUsersPage() {
    const { t } = useI18n();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([UserRole.TEACHER]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            toast.error(t("messages.errorFetch"));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminRegister({
                email,
                fullName,
                password,
                phone: phone || undefined,
                roles: selectedRoles
            });
            toast.success(t("messages.createdSuccess"));
            setShowModal(false);
            // Reset fields
            setEmail("");
            setFullName("");
            setPassword("");
            setPhone("");
            setSelectedRoles([UserRole.TEACHER]);
            // Refresh
            fetchUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || t("messages.errorCreate"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors"
                >
                    Create User
                </button>
            </div>

            {loading ? (
                <p>{t("messages.loading")}</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Roles</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{user.id}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        {user.roles?.join(", ") || "No Roles"}
                                    </td>
                                    <td className="px-6 py-4">{user.phone || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Create User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Password *</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">Roles *</label>
                                <div className="flex flex-col gap-2">
                                    {[UserRole.TEACHER, UserRole.MANAGER].map((r) => (
                                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                checked={selectedRoles.includes(r)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRoles([...selectedRoles, r]);
                                                    } else {
                                                        setSelectedRoles(selectedRoles.filter((item) => item !== r));
                                                    }
                                                }}
                                            />
                                            <span className="text-gray-700 capitalize">{r.toLowerCase()}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedRoles.length === 0 && (
                                    <p className="text-red-500 text-sm mt-1">Select at least one role</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {submitting ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
