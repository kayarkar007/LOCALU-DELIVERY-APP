import mongoose, { Schema, Document } from "mongoose";

export interface IPromoCode extends Document {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minOrderAmount: number;
    isActive: boolean;
    expiresAt?: Date;
    usageLimit?: number;
    usedCount: number;
}

const PromoCodeSchema = new Schema<IPromoCode>({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 }
}, { timestamps: true });

if (mongoose.models.PromoCode) {
    delete mongoose.models.PromoCode;
}

export default mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);
