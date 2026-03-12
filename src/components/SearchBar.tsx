"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className="relative w-full max-w-2xl mx-auto flex items-center"
        >
            <div className="absolute left-4 text-gray-400">
                <Search className="w-5 h-5" />
            </div>
            <input
                type="text"
                placeholder="Search for groceries, services, or medicines..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-200 rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
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
        </form>
    );
}
