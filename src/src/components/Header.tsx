"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header({ onCartClick }: { onCartClick: () => void }) {
    const { cart } = useCart();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-100/50 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
            <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8 max-w-7xl">
                <Link
                    href="/"
                    className="flex items-center gap-2 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-300">
                        S
                    </div>
                    <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:opacity-80 transition-opacity">
                        SuperApp
                    </span>
                </Link>

                <div className="flex items-center gap-6 md:gap-8">
                    <Link
                        href="/admin"
                        className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors hidden md:block"
                    >
                        Admin Dashboard
                    </Link>
                    <button
                        onClick={onCartClick}
                        className="group relative flex items-center justify-center rounded-2xl p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 transition-all duration-300"
                    >
                        <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-600/40 ring-4 ring-white transition-transform group-hover:scale-110">
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
