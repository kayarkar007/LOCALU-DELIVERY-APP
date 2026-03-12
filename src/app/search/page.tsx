import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import Link from "next/link";
import { ArrowLeft, SearchX, ShoppingBag } from "lucide-react";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

export const revalidate = 0; // Disable static caching

async function performSearch(params: any) {
    try {
        await connectToDatabase();
        if (!params.q && !params.minPrice && !params.maxPrice) return [];

        let dbQuery: any = {};

        if (params.q) {
            const searchRegex = new RegExp(params.q, "i"); // Case-insensitive
            dbQuery.$or = [
                { name: searchRegex },
                { description: searchRegex }
            ];
        }

        if (params.minPrice || params.maxPrice) {
            dbQuery.price = {};
            if (params.minPrice) dbQuery.price.$gte = Number(params.minPrice);
            if (params.maxPrice) dbQuery.price.$lte = Number(params.maxPrice);
        }

        let sortOption: any = { createdAt: -1 };
        if (params.sort === 'price_asc') sortOption = { price: 1 };
        if (params.sort === 'price_desc') sortOption = { price: -1 };

        const products = await Product.find(dbQuery).sort(sortOption).lean();

        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string, minPrice?: string, maxPrice?: string, sort?: string }>
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams.q || "";

    const results = await performSearch(resolvedParams);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2 font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                            Search Results for "{query}"
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Found {results.length} item(s)</p>
                    </div>
                </div>

                {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <SearchX className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No results found</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-center max-w-md">
                            We couldn't find any items matching "{query}". Try checking your spelling or using more general terms.
                        </p>
                        <Link href="/" className="mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <div className="w-full lg:w-1/4">
                            <form action="/search" method="GET" className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 sticky top-24">
                                <input type="hidden" name="q" value={query} />

                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm tracking-wide uppercase">Sort By</h3>
                                    <select name="sort" defaultValue={resolvedParams.sort || ""} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
                                        <option value="">Relevance</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm tracking-wide uppercase">Price Range</h3>
                                    <div className="flex items-center gap-2">
                                        <input type="number" name="minPrice" placeholder="Min" defaultValue={resolvedParams.minPrice || ""} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl p-3 outline-none text-sm font-medium" />
                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                        <input type="number" name="maxPrice" placeholder="Max" defaultValue={resolvedParams.maxPrice || ""} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl p-3 outline-none text-sm font-medium" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                                    Apply Filters
                                </button>

                                {(resolvedParams.minPrice || resolvedParams.maxPrice || resolvedParams.sort) && (
                                    <Link href={`/search?q=${query}`} className="block text-center text-sm font-bold text-red-500 hover:text-red-600 mt-2">
                                        Clear Filters
                                    </Link>
                                )}
                            </form>
                        </div>

                        {/* Search Results Grid */}
                        <div className="w-full lg:w-3/4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {results.map((product: any) => (
                                <div key={product._id} className="bg-white dark:bg-gray-800 rounded-[2rem] p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:border-blue-900 transition-all duration-300 group flex flex-col h-full">
                                    <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50 dark:bg-gray-900">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                <ShoppingBag className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-4 line-clamp-1">{product.description}</p>

                                        <div className="mt-auto flex items-center justify-between gap-4">
                                            <div className="font-black text-lg text-gray-900 dark:text-white">
                                                ₹{product.price}
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 line-through ml-2 font-medium">₹{product.originalPrice}</span>
                                                )}
                                            </div>
                                            <AddToCartButton product={product} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
