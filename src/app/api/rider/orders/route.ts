import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "rider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const includeStats = searchParams.get("stats") === "true";

        let orders;
        let stats = { completedToday: 0 };

        if (includeStats) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            stats.completedToday = await Order.countDocuments({
                riderId: session.user.id,
                deliveryStatus: "delivered",
                updatedAt: { $gte: startOfDay }
            });
        }

        orders = await Order.find({
            riderId: session.user.id,
            deliveryStatus: { $ne: "delivered" }
        }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: orders, stats });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "rider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, deliveryStatus, estimatedDeliveryTime } = await req.json();

        await connectToDatabase();

        const updateData: any = { deliveryStatus };
        if (estimatedDeliveryTime) {
            updateData.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
        }

        const order = await Order.findOneAndUpdate(
            { _id: orderId, riderId: session.user.id },
            updateData,
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found or not assigned to you" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: order });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
