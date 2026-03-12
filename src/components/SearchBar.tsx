"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                setIsOpen(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=5`);
                const data = await res.json();
                if (data.success) {
                    setResults(data.data);
                    setIsOpen(true);
                }
            } catch (e) {
                // Ignore
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form
            ref={wrapperRef}
            onSubmit={handleSearch}
            className="relative w-full max-w-2xl mx-auto flex items-center z-50"
        >
            <div className="absolute left-4 text-gray-400 dark:text-gray-500">
                <Search className="w-5 h-5" />
            </div>
            <input
                type="text"
                placeholder="Search for groceries, services, or medicines..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
            />
            <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-full transition-colors hidden sm:block shadow-sm shadow-blue-500/20"
            >
                Search
            </button>
            <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-full transition-colors sm:hidden shadow-sm shadow-blue-500/20"
            >
                <Search className="w-4 h-4" />
            </button>

            {/* Dropdown Auto-suggest */}
            {isOpen && query.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                    {loading ? (
                        <div className="flex items-center justify-center p-6 text-gray-400 dark:text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto p-2">
                            {results.map((product) => (
                                <li key={product._id}>
                                    <Link
                                        href={`/search?q=${encodeURIComponent(product.name)}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                                    >
                                        <div className="relative w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {product.image ? (
                                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <Store className="w-6 h-6 m-auto mt-3 text-gray-300 dark:text-gray-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{product.unit}</p>
                                        </div>
                                        <div className="text-sm font-black text-gray-900 dark:text-gray-100">
                                            ₹{product.price}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            <li className="p-2 pt-3 border-t border-gray-50 dark:border-gray-800 mt-1">
                                <button type="submit" className="w-full text-center text-sm font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
                                    View all results for "{query}"
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                            No products found matching "{query}"
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}
