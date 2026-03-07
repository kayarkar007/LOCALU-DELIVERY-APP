import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { name, email, password, whatsapp } = await req.json();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "User already exists with this email." },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Build User - Defaults to 'user' role
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            whatsapp,
        });

        return NextResponse.json(
            { success: true, message: "User registered successfully!" },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to register user." },
            { status: 500 }
        );
    }
}
