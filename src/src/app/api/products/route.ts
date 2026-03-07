import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categorySlug = searchParams.get("categorySlug");

        await connectToDatabase();

        let query = {};
        if (categorySlug) {
            query = { categorySlug };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch products" },
            { status: 400 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const product = await Product.create(body);
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to create product" },
            { status: 400 }
        );
    }
}
