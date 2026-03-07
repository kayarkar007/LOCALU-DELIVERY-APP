import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    type: "product" | "service";
    userId?: string;
    items?: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    serviceCategory?: string;
    serviceDetails?: any;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    subtotal: number;
    deliveryFee: number;
    platformFee: number;
    tax: number;
    total: number;
    customerName: string;
    customerPhone: string;
    address: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        type: { type: String, enum: ["product", "service"], required: true },
        userId: { type: String },
        items: [
            {
                productId: { type: String },
                name: { type: String },
                price: { type: Number },
                quantity: { type: Number },
            },
        ],
        serviceCategory: { type: String },
        serviceDetails: { type: Schema.Types.Mixed },
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        subtotal: { type: Number, required: true },
        deliveryFee: { type: Number, required: true },
        platformFee: { type: Number, required: true },
        tax: { type: Number, required: true },
        total: { type: Number, required: true },
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        address: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    { timestamps: true }
);

if (mongoose.models.Order) {
    delete mongoose.models.Order;
}

export default mongoose.model<IOrder>("Order", OrderSchema);
