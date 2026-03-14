"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Search, ShoppingBag, User, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    let navItems = [
        { label: "Home", icon: Home, href: "/" },
        { label: "Search", icon: Search, href: "/search" },
        { label: "Orders", icon: ShoppingBag, href: "/profile" },
        { label: "Profile", icon: "/profile", iconComp: User, href: "/profile" },
    ];

    if (session?.user.role === "rider") {
        navItems = [
            { label: "Dashboard", icon: Truck, href: "/rider" },
            { label: "Orders", icon: ShoppingBag, href: "/profile" },
            { label: "Profile", icon: User, href: "/profile" },
        ];
    }

    // Hide mobile nav in admin routes
    if (pathname.startsWith("/admin")) return null;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl border-t border-white/10 pb-safe rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-around h-20 px-4">
                {navItems.map((item) => {
                    const Icon = item.iconComp || item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-500",
                                isActive 
                                    ? "text-blue-600 dark:text-blue-400 -translate-y-2" 
                                    : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-2xl transition-all duration-500",
                                isActive && "bg-blue-600 text-white shadow-lg shadow-blue-500/40"
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.1em] transition-all",
                                isActive ? "opacity-100" : "opacity-60"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div 
                                    layoutId="nav-dot"
                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_10px_#2563eb]" 
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
