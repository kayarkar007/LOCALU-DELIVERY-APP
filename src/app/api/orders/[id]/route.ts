import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { status } = await req.json();

        // Validate Status Enum
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        await connectToDatabase();

        const updatedOrder = await Order.findByIdAndUpdate(
            resolvedParams.id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedOrder }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
