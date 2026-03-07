import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(MONGODB_URI as string);
        console.log("Connected successfully.");

        const adminEmail = "admin@localu.com";
        const adminPassword = "localu_admin123";

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin user already exists with email: ${adminEmail}`);
            process.exit(0);
        }

        console.log("Creating master admin account...");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
            name: "Master Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        });

        console.log("🎉 Master Admin created successfully!");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log("Please change this password immediately after logging in!");

    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();
