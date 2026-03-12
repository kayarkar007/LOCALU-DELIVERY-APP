import connectToDatabase from "@/lib/mongoose";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import ProductListing from "@/components/ProductListing";
import ServiceForm from "@/components/ServiceForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    await connectToDatabase();
    const category = await Category.findOne({ slug }).lean();

    if (!category) {
        notFound();
    }

    // Need to parse stringify because lean() still returns objects with ObjectIds which cant be passed to client components sometimes if we were passing the whole object, but here we just pass primitives.

    const categoryName = category.name as string;
    const categoryType = category.type as string;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-gray-800 px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full hover:shadow-md w-fit hover:-translate-x-1 duration-300">
                <ChevronLeft className="w-5 h-5" /> Back to Home
            </Link>

            <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{categoryName}</h1>
                <p className={`text-xs font-black uppercase tracking-widest mt-4 inline-block px-3 py-1.5 rounded-lg ${categoryType === "service" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    }`}>
                    {categoryType} Category
                </p>
            </div>

            {categoryType === "product" ? (
                <ProductListing categorySlug={slug} />
            ) : (
                <ServiceForm categoryName={categoryName} />
            )}
        </div>
    );
}
