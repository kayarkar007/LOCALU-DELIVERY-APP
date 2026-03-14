"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Loader2 } from "lucide-react";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        unit: "",
        categorySlug: "",
        image: "",
        description: "",
    });

    const fetchData = async () => {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([
            fetch("/api/products"),
            fetch("/api/categories"),
        ]);

        const pData = await pRes.json();
        const cData = await cRes.json();

        if (pData.success) setProducts(pData.data);
        if (cData.success) {
            // Only show product categories for products
            setCategories(cData.data.filter((c: any) => c.type === "product"));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: Number(formData.price),
            inStock: true,
        };

        const url = editingId ? `/api/products/${editingId}` : "/api/products";
        const method = editingId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
        setFormData({ name: "", price: "", unit: "", categorySlug: "", image: "", description: "" });
            setIsAdding(false);
            setEditingId(null);
            fetchData();
        }
    };

    const handleEdit = (product: any) => {
        setFormData({
            name: product.name,
            price: product.price.toString(),
            unit: product.unit,
            categorySlug: product.categorySlug,
            image: product.image || "",
            description: product.description || "",
        });
        setEditingId(product._id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-[2rem] border dark:border-gray-800 shadow-sm">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <ShoppingCart className="text-blue-600 dark:text-blue-400" /> Products
                </h1>
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        if (isAdding) setEditingId(null);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 dark:shadow-blue-900/40"
                >
                    {isAdding ? "Cancel" : <><Plus className="w-5 h-5" /> Add Product</>}
                </button>
            </div>

            {isAdding && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm space-y-6 animate-in slide-in-from-top-4"
                >
                    <h2 className="text-xl font-bold border-b dark:border-gray-800 pb-4 dark:text-white">{editingId ? "Edit Product" : "Add New Product"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. Tomatoes"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Price (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. 40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Unit</label>
                            <input
                                type="text"
                                required
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. 1 kg / 1 packet"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                value={formData.categorySlug}
                                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                required
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c.slug}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Image URL</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Description (optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                                placeholder="Short product description shown on product cards..."
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-4 rounded-xl font-black text-lg hover:bg-black dark:hover:bg-white transition-colors w-full md:w-auto"
                    >
                        Save Product
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
                                        Price
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                                        Unit
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                                        Category
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                                        Stock
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {products.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-5">
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 text-xs text-center border dark:border-gray-700">
                                                    No Img
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 font-black text-gray-900 dark:text-white">{p.name}</td>
                                        <td className="p-5 font-bold text-green-600 dark:text-green-400">₹{p.price}</td>
                                        <td className="p-5 text-gray-500 dark:text-gray-400 font-medium">{p.unit}</td>
                                        <td className="p-5 text-gray-500 dark:text-gray-400 font-medium">{p.categorySlug}</td>
                                        <td className="p-5">
                                            <span
                                                className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg inline-block ${p.inStock
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    }`}
                                            >
                                                {p.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-bold transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p._id)}
                                                className="text-sm px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg font-bold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">
                                            No products found. Add a new product to list it here.
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
