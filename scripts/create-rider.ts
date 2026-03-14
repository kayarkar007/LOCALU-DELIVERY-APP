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
        whatsapp: { type: String, required: true },
        address: { type: String },
        role: {
            type: String,
            enum: ["user", "admin", "rider"],
            default: "user",
        },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedRider() {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(MONGODB_URI as string);
        console.log("Connected successfully.");

        const riderEmail = "rider@localu.com";
        const riderPassword = "rider_password123";

        const existingRider = await User.findOne({ email: riderEmail });

        if (existingRider) {
            console.log(`Rider user already exists with email: ${riderEmail}`);
            process.exit(0);
        }

        console.log("Creating default rider account...");
        const hashedPassword = await bcrypt.hash(riderPassword, 10);

        await User.create({
            name: "Default Rider",
            email: riderEmail,
            password: hashedPassword,
            whatsapp: "919999988888",
            address: "Localu Hub, City Center",
            role: "rider",
        });

        console.log("🎉 Rider account created successfully!");
        console.log(`Email: ${riderEmail}`);
        console.log(`Password: ${riderPassword}`);

    } catch (error) {
        console.error("Error seeding rider:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedRider();
