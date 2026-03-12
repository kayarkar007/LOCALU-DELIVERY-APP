"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Package, LogOut, Loader2, ArrowLeft, CheckCircle2, Truck, Clock, Wallet, Star, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [reviewOrder, setReviewOrder] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            // Fetch User Details
            fetch("/api/user/profile")
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setProfile(data.data);
                    }
                });

            // Fetch User Orders
            fetch(`/api/orders?userId=${session.user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrders(data.data);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));

            fetch("/api/reviews/user")
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setReviews(data.data);
                    }
                });
        }
    }, [status, session, router]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: reviewOrder, rating, comment })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Review submitted successfully!");
                setReviews([...reviews, data.data]);
                setReviewOrder(null);
                setRating(5);
                setComment("");
            } else {
                toast.error(data.error || "Failed to submit review");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar / Profile Card */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center sticky top-8 transition-colors">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">
                                {session?.user?.name?.charAt(0)}
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">{session?.user?.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{session?.user?.email}</p>

                            <div className="space-y-4 text-left">
                                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <Wallet className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Localu Wallet</p>
                                        <p className="text-xl font-black text-blue-600">₹{profile?.walletBalance?.toFixed(2) || "0.00"}</p>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Use this balance during checkout</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">WhatsApp</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.whatsapp || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Saved Address</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                                            {profile?.address || "No address saved. It will be saved from your next order!"}
                                        </p>
                                    </div>
                                </div>
                                <Link href="/profile/wishlist" className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors rounded-2xl group cursor-pointer block text-left">
                                    <Heart className="w-5 h-5 text-red-500 mt-0.5 group-hover:scale-110 transition-transform fill-red-500" />
                                    <div>
                                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">My Wishlist</p>
                                        <p className="text-sm font-medium text-red-900 dark:text-red-400 leading-relaxed">
                                            View your saved favorite products
                                        </p>
                                    </div>
                                </Link>
                            </div>

                            <button
                                onClick={() => signOut()}
                                className="w-full mt-8 flex items-center justify-center gap-2 text-red-600 font-bold p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Main Content / Orders */}
                    <div className="w-full md:w-2/3">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" /> My Orders
                        </h2>

                        {orders.length === 0 ? (
                            <div className="bg-white dark:bg-gray-900 p-12 text-center rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700">
                                <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't placed any orders. Start exploring local stores!</p>
                                <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                                    Browse Products
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => {
                                    const statusList = ["pending", "processing", "shipped", "delivered"];
                                    const currentStatusIndex = statusList.indexOf(order.status) !== -1 ? statusList.indexOf(order.status) : 0;
                                    const isCancelled = order.status === "cancelled";
                                    const hasReviewed = reviews.some(r => r.orderId === order._id);

                                    return (
                                        <div key={order._id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 transition-all flex flex-col gap-6">

                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-black tracking-widest rounded-lg">
                                                            #ORD-{order._id.slice(-6).toUpperCase()}
                                                        </span>
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                            order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                                'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                                            }`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                    <div className="mt-2 inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-100 dark:border-gray-700">
                                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                            {order.paymentMethod === 'upi' ? 'Paid via UPI' : 'Cash on Delivery'}
                                                        </span>
                                                        {order.transactionId && (
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                                                Txn: {order.transactionId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Beautiful Status Tracker */}
                                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
                                                <div className="relative flex justify-between">
                                                    {/* Connecting Line */}
                                                    <div className="absolute left-0 top-1/2 -mt-0.5 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full z-0"></div>

                                                    {isCancelled ? (
                                                        <div className="w-full flex justify-center z-10">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center border-4 border-gray-50 dark:border-gray-800">
                                                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-red-600 tracking-wide uppercase">Order Cancelled</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        statusList.map((step, idx) => {
                                                            const isCompleted = idx <= currentStatusIndex;
                                                            const isActive = idx === currentStatusIndex;

                                                            let Icon = Clock;
                                                            if (step === 'processing') Icon = Package;
                                                            if (step === 'shipped') Icon = Truck;
                                                            if (step === 'delivered') Icon = CheckCircle2;

                                                            return (
                                                                <div key={step} className="flex flex-col items-center gap-2 z-10 w-1/4">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-gray-50 dark:border-gray-800 transition-colors ${isCompleted ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700'
                                                                        } ${isActive ? 'ring-4 ring-blue-100 dark:ring-blue-900/30' : ''}`}>
                                                                        {isCompleted ? <Icon className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>}
                                                                    </div>
                                                                    <span className={`text-[10px] sm:text-xs font-bold tracking-wide uppercase text-center ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                                                                        }`}>
                                                                        {step}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })
                                                    )}

                                                    {/* Active Line Progress overlay */}
                                                    {!isCancelled && (
                                                        <div
                                                            className="absolute left-0 top-1/2 -mt-0.5 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
                                                            style={{ width: `${(currentStatusIndex / (statusList.length - 1)) * 100}%` }}
                                                        ></div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Order Details */}
                                            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-white dark:bg-gray-900 space-y-3">
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Order Summary</p>
                                                {order.type === 'service' ? (
                                                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 space-y-2">
                                                        <p><span className="font-bold text-gray-900 dark:text-white">Service:</span> {order.serviceCategory || "Service Request"}</p>
                                                        {order.serviceDetails && Object.entries(order.serviceDetails).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between">
                                                                <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                                <span className="font-medium text-gray-900 dark:text-white">{String(v)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    order.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-sm sm:text-base">
                                                            <span className="text-gray-600 dark:text-gray-300 flex gap-3">
                                                                <span className="font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{item.quantity}x</span>
                                                                {item.name || "Unknown Item"}
                                                            </span>
                                                            <span className="font-bold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))
                                                )}

                                                <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                                                    <span className="font-bold text-gray-500 dark:text-gray-400">Total Paid</span>
                                                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">₹{order.total}</span>
                                                </div>
                                            </div>

                                            {/* Review Section */}
                                            {order.status === "delivered" && !hasReviewed && reviewOrder !== order._id && (
                                                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                                                    <button
                                                        onClick={() => setReviewOrder(order._id)}
                                                        className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Star className="w-4 h-4" /> Write a Review
                                                    </button>
                                                </div>
                                            )}

                                            {hasReviewed && (
                                                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1 bg-green-50 dark:bg-green-900/20 py-2 rounded-xl">
                                                        <CheckCircle2 className="w-4 h-4" /> You've reviewed this order
                                                    </p>
                                                </div>
                                            )}

                                            {reviewOrder === order._id && (
                                                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Rate Your Order</h4>
                                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                                        <div className="flex gap-2 justify-center">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setRating(star)}
                                                                    className={`p-2 rounded-full transition-colors ${rating >= star ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200 dark:hover:text-yellow-400/50'}`}
                                                                >
                                                                    <Star className="w-8 h-8 fill-current" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            value={comment}
                                                            onChange={e => setComment(e.target.value)}
                                                            placeholder="Share your experience (optional)..."
                                                            className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none resize-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setReviewOrder(null)}
                                                                className="flex-1 py-3 font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={submittingReview}
                                                                className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}

                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
