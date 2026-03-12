import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
    userId: string;
    productIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
    userId: { type: String, required: true, unique: true },
    productIds: [{ type: String }]
}, { timestamps: true });

if (mongoose.models.Wishlist) {
    delete mongoose.models.Wishlist;
}

export default mongoose.model<IWishlist>("Wishlist", WishlistSchema);
