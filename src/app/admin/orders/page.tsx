"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronDown, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = () => {
        fetch("/api/orders")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrders(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Order status updated!");
                fetchOrders(); // Refresh table
            } else {
                toast.error(data.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Manage Orders</h1>
                    <p className="text-gray-500 mt-2">Track and update customer delivery statuses.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5" /> {orders.length} Total
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                                <th className="p-4 pl-6 font-bold">Order Details</th>
                                <th className="p-4 font-bold hidden md:table-cell">Customer</th>
                                <th className="p-4 font-bold">Amount</th>
                                <th className="p-4 font-bold">Status Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4 pl-6 align-top">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 line-clamp-2 pr-4">
                                            {order.type === 'service'
                                                ? <span className="text-purple-600 font-bold">{order.serviceCategory || "Service Request"}</span>
                                                : order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(", ") || "No items"}
                                        </div>
                                    </td>

                                    <td className="p-4 align-top hidden md:table-cell">
                                        <p className="font-bold text-gray-900 text-sm mb-1">{order.customerName}</p>
                                        <p className="text-xs text-gray-500 mb-2">{order.customerPhone}</p>
                                        <a
                                            href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                                            target="_blank"
                                            referrerPolicy="no-referrer"
                                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                                        >
                                            <MapPin className="w-3 h-3" /> View Map
                                        </a>
                                    </td>

                                    <td className="p-4 align-top">
                                        <p className="font-black text-gray-900">₹{order.total}</p>
                                        <p className="text-xs text-gray-500 mt-1">{order.type === 'service' ? 'Service Request' : `${order.items?.length || 0} items`}</p>
                                    </td>

                                    <td className="p-4 align-top">
                                        <div className="relative inline-block w-40">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                disabled={updatingId === order._id}
                                                className={`appearance-none w-full border font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer outline-none transition-all disabled:opacity-50
                                                    ${order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700 focus:ring-green-100' :
                                                        order.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700 focus:ring-red-100' :
                                                            'bg-white border-gray-200 text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:bg-gray-50'}
                                                `}
                                            >
                                                <option value="pending">🟡 Pending</option>
                                                <option value="processing">📦 Processing</option>
                                                <option value="shipped">🚚 Shipped</option>
                                                <option value="delivered">✅ Delivered</option>
                                                <option value="cancelled">❌ Cancelled</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
