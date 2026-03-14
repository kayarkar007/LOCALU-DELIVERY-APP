import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "rider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { latitude, longitude } = await req.json();

        if (latitude === undefined || longitude === undefined) {
            return NextResponse.json({ success: false, error: "Missing coordinates" }, { status: 400 });
        }

        await connectToDatabase();

        // Update rider's current location in User model
        await User.findByIdAndUpdate(session.user.id, {
            currentLocation: {
                latitude,
                longitude,
                updatedAt: new Date()
            }
        });

        // Update rider location in all active orders assigned to this rider
        await Order.updateMany(
            { riderId: session.user.id, deliveryStatus: { $in: ["assigned", "picked_up", "out_for_delivery"] } },
            {
                riderLocation: {
                    latitude,
                    longitude
                }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating location:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
