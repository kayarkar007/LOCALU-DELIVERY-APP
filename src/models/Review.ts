import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    userId: string;
    orderId: string;
    productId?: string;
    rating: number; // 1 to 5
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    userId: { type: String, required: true },
    orderId: { type: String, required: true },
    productId: { type: String }, // Optional, can review specific product or just the order
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 }
}, { timestamps: true });

if (mongoose.models.Review) {
    delete mongoose.models.Review;
}

export default mongoose.model<IReview>("Review", ReviewSchema);
