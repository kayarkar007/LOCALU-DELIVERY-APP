"use client";

import { useState, useEffect } from "react";
import { CopyPlus, Plus, Loader2 } from "lucide-react";

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        type: "product",
    });

    const fetchCategories = async () => {
        setLoading(true);
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) setCategories(data.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            setFormData({ name: "", slug: "", type: "product" });
            setIsAdding(false);
            fetchCategories();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <CopyPlus className="text-blue-600" /> Categories
                </h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                >
                    {isAdding ? "Cancel" : <><Plus className="w-5 h-5" /> Add Category</>}
                </button>
            </div>

            {isAdding && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-6 animate-in slide-in-from-top-4"
                >
                    <h2 className="text-xl font-bold border-b pb-4">Add New Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                                    })
                                }
                                className="w-full border p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. Groceries"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full border p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. groceries"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full border p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-white"
                                required
                            >
                                <option value="product">Product based (Uses Cart)</option>
                                <option value="service">Service based (Uses Forms)</option>
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-gray-900 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-black transition-colors w-full md:w-auto"
                    >
                        Save Category
                    </button>
                </form>
            )}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-sm">
                                        Name
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-sm">
                                        Slug
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-sm">
                                        Type
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-black text-gray-900">{c.name}</td>
                                        <td className="p-5 text-gray-500 font-medium">{c.slug}</td>
                                        <td className="p-5">
                                            <span
                                                className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg inline-block ${c.type === "service"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {c.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-10 text-center text-gray-500 font-medium">
                                            No categories found. Click Add Category to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
