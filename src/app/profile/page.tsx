"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Package, LogOut, Loader2, ArrowLeft, CheckCircle2, Truck, Clock, Wallet, Star, Heart, Navigation, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

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

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        setCancellingOrder(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "cancelled", deliveryStatus: "cancelled" } : o));
                toast.success("Order cancelled successfully.");
            } else {
                toast.error(data.error || "Failed to cancel order.");
            }
        } catch {
            toast.error("Error cancelling order.");
        } finally {
            setCancellingOrder(null);
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
        <div className="min-h-screen bg-white dark:bg-slate-950 py-10 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all mb-10 font-black uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-4 h-4" /> Back to Store
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar / Profile Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-1/3"
                    >
                        <div className="glass-card p-10 border-white/20 premium-shadow rounded-[3.5rem] text-center sticky top-24">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl font-black shadow-2xl shadow-blue-500/40">
                                    {session?.user?.name?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{session?.user?.name}</h2>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">{session?.user?.email}</p>

                            <div className="space-y-4 text-left">
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800/50 group hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="bg-blue-600 text-white p-2.5 rounded-2xl">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localu Wallet</p>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                        <span className="text-blue-600 text-xl italic mr-1">₹</span>
                                        <span className="text-gradient">{profile?.walletBalance?.toFixed(0) || "0"}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Phone className="w-3 h-3" /> WhatsApp
                                        </p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {profile?.whatsapp || "NOT LINKED"}
                                        </p>
                                    </div>
                                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> Default Address
                                        </p>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                            {profile?.address || "Will be saved automatically on next order"}
                                        </p>
                                    </div>
                                </div>

                                <Link href="/profile/wishlist" className="flex items-center justify-between p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-3xl group transition-all hover:bg-rose-100 dark:hover:bg-rose-900/20">
                                    <div className="flex items-center gap-4">
                                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500 group-hover:scale-125 transition-transform" />
                                        <span className="font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest text-xs">My Favorites</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-rose-500 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <button
                                onClick={() => signOut()}
                                className="w-full mt-10 flex items-center justify-center gap-3 text-slate-400 font-black p-5 rounded-2xl hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all uppercase tracking-widest text-[10px]"
                            >
                                <LogOut className="w-4 h-4" /> Secure Sign Out
                            </button>
                        </div>
                    </motion.div>

                    {/* Main Content / Orders */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full lg:w-2/3 space-y-10"
                    >
                        <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
                                <Package className="w-10 h-10 text-blue-600" /> Recent <span className="text-gradient">Orders</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{orders.length} total</p>
                        </div>

                        {orders.length === 0 ? (
                            <div className="glass-card p-20 text-center border-white/20 premium-shadow rounded-[3rem]">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Package className="w-12 h-12 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No past orders</h3>
                                <p className="text-slate-400 font-bold mb-10 max-w-xs mx-auto text-sm uppercase tracking-tight">Your order history is empty. Let's find something delicious!</p>
                                <Link href="/" className="inline-block bg-blue-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-700 transition-all uppercase tracking-widest text-xs shadow-xl shadow-blue-500/40">
                                    Start Browsing
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {orders.map((order, index) => {
                                    const statusList = ["pending", "processing", "shipped", "delivered"];
                                    const currentStatusIndex = statusList.indexOf(order.status) !== -1 ? statusList.indexOf(order.status) : 0;
                                    const isCancelled = order.status === "cancelled";
                                    const hasReviewed = reviews.some(r => r.orderId === order._id);

                                    return (
                                        <motion.div 
                                            key={order._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="glass-card p-8 md:p-10 border-white/20 premium-shadow rounded-[3rem] group hover:border-blue-500/30 transition-all overflow-hidden relative"
                                        >
                                            {/* Decorative Background Element */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />

                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-10 relative z-10">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1 text-[10px] font-black tracking-[0.2em] rounded-lg uppercase shadow-lg">
                                                            #ORD-{order._id.slice(-6).toUpperCase()}
                                                        </span>
                                                        <span className={`px-4 py-1 text-[10px] font-black rounded-lg uppercase tracking-tight ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                            order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        Arrived on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex flex-col items-end gap-2">
                                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                                        <span className="text-blue-600 text-xl italic mr-1">₹</span>{order.total}
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                                        {order.paymentMethod === 'upi' ? 'Secure UPI' : 'COD'} · {order.items?.length || 0} ITEMS
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Order Progress */}
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-10 relative">
                                                <div className="relative flex justify-between h-12 items-center">
                                                    {/* Progress Line Track */}
                                                    <div className="absolute left-[12.5%] right-[12.5%] top-1/2 -mt-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        {!isCancelled && (
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(currentStatusIndex / (statusList.length - 1)) * 100}%` }}
                                                                className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                                                            />
                                                        )}
                                                    </div>

                                                    {isCancelled ? (
                                                        <div className="w-full flex justify-center z-10">
                                                            <div className="bg-rose-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/30">
                                                                Order Terminated
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
                                                                <div key={step} className="flex flex-col items-center gap-3 z-10 w-1/4">
                                                                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border-4 border-white dark:border-slate-900 transition-all duration-500 ${isCompleted ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
                                                                        } ${isActive ? 'ring-8 ring-blue-500/10' : ''}`}>
                                                                        <Icon className="w-5 h-5" />
                                                                    </div>
                                                                    <span className={`text-[8px] sm:text-[10px] font-black tracking-widest uppercase transition-colors ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'
                                                                        }`}>
                                                                        {step}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {["processing", "shipped"].includes(order.status) && (
                                                    <Link 
                                                        href={`/track/${order._id}`}
                                                        className="flex-1 bg-blue-600 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                                                    >
                                                        <Navigation className="w-4 h-4" /> Live Tracking
                                                    </Link>
                                                )}
                                                
                                                {order.status === "delivered" && !hasReviewed && reviewOrder !== order._id && (
                                                    <button
                                                        onClick={() => setReviewOrder(order._id)}
                                                        className="flex-1 bg-amber-50 dark:bg-amber-900/10 text-amber-600 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-100 transition-all flex items-center justify-center gap-2 border border-amber-100 dark:border-amber-900/20"
                                                    >
                                                        <Star className="w-4 h-4" /> Rate Experience
                                                    </button>
                                                )}

                                                {/* ✅ Feature: Cancel Order button for pending orders */}
                                                {order.status === "pending" && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        disabled={cancellingOrder === order._id}
                                                        className="flex-1 bg-rose-50 dark:bg-rose-900/10 text-rose-600 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/20 disabled:opacity-50"
                                                    >
                                                        {cancellingOrder === order._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Order"}
                                                    </button>
                                                )}

                                                <button className="flex-1 bg-slate-50 dark:bg-slate-900/50 text-slate-400 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-800/50">
                                                    Need Help?
                                                </button>
                                            </div>

                                            {/* Expandable Review Form */}
                                            <AnimatePresence>
                                                {reviewOrder === order._id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-10 overflow-hidden"
                                                    >
                                                        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 space-y-8">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Review Order</h4>
                                                                <button onClick={() => setReviewOrder(null)} className="text-rose-500 font-black text-[10px] uppercase tracking-widest">Discard</button>
                                                            </div>

                                                            <div className="flex gap-4 justify-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800/20 shadow-inner">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <button
                                                                        key={star}
                                                                        type="button"
                                                                        onClick={() => setRating(star)}
                                                                        className={`p-3 rounded-2xl transition-all ${rating >= star ? 'bg-amber-100 text-amber-500 scale-110 shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-slate-800 text-slate-200'}`}
                                                                    >
                                                                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                                                <textarea
                                                                    value={comment}
                                                                    onChange={e => setComment(e.target.value)}
                                                                    placeholder="Describe your delivery experience..."
                                                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] text-sm focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none resize-none font-bold placeholder:italic shadow-inner"
                                                                    rows={4}
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={submittingReview}
                                                                    className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] rounded-3xl hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                                >
                                                                    {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Review"}
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </div>
    );

}
