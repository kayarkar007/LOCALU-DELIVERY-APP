import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    price: number;
    unit: string;
    categorySlug: string;
    inStock: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        unit: { type: String, required: true },
        categorySlug: { type: String, required: true },
        inStock: { type: Boolean, default: true },
        image: { type: String, required: false },
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
