import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

const OrderSchema = new mongoose.Schema({
    type: { type: String, enum: ["product", "service"], required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: "processing" },
    total: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    deliveryStatus: { type: String, default: "pending" }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function createOrder() {
    if (!MONGODB_URI) throw new Error("MONGODB_URI not found");
    await mongoose.connect(MONGODB_URI);
    
    const order = await Order.create({
        type: "product",
        customerName: "Test User",
        customerPhone: "919999900000",
        address: "123 Test Street, Cyber City",
        status: "processing",
        total: 500,
        subtotal: 450,
        deliveryFee: 30,
        platformFee: 10,
        tax: 10,
        latitude: 17.4483, // Near Hitech City, Hyderabad
        longitude: 78.3915,
        deliveryStatus: "pending"
    });
    
    console.log("Order created:", order._id);
    process.exit(0);
}

createOrder();
