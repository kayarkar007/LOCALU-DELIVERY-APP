import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const user = await User.findOne({ email: session.user.email }).select("-password");

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
