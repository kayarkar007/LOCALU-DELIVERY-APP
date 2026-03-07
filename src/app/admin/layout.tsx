import Link from "next/link";
import { CopyPlus, LayoutDashboard, ShoppingCart, FileText, ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans selection:bg-blue-200">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <div className="p-6 border-b flex flex-col gap-4">
                    <Link
                        href="/"
                        className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-bold transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to App
                    </Link>
                    <Link
                        href="/admin"
                        className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                    >
                        LOCALU - Admin Panel
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 p-4 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl font-bold transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link
                        href="/admin/categories"
                        className="flex items-center gap-3 p-4 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl font-bold transition-colors"
                    >
                        <CopyPlus className="w-5 h-5" /> Categories
                    </Link>
                    <Link
                        href="/admin/products"
                        className="flex items-center gap-3 p-4 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl font-bold transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" /> Products
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 p-4 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl font-bold transition-colors"
                    >
                        <FileText className="w-5 h-5" /> Orders
                    </Link>
                </nav>
                <div className="p-6 border-t bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            A
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Admin User</p>
                            <p className="text-xs text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">admin@superapp.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
                <div className="max-w-6xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
