import { ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const dynamic = 'force-dynamic';

async function getStats() {
    await connectToDatabase();
    const productsCount = await Product.countDocuments();
    const categoriesCount = await Category.countDocuments();

    // Fetch all orders to calculate detailed stats
    const allOrders = await Order.find({});
    const ordersCount = allOrders.length;

    // Calculate total revenue (only from delivered orders)
    const totalRevenue = allOrders
        .filter(order => order.status === "delivered")
        .reduce((sum, order) => sum + (order.total || 0), 0);

    // Count by statuses
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;
    const processingOrders = allOrders.filter(o => o.status === "processing").length;
    const shippedOrders = allOrders.filter(o => o.status === "shipped").length;

    return {
        ordersCount,
        productsCount,
        categoriesCount,
        totalRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                        <LayoutDashboard className="w-8 h-8" />
                    </div>
                    Admin Dashboard
                </h1>
                <p className="text-lg text-gray-500 font-medium pl-2">
                    Manage your super app seamlessly. Here's what's happening today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-6 rounded-3xl border border-blue-800 shadow-md flex flex-col justify-between col-span-1 md:col-span-2">
                    <div>
                        <p className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-2">Total Revenue Generated</p>
                        <h2 className="text-5xl font-black">₹{stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h2>
                        <p className="text-blue-300 text-sm mt-2">From delivered orders only</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Pending Orders</p>
                        <h2 className="text-5xl font-black text-orange-500">{stats.pendingOrders}</h2>
                    </div>
                    <Link
                        href="/admin/orders"
                        className="mt-6 flex items-center justify-between text-blue-600 font-bold hover:text-blue-800 transition-colors"
                    >
                        Action Required <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Total Orders</p>
                        <h2 className="text-5xl font-black text-gray-900">{stats.ordersCount}</h2>
                    </div>
                    <Link
                        href="/admin/orders"
                        className="mt-6 flex items-center justify-between text-blue-600 font-bold hover:text-blue-800 transition-colors"
                    >
                        View All <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Total Categories</p>
                        <h2 className="text-4xl font-black text-gray-900">{stats.categoriesCount}</h2>
                    </div>
                    <Link
                        href="/admin/categories"
                        className="mt-6 flex items-center justify-between text-blue-600 font-bold hover:text-blue-800 transition-colors"
                    >
                        Manage <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Total Products</p>
                        <h2 className="text-4xl font-black text-gray-900">{stats.productsCount}</h2>
                    </div>
                    <Link
                        href="/admin/products"
                        className="mt-6 flex items-center justify-between text-blue-600 font-bold hover:text-blue-800 transition-colors"
                    >
                        Manage <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
