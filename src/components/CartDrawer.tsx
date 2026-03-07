"use client";

import { useCart } from "@/context/CartContext";
import { calculatePricing } from "@/lib/utils";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function CartDrawer({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { cart, updateQuantity, cartTotal } = useCart();
    const pricing = calculatePricing(cartTotal);
    const { data: session } = useSession();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-blue-600" /> Your Cart
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <p className="font-medium">Your cart is empty.</p>
                                    <p className="text-sm mt-1">Add some products to see them here.</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial="hidden"
                                    animate="show"
                                    variants={{
                                        hidden: {},
                                        show: { transition: { staggerChildren: 0.1 } }
                                    }}
                                    className="space-y-4"
                                >
                                    {cart.map((item) => (
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, x: 20 },
                                                show: { opacity: 1, x: 0 }
                                            }}
                                            key={item.productId}
                                            className="flex flex-col gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
                                        >
                                            <div className="flex justify-between font-semibold">
                                                <span className="text-gray-800">{item.name}</span>
                                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>₹{item.price} each</span>
                                                <div className="flex items-center gap-3 bg-gray-50 border rounded-xl p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        className="p-1 hover:bg-white hover:shadow-sm rounded transition-all"
                                                    >
                                                        <Minus className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                    <span className="w-5 text-center font-bold text-gray-800">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="p-1 hover:bg-white hover:shadow-sm rounded transition-all"
                                                    >
                                                        <Plus className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-5 bg-white border-t rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                                <div className="space-y-2 text-sm text-gray-500 font-medium mb-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-gray-800">₹{pricing.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Fee</span>
                                        <span className="text-gray-800">₹{pricing.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Platform Fee</span>
                                        <span className="text-gray-800">₹{pricing.platformFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (5%)</span>
                                        <span className="text-gray-800">₹{pricing.tax.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between font-black text-xl pt-3 border-t text-gray-900 mb-6">
                                    <span>Total</span>
                                    <span>₹{pricing.total.toFixed(2)}</span>
                                </div>
                                <Link
                                    href={session ? "/checkout" : "/login"}
                                    onClick={(e) => {
                                        onClose();
                                    }}
                                    className="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-transform hover:scale-[1.02] shadow-lg shadow-blue-600/30"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
