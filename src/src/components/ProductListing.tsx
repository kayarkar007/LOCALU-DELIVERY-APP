"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function ProductListing({ categorySlug }: { categorySlug: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { cart, addToCart, updateQuantity } = useCart();

    useEffect(() => {
        fetch(`/api/products?categorySlug=${categorySlug}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setProducts(data.data);
                setLoading(false);
            });
    }, [categorySlug]);

    if (loading)
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                    <div key={n} className="bg-gray-100 animate-pulse rounded-[2rem] h-[340px] w-full"></div>
                ))}
            </div>
        );

    if (products.length === 0) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-gray-500 bg-white rounded-[2rem] border border-dashed border-gray-300 shadow-sm">
                <ShoppingCart className="w-16 h-16 mb-4 text-gray-200" />
                <p className="font-medium text-xl">No products found here.</p>
                <p className="text-sm mt-2">Check back later for new arrivals.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
                const cartItem = cart.find((i) => i.productId === product._id);

                return (
                    <div
                        key={product._id}
                        className="group flex flex-col bg-white border border-gray-100 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                    <ShoppingCart className="w-10 h-10 text-gray-300" />
                                </div>
                            )}
                            {!product.inStock && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                    <span className="bg-red-500 text-white font-black text-sm px-4 py-2 rounded-full shadow-lg">
                                        Out of Stock
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                                    {product.unit}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <div className="font-black text-2xl text-gray-900">
                                    ₹{product.price}
                                </div>

                                {!product.inStock ? null : cartItem ? (
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 shadow-sm">
                                        <button
                                            onClick={() =>
                                                updateQuantity(product._id, cartItem.quantity - 1)
                                            }
                                            className="p-1.5 bg-white shadow-sm hover:shadow text-gray-700 rounded-xl transition-all hover:bg-gray-100 active:scale-95"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-6 text-center font-black text-gray-900">
                                            {cartItem.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(product._id, cartItem.quantity + 1)
                                            }
                                            className="p-1.5 bg-white shadow-sm hover:shadow text-gray-700 rounded-xl transition-all hover:bg-gray-100 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() =>
                                            addToCart({
                                                productId: product._id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                            })
                                        }
                                        className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:scale-95 transform"
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
