"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import { Package, MapPin, Truck, CheckCircle, Navigation, Loader2, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const orderId = resolvedParams.id;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [eta, setEta] = useState<string>("Calculating...");
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        import("leaflet").then((leaflet) => {
            setL(leaflet);
        });
    }, []);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
                calculateETA(data.data);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 10000); // Polling every 10 seconds
        return () => clearInterval(interval);
    }, [orderId]);

    const calculateETA = (orderData: any) => {
        if (!orderData.riderLocation || !orderData.latitude || !orderData.longitude) {
            setEta("Location not available");
            return;
        }

        // Simple Haversine distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = (orderData.latitude - orderData.riderLocation.latitude) * Math.PI / 180;
        const dLon = (orderData.longitude - orderData.riderLocation.longitude) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(orderData.riderLocation.latitude * Math.PI / 180) * Math.cos(orderData.latitude * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        // Assuming average speed of 20km/h in city traffic
        const timeInMinutes = Math.round((distance / 20) * 60);
        
        if (timeInMinutes < 2) {
            setEta("Arriving soon!");
        } else {
            setEta(`${timeInMinutes + 2} - ${timeInMinutes + 5} mins`);
        }
    };

    if (loading || !L) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) {
        return <div className="p-8 text-center">Order not found.</div>;
    }

    const riderIcon = L ? new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
    }) : null;

    const userIcon = L ? new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
    }) : null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4"
                    >
                        <span className="w-10 h-[2px] bg-blue-600 rounded-full" /> Live Tracking
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        Track Your <br />
                        <span className="text-gradient">Happiness.</span>
                    </h1>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest pt-2">
                        Order <span className="text-blue-600">#{order._id.slice(-6).toUpperCase()}</span>
                    </p>
                </div>
                <div className="glass-card p-6 flex items-center gap-4 premium-shadow border-white/20 animate-float">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Delivery</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{eta}</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative bg-slate-100 dark:bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-950/20 border-4 border-white dark:border-slate-800 h-[600px] group">
                        {typeof window !== "undefined" && (
                            <MapContainer 
                                center={[order.latitude, order.longitude]} 
                                zoom={15} 
                                style={{ height: "100%", width: "100%", zIndex: 0 }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <Marker position={[order.latitude, order.longitude]} icon={userIcon}>
                                    <Popup>Delivery Address</Popup>
                                </Marker>
                                {order.riderLocation && (
                                    <Marker position={[order.riderLocation.latitude, order.riderLocation.longitude]} icon={riderIcon}>
                                        <Popup>Rider is here</Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        )}
                        <div className="absolute top-6 left-6 z-10 glass-card px-4 py-2 flex items-center gap-2 border-white/20">
                            <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Updates</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-8 md:p-10 border-white/20 premium-shadow rounded-[3rem]">
                        <h3 className="font-black text-slate-900 dark:text-white mb-10 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                             Journey <span className="w-2 h-2 rounded-full bg-blue-600" />
                        </h3>
                        <div className="space-y-12">
                            {[
                                { status: "pending", label: "Order Placed", icon: Package },
                                { status: "processing", label: "Restuarant Confirmed", icon: CheckCircle },
                                { status: "picked_up", label: "Picked Up", icon: Package },
                                { status: "out_for_delivery", label: "On the way", icon: Truck },
                                { status: "delivered", label: "Delivered", icon: CheckCircle },
                            ].map((step, index, array) => {
                                const isCompleted = ["pending", "processing", "shipped", "delivered"].indexOf(order.status) >= index || 
                                                  ["assigned", "picked_up", "out_for_delivery"].indexOf(order.deliveryStatus) + 1 >= index - 1;
                                
                                let active = false;
                                if (order.deliveryStatus === step.status) active = true;
                                if (order.status === step.status) active = true;

                                return (
                                    <div key={step.status} className="flex gap-6 items-start">
                                        <div className="relative flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                                                active ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110' :
                                                isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300'
                                            }`}>
                                                <step.icon className={`w-5 h-5 ${active ? 'animate-pulse' : ''}`} />
                                            </div>
                                            {index !== array.length - 1 && (
                                                <div className={`w-[2px] h-12 mt-2 rounded-full transition-colors duration-500 ${isCompleted ? 'bg-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800'}`} />
                                            )}
                                        </div>
                                        <div className="pt-2">
                                            <p className={`text-sm font-black uppercase tracking-widest transition-colors duration-500 ${active ? 'text-blue-600' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                                                {step.label}
                                            </p>
                                            {active && (
                                                <motion.p 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-[10px] font-bold text-blue-600/60 mt-1 uppercase"
                                                >
                                                    Current Status
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2.5rem] p-8 shadow-2xl transition-all"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-white/10 dark:bg-slate-900/10 p-3 rounded-2xl">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Priority Help</p>
                                <p className="font-black text-xl italic">+91 99999 88888</p>
                            </div>
                        </div>
                        <p className="text-xs opacity-70 leading-relaxed font-bold">
                            Our 24/7 dedicated support is ready to assist you with any concerns.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
