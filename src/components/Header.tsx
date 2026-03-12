"use client";

import Link from "next/link";
import { ShoppingCart, LogOut, User as UserIcon, ShieldAlert, Package, Store } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import * as motion from "framer-motion/client";
import { useSession, signOut } from "next-auth/react";

export default function Header({ onCartClick }: { onCartClick: () => void }) {
    const { cart } = useCart();
    const { data: session } = useSession();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-sm">
                        <Store className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        LOCALU
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    {session ? (
                        <div className="flex items-center gap-2 mr-2">
                            {session.user.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
                                </Link>
                            )}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
                                <span className="text-xs font-bold text-gray-700">
                                    Hey, {session.user.name?.split(" ")[0]}
                                </span>
                            </div>
                            <Link
                                href="/profile"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                title="My Orders"
                            >
                                <Package className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline">My Orders</span>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mr-2">
                            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-black transition-colors px-2">
                                Log in
                            </Link>
                            <Link href="/signup" className="text-sm font-bold bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-md">
                                Sign up
                            </Link>
                        </div>
                    )}
                    <button
                        onClick={onCartClick}
                        className="relative flex items-center justify-center rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <ShoppingCart className="h-5 w-5 text-gray-800" />
                        {itemCount > 0 && (
                            <motion.span
                                key={itemCount}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm shadow-red-500/50"
                            >
                                {itemCount}
                            </motion.span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
