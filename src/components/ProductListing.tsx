"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import * as motion from "framer-motion/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductListing({ categorySlug }: { categorySlug: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { cart, addToCart, updateQuantity } = useCart();
    const { data: session } = useSession();
    const router = useRouter();

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
            <div className="py-20 text-center text-gray-500 animate-pulse font-medium">
                Loading products...
            </div>
        );

    if (products.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                <ShoppingCart className="w-16 h-16 mb-4 text-gray-200" />
                <p className="font-medium text-lg">No products found here.</p>
                <p className="text-sm mt-1">Check back later for new arrivals.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                }
            }}
        >
            {products.map((product) => {
                const cartItem = cart.find((i) => i.productId === product._id);

                return (
                    <motion.div
                        key={product._id}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                        }}
                        className="flex flex-col justify-between bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
                    >
                        <div className="relative w-full h-48 overflow-hidden bg-gray-50 border-b border-gray-100">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingCart className="w-12 h-12 text-gray-200" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="font-bold text-xl text-gray-900 leading-tight">
                                        {product.name}
                                    </h3>
                                </div>
                                <p className="text-sm font-medium text-gray-400 mt-2 bg-gray-50 inline-block px-2 py-1 rounded">
                                    Unit: {product.unit}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-50">
                                <div className="font-black text-2xl text-gray-900">
                                    ₹{product.price}
                                </div>

                                {!product.inStock ? (
                                    <span className="text-sm font-bold text-red-500 px-4 py-2 bg-red-50 rounded-xl">
                                        Out of Stock
                                    </span>
                                ) : cartItem ? (
                                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl p-1.5 shadow-sm">
                                        <button
                                            onClick={() =>
                                                updateQuantity(product._id, cartItem.quantity - 1)
                                            }
                                            className="p-1.5 bg-white shadow-sm hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="w-6 text-center font-bold text-gray-900">
                                            {cartItem.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(product._id, cartItem.quantity + 1)
                                            }
                                            className="p-1.5 bg-white shadow-sm hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            if (!session) {
                                                toast.error("Please login to order products.");
                                                router.push("/login");
                                                return;
                                            }
                                            addToCart({
                                                productId: product._id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                            });
                                            toast.success(`${product.name} added to cart`, {
                                                description: `₹${product.price} • ${product.unit}`,
                                                icon: '🛍️'
                                            });
                                        }}
                                        className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transform"
                                    >
                                        Add
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
