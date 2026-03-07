"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { calculatePricing } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MapPin, Phone, User, CheckCircle2, Loader2, ArrowLeft, LocateFixed } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, cartTotal, clearCart } = useCart();
    const { data: session } = useSession();
    const pricing = calculatePricing(cartTotal);

    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [locating, setLocating] = useState(false);

    const [form, setForm] = useState({
        name: "",
        whatsapp: "",
        address: "",
        lat: 17.3850, // Default mock Hyderabad
        lng: 78.4867
    });

    useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }

        // Fetch user profile to auto-fill details
        fetch("/api/user/profile")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setForm(prev => ({
                        ...prev,
                        name: data.data.name || session.user.name || "",
                        whatsapp: data.data.whatsapp || "",
                        address: data.data.address || "",
                    }));
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

    }, [session, router]);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data && data.display_name) {
                        setForm(prev => ({
                            ...prev,
                            address: data.display_name,
                            lat: latitude,
                            lng: longitude
                        }));
                        toast.success("Location found!", { icon: "📍" });
                    } else {
                        toast.error("Could not fetch address details.");
                    }
                } catch (err) {
                    toast.error("Failed to connect to location services.");
                } finally {
                    setLocating(false);
                }
            },
            (error) => {
                toast.error("Please allow location access in your browser.");
                setLocating(false);
            }
        );
    };

    if (!cart.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
                    <Link href="/" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacingOrder(true);

        const orderData = {
            type: "product",
            userId: session?.user?.id,
            customerName: form.name,
            customerPhone: form.whatsapp,
            address: form.address,
            latitude: form.lat,
            longitude: form.lng,
            items: cart.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: pricing.subtotal,
            deliveryFee: pricing.deliveryFee,
            platformFee: pricing.platformFee,
            tax: pricing.tax,
            total: pricing.total
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            if (data.success) {
                clearCart();

                // Order API returns redirectUrl directly
                if (data.redirectUrl) {
                    window.open(data.redirectUrl, "_blank");
                }

                toast.success("Order Placed Successfully!", {
                    description: "Redirecting to WhatsApp to send details to the store...",
                    icon: '🎉'
                });

                // Ensure UI updates before redirect
                setTimeout(() => {
                    router.push("/profile");
                }, 1000);
            } else {
                toast.error(data.error || "Failed to place order.");
            }
        } catch (error) {
            toast.error("An error occurred while placing your order.");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Shopping
                </Link>

                <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Delivery Form */}
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Details</h2>

                        <form onSubmit={handlePlaceOrder} className="space-y-5">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <User className="w-4 h-4" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-200 text-gray-900 p-4 rounded-xl flex-1 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <Phone className="w-4 h-4" /> WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={form.whatsapp}
                                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                    className="w-full border border-gray-200 text-gray-900 p-4 rounded-xl flex-1 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-gray-50"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <MapPin className="w-4 h-4" /> Delivery Address
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleLocate}
                                        disabled={locating}
                                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 disabled:opacity-50 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                                    >
                                        {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                                        {locating ? "Locating..." : "Auto Locate"}
                                    </button>
                                </div>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    placeholder="Enter your full building and street address..."
                                    className="w-full border border-gray-200 text-gray-900 p-4 rounded-xl flex-1 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-gray-50 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={placingOrder}
                                className="w-full mt-4 bg-blue-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-lg shadow-blue-600/20"
                            >
                                {placingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Order"}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                            {cart.map((item) => (
                                <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</div>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm text-gray-500 font-medium border-t pt-6 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-gray-800">₹{pricing.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="text-gray-800">₹{pricing.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span className="text-gray-800">₹{pricing.platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (5%)</span>
                                <span className="text-gray-800">₹{pricing.tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center font-black text-2xl pt-4 border-t text-gray-900">
                            <span>Total</span>
                            <span className="text-blue-600">₹{pricing.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
