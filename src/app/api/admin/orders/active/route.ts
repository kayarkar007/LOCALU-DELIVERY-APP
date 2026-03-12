import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

export async function GET() {
    try {
        await connectToDatabase();
        // Fetch orders that are pending, processing, or shipped
        const activeOrders = await Order.find({
            status: { $in: ["pending", "processing", "shipped"] }
        }).sort({ createdAt: -1 }).lean();

        // Convert coordinates to numbers and ensure they exist
        const mapData = activeOrders.map(order => ({
            id: order._id,
            status: order.status,
            customerName: order.customerName,
            address: order.address,
            phone: order.customerPhone,
            total: order.total,
            items: order.items?.length || 0,
            time: new Date(order.createdAt).toLocaleTimeString(),
            lat: Number(order.latitude),
            lng: Number(order.longitude)
        })).filter(order => !isNaN(order.lat) && !isNaN(order.lng));

        return NextResponse.json({ success: true, data: mapData });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
