"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { calculatePricing } from "@/lib/utils";
import { getCurrentLocation } from "@/lib/geolocation";
import { Loader2, MapPin, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const pricing = calculatePricing(cartTotal);

    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
    const [error, setError] = useState("");

    const handleCustomerChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const location = await getCurrentLocation();

            const payload = {
                type: "product",
                items: cart,
                customerName: customer.name,
                customerPhone: customer.phone,
                address: customer.address,
                latitude: location.latitude,
                longitude: location.longitude,
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            clearCart();
            window.location.href = data.redirectUrl;
        } catch (err: any) {
            setError(
                err.message || "Please ensure location is enabled and try again."
            );
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm max-w-2xl mx-auto my-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                </div>
                <p className="font-black text-2xl text-gray-800">Your cart is empty.</p>
                <p className="text-gray-500 mt-2 font-medium">
                    Looks like you haven't added anything yet.
                </p>
                <Link
                    href="/"
                    className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white px-5 py-2.5 border border-gray-200 rounded-full hover:shadow-md w-fit hover:-translate-x-1 duration-300 mb-8"
            >
                <ArrowLeft className="w-5 h-5" /> Continue Shopping
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Form */}
                <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8"
                >
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Checkout</h2>
                        <p className="text-gray-500 font-medium border-b-2 border-gray-100 pb-6">
                            Please enter your delivery details to complete the order.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={customer.name}
                                onChange={handleCustomerChange}
                                required
                                className="w-full border border-gray-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Phone Number (WhatsApp)
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={customer.phone}
                                onChange={handleCustomerChange}
                                required
                                className="w-full border border-gray-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                                placeholder="+91 99999 99999"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Complete Address
                            </label>
                            <textarea
                                name="address"
                                value={customer.address}
                                onChange={handleCustomerChange}
                                required
                                className="w-full border border-gray-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all h-32 font-medium text-gray-900"
                                placeholder="House Number, Street, Landmark..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-3 bg-blue-600 text-white font-black text-lg py-5 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 active:scale-[0.98] transform disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" /> Processing Order...
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-6 h-6" /> Place Order & Share GPS
                                </>
                            )}
                        </button>
                        <p className="text-xs text-center text-gray-400 font-medium mt-4">
                            We require your GPS location to provide accurate delivery. Your browser
                            will prompt for permission.
                        </p>
                    </div>
                </form>

                {/* Right Summary */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24 bg-gray-900 text-white p-8 rounded-[2rem] shadow-2xl space-y-8 h-fit">
                        <h3 className="text-2xl font-black">Order Summary</h3>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex justify-between items-center text-sm font-medium border-b border-gray-800 pb-4"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-gray-100 text-base">{item.name}</span>
                                        <span className="text-gray-400">Qty: {item.quantity}</span>
                                    </div>
                                    <span className="font-bold text-gray-50 text-base">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 text-sm font-medium text-gray-400">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{pricing.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>₹{pricing.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span>₹{pricing.platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (5%)</span>
                                <span>₹{pricing.tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-gray-800 text-xl font-black text-white">
                            <span>Total to Pay</span>
                            <span className="text-blue-400">₹{pricing.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
