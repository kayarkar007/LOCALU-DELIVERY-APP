import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import Link from "next/link";
import { ArrowLeft, SearchX, ShoppingBag } from "lucide-react";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

export const revalidate = 0; // Disable static caching

async function performSearch(query: string) {
    try {
        await connectToDatabase();
        if (!query) return [];

        const searchRegex = new RegExp(query, "i"); // Case-insensitive

        // Search in products by name or description
        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        }).lean();

        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    // Next.js 15: await searchParams
    const resolvedParams = await searchParams;
    const query = resolvedParams.q || "";

    const results = await performSearch(query);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-2 font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900">
                            Search Results for "{query}"
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Found {results.length} item(s)</p>
                    </div>
                </div>

                {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[2rem] shadow-sm border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <SearchX className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No results found</h2>
                        <p className="text-gray-500 font-medium text-center max-w-md">
                            We couldn't find any items matching "{query}". Try checking your spelling or using more general terms.
                        </p>
                        <Link href="/" className="mt-8 bg-gray-900 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {results.map((product: any) => (
                            <div key={product._id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                                <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            <ShoppingBag className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-4 line-clamp-1">{product.description}</p>

                                    <div className="mt-auto flex items-center justify-between gap-4">
                                        <div className="font-black text-lg text-gray-900">
                                            ₹{product.price}
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="text-xs text-gray-400 line-through ml-2 font-medium">₹{product.originalPrice}</span>
                                            )}
                                        </div>
                                        <AddToCartButton product={product} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
