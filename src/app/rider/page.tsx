"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, MapPin, Truck, CheckCircle, Navigation, Loader2, PowerOff, Power, Bell, XCircle, RotateCcw, ShieldAlert, WifiOff, Activity } from "lucide-react";
import { toast } from "sonner";

export default function RiderDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSharingLocation, setIsSharingLocation] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [lastOrderIds, setLastOrderIds] = useState<Set<string>>(new Set());
    const [statsData, setStatsData] = useState({ completedToday: 0 });
    const [isOnline, setIsOnline] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const playNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const fetchOrders = async (silent = false) => {
        if (refreshing) return;
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await fetch(`/api/rider/orders?stats=true`);
            const data = await res.json();
            if (data.success && data.data) {
                const currentOrderIds = new Set<string>(data.data.map((o: any) => o._id as string));
                
                // Only notify if there's an ID we didn't see before
                const newOrders = data.data.filter((o: any) => !lastOrderIds.has(o._id));
                
                if (newOrders.length > 0 && lastOrderIds.size > 0) {
                    playNotificationSound();
                    toast.info(`New order assigned!`, {
                        description: `Order #${newOrders[0]._id.slice(-6).toUpperCase()} needs attention.`,
                        duration: 10000,
                    });
                }
                
                setOrders(data.data);
                setStatsData(data.stats);
                setLastOrderIds(currentOrderIds);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            if (!silent) toast.error("Could not load orders. Check your connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (session?.user.role === "rider") {
            fetchOrders();
            const interval = setInterval(() => fetchOrders(true), 20000); 
            return () => clearInterval(interval);
        }
    }, [session, lastOrderIds]);

    const startLocationSharing = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        const id = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await fetch("/api/rider/location", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ latitude, longitude })
                    });
                } catch (error) {
                    console.error("Error updating location:", error);
                }
            },
            (error) => {
                console.error("Geolocation error:", { code: error.code, message: error.message });
                let msg = "Failed to get location.";
                let isHardError = false;

                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location permission denied. Please enable GPS and allow site access.";
                    isHardError = true;
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = "Location info is unavailable. Check your device's GPS status.";
                } else if (error.code === error.TIMEOUT) {
                    msg = "Location request timed out. Trying to reconnect...";
                }
                
                toast.error(msg, { id: "geo-error" });
                
                if (isHardError) {
                    setIsSharingLocation(false);
                    if (watchId !== null) {
                        navigator.geolocation.clearWatch(watchId);
                        setWatchId(null);
                    }
                }
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );

        setWatchId(id);
        setIsSharingLocation(true);
        toast.success("Location sharing started");
    };

    const stopLocationSharing = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsSharingLocation(false);
        toast.info("Location sharing stopped");
    };

    const updateOrderStatus = async (orderId: string, deliveryStatus: string) => {
        try {
            const res = await fetch("/api/rider/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, deliveryStatus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Status updated to ${deliveryStatus}`);
                fetchOrders();
            } else {
                toast.error(data.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (status === "loading" || (loading && orders.length === 0)) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                </div>
                {[1, 2].map(i => (
                    <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            {!isOnline && (
                <div className="bg-red-600 text-white text-center py-2 px-4 rounded-xl mb-6 flex items-center justify-center gap-2 animate-bounce">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-bold">You are currently offline. Data may be outdated.</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            Dashboard
                            <button 
                                onClick={() => fetchOrders()}
                                disabled={refreshing}
                                className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition ${refreshing ? 'animate-spin' : ''}`}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">Welcome back, {session?.user.name}</p>
                    </div>
                </div>
                <button
                    onClick={isSharingLocation ? stopLocationSharing : startLocationSharing}
                    className={`flex items-center gap-3 px-6 py-4 rounded-3xl font-black transition-all shadow-lg ${
                        isSharingLocation 
                        ? "bg-red-50 text-red-600 border-2 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
                        : "bg-green-50 text-green-600 border-2 border-green-100 dark:bg-green-900/10 dark:border-green-900/30"
                    }`}
                >
                    {isSharingLocation ? (
                        <><PowerOff className="w-6 h-6" /> Stop Duty</>
                    ) : (
                        <><Power className="w-6 h-6" /> Start Duty</>
                    )}
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Active Tasks</p>
                    <p className="text-2xl font-black text-blue-600">{orders.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Completed Today</p>
                    <p className="text-2xl font-black text-green-600">{statsData.completedToday}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hidden sm:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Duty Status</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isSharingLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{isSharingLocation ? 'Live Tracking' : 'Offline'}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-full mb-6">
                            <Activity className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No active assignments</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Assignments will appear here automatically when admin links you to an order.</p>
                        <button 
                            onClick={() => fetchOrders()}
                            className="mt-8 text-blue-600 font-bold flex items-center gap-2 hover:underline"
                        >
                            <RotateCcw className="w-4 h-4" /> Refresh Status
                        </button>
                    </div>
                ) : (
                    orders.map((order) => {
                        const isNew = order.deliveryStatus === 'assigned';
                        
                        return (
                        <div key={order._id} className={`bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-xl border overflow-hidden relative transition-all ${
                            isNew ? "border-blue-500 ring-4 ring-blue-500/10" : "border-gray-100 dark:border-gray-800"
                        }`}>
                            {isNew && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
                            )}
                            <div className="absolute top-0 right-0 p-6">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                    order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.deliveryStatus === 'assigned' ? 'bg-blue-600 text-white animate-bounce' :
                                    order.deliveryStatus === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                    order.deliveryStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {order.deliveryStatus.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Order #{order._id.slice(-6).toUpperCase()}</p>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{order.customerName}</h3>
                                <p className="text-gray-500 text-sm">{order.customerPhone}</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex gap-3">
                                    <div className="mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">
                                        <MapPin className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Delivery Address</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium">{order.address}</p>
                                        <a 
                                            href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`} 
                                            target="_blank" 
                                            className="text-blue-600 text-xs font-bold hover:underline mt-1 inline-block"
                                        >
                                            Open in Google Maps
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">
                                        <Package className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Items</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                                            {order.type === 'service' 
                                                ? order.serviceCategory 
                                                : order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {order.deliveryStatus === "assigned" ? (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatus(order._id, "accepted")}
                                            className="col-span-1 flex flex-col items-center justify-center p-4 rounded-3xl bg-blue-600 hover:bg-blue-700 transition-all text-white group"
                                        >
                                            <CheckCircle className="w-6 h-6 mb-2" />
                                            <span className="text-[10px] font-black uppercase">Accept</span>
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus(order._id, "declined")}
                                            className="col-span-1 flex flex-col items-center justify-center p-4 rounded-3xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 transition-all group"
                                        >
                                            <XCircle className="w-6 h-6 mb-2" />
                                            <span className="text-[10px] font-black uppercase">Decline</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatus(order._id, "picked_up")}
                                            disabled={order.deliveryStatus !== "accepted"}
                                            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border border-transparent hover:border-blue-200 disabled:opacity-50 group px-2"
                                        >
                                            <Package className="w-6 h-6 mb-2 text-gray-400 group-hover:text-blue-500" />
                                            <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-600">Picked Up</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => updateOrderStatus(order._id, "out_for_delivery")}
                                            disabled={order.deliveryStatus !== "picked_up"}
                                            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all border border-transparent hover:border-orange-200 disabled:opacity-50 group px-2"
                                        >
                                            <Truck className="w-6 h-6 mb-2 text-gray-400 group-hover:text-orange-500" />
                                            <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-orange-600">Out for Delivery</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => updateOrderStatus(order._id, "delivered")}
                                            disabled={order.deliveryStatus !== "out_for_delivery"}
                                            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all border border-transparent hover:border-green-200 disabled:opacity-50 group px-2"
                                        >
                                            <CheckCircle className="w-6 h-6 mb-2 text-gray-400 group-hover:text-green-500" />
                                            <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-green-600">Delivered</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
