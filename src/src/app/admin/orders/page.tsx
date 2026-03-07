"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, MapPin } from "lucide-react";

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
            setOrders(data.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <FileText className="text-blue-600" /> Recent Orders
                </h1>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="bg-white p-10 rounded-[2rem] border text-center text-gray-500 font-medium">
                            No orders found yet.
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    {/* General Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg ${order.type === "service"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {order.type} Order
                                            </span>
                                            <span className="text-gray-400 text-sm font-medium">
                                                {new Date(order.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mt-2">
                                            {order.customerName}
                                        </h3>
                                        <p className="text-gray-600 font-medium">
                                            Phone: <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">{order.customerPhone}</a>
                                        </p>
                                        <div className="flex items-start gap-2 text-gray-600 font-medium">
                                            <MapPin className="w-4 h-4 mt-1 shrink-0 text-red-500" />
                                            <p>
                                                {order.address} <br />
                                                <a
                                                    href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:underline text-sm inline-block mt-1"
                                                >
                                                    View on Maps
                                                </a>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="bg-gray-50 p-5 rounded-2xl md:w-1/2 flex-shrink-0 border border-gray-100">
                                        <h4 className="font-bold text-gray-900 border-b pb-2 mb-3 text-sm uppercase tracking-wider">
                                            Order Breakdown
                                        </h4>
                                        {order.type === "product" && order.items && (
                                            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                                                {order.items.map((item: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between text-sm font-medium text-gray-700 pb-2 border-b border-gray-100 last:border-0"
                                                    >
                                                        <span>
                                                            {item.name} <span className="text-gray-400">x{item.quantity}</span>
                                                        </span>
                                                        <span className="font-bold text-gray-900">
                                                            ₹{item.price * item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {order.type === "service" && order.serviceCategory && (
                                            <div className="space-y-2 mb-4">
                                                <p className="font-bold text-purple-700">
                                                    {order.serviceCategory}
                                                </p>
                                                <div className="text-sm font-medium text-gray-600 space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                                                    {Object.entries(order.serviceDetails || {}).map(
                                                        ([key, val]) => (
                                                            <p key={key}>
                                                                <span className="font-bold capitalize text-gray-800">
                                                                    {key.replace(/([A-Z])/g, " $1").trim()}:
                                                                </span>{" "}
                                                                {String(val)}
                                                            </p>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-1 text-sm font-medium text-gray-500 pt-2 border-t border-gray-200 mt-2">
                                            <div className="flex justify-between">
                                                <span>Items Subtotal</span>
                                                <span className="text-gray-900">₹{order.subtotal?.toFixed(2) || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Delivery & Platform & Tax</span>
                                                <span className="text-gray-900">
                                                    ₹
                                                    {(
                                                        (order.deliveryFee || 0) +
                                                        (order.platformFee || 0) +
                                                        (order.tax || 0)
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-lg font-black text-blue-600 pt-2">
                                                <span>Grand Total</span>
                                                <span>₹{order.total?.toFixed(2) || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
