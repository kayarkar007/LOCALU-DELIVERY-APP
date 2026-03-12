"use client";

import { useState, useEffect } from "react";
import { CopyPlus, Plus, Loader2 } from "lucide-react";

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        type: "product",
        image: "",
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
        const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
        const method = editingId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            setFormData({ name: "", slug: "", type: "product", image: "" });
            setIsAdding(false);
            setEditingId(null);
            fetchCategories();
        }
    };

    const handleEdit = (category: any) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            type: category.type,
            image: category.image || "",
        });
        setEditingId(category._id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (res.ok) fetchCategories();
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-[2rem] border dark:border-gray-800 shadow-sm">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <CopyPlus className="text-blue-600 dark:text-blue-400" /> Categories
                </h1>
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        if (isAdding) setEditingId(null);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 dark:shadow-blue-900/40"
                >
                    {isAdding ? "Cancel" : <><Plus className="w-5 h-5" /> Add Category</>}
                </button>
            </div>

            {isAdding && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm space-y-6 animate-in slide-in-from-top-4"
                >
                    <h2 className="text-xl font-bold border-b dark:border-gray-800 pb-4 dark:text-white">{editingId ? "Edit Category" : "Add New Category"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Name</label>
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
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. Groceries"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. groceries"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                required
                            >
                                <option value="product">Product based (Uses Cart)</option>
                                <option value="service">Service based (Uses Forms)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Image URL</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-4 rounded-xl font-black text-lg hover:bg-black dark:hover:bg-white transition-colors w-full md:w-auto"
                    >
                        Save Category
                    </button>
                </form>
            )}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] border dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                                <tr>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm w-16">
                                        Image
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                                        Name
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                                        Slug
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                                        Type
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {categories.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-5">
                                            {c.image ? (
                                                <img src={c.image} alt={c.name} className="w-12 h-12 object-cover rounded-xl" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 text-xs text-center border dark:border-gray-700">
                                                    No Img
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 font-black text-gray-900 dark:text-white">{c.name}</td>
                                        <td className="p-5 text-gray-500 dark:text-gray-400 font-medium">{c.slug}</td>
                                        <td className="p-5">
                                            <span
                                                className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg inline-block ${c.type === "service"
                                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    }`}
                                            >
                                                {c.type}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-bold transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c._id)}
                                                className="text-sm px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg font-bold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">
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
