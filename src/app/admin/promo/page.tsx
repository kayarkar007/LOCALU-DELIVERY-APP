"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

export default function AdminPromoPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [form, setForm] = useState({
        code: "", discountType: "percentage", discountValue: 0, minOrderAmount: 0, usageLimit: 0
    });

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        const res = await fetch("/api/admin/promo");
        const data = await res.json();
        if (data.success) setPromos(data.data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        const res = await fetch("/api/admin/promo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, usageLimit: form.usageLimit || undefined })
        });
        const data = await res.json();
        setIsCreating(false);
        if (data.success) {
            toast.success("Promo Code Created");
            setForm({ code: "", discountType: "percentage", discountValue: 0, minOrderAmount: 0, usageLimit: 0 });
            fetchPromos();
        } else {
            toast.error(data.error);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/admin/promo?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchPromos();
    }

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                <Tag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                Manage Promo Codes
            </h1>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Create New</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <input required type="text" placeholder="CODE" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl uppercase font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" />
                    <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl font-medium cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed ₹</option>
                    </select>
                    <input required type="number" placeholder="Discount Value" value={form.discountValue || ""} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" />
                    <input type="number" placeholder="Min Order" value={form.minOrderAmount || ""} onChange={e => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" />
                    <button disabled={isCreating} type="submit" className="bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center p-3 hover:bg-blue-700 transition">
                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-1" /> Add</>}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.map((p: any) => (
                    <div key={p._id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border dark:border-gray-800 shadow-sm relative group overflow-hidden">
                        <button onClick={() => handleDelete(p._id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full z-10">
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">{p.code}</h3>
                        <p className="text-gray-900 dark:text-gray-100 font-bold mb-3 text-lg border-b dark:border-gray-800 pb-3">{p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} FLAT OFF`}</p>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 space-y-2 mt-3">
                            <p className="flex justify-between"><span>Min Order:</span> <span className="text-gray-900 dark:text-gray-100">₹{p.minOrderAmount}</span></p>
                            <p className="flex justify-between"><span>Used:</span> <span className="text-gray-900 dark:text-gray-100">{p.usedCount} times {p.usageLimit ? `/ ${p.usageLimit} max` : ''}</span></p>
                            <p className="flex justify-between"><span>Status:</span> <span className={p.isActive ? "text-green-500 font-bold bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded" : "text-red-500 dark:text-red-400 font-bold"}>{p.isActive ? "Active" : "Inactive"}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
