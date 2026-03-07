"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Loader2 } from "lucide-react";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        unit: "",
        categorySlug: "",
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

        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            setFormData({ name: "", price: "", unit: "", categorySlug: "" });
            setIsAdding(false);
            fetchData();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <ShoppingCart className="text-blue-600" /> Products
                </h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                >
                    {isAdding ? "Cancel" : <><Plus className="w-5 h-5" /> Add Product</>}
                </button>
            </div>

            {isAdding && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-6 animate-in slide-in-from-top-4"
                >
                    <h2 className="text-xl font-bold border-b pb-4">Add New Product</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. Tomatoes"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Price (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full border p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. 40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Unit</label>
                            <input
                                type="text"
                                required
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full border p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="e.g. 1 kg / 1 packet"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Category</label>
                            <select
                                value={formData.categorySlug}
                                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                                className="w-full border p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-white"
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
                    </div>
                    <button
                        type="submit"
                        className="bg-gray-900 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-black transition-colors w-full md:w-auto"
                    >
                        Save Product
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
                                        Price
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-sm">
                                        Unit
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-sm">
                                        Category
                                    </th>
                                    <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-sm">
                                        Stock
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-black text-gray-900">{p.name}</td>
                                        <td className="p-5 font-bold text-green-600">₹{p.price}</td>
                                        <td className="p-5 text-gray-500 font-medium">{p.unit}</td>
                                        <td className="p-5 text-gray-500 font-medium">{p.categorySlug}</td>
                                        <td className="p-5">
                                            <span
                                                className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg inline-block ${p.inStock
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {p.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-gray-500 font-medium">
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
