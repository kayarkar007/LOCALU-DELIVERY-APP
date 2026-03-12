import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        whatsapp: { type: String, required: true },
        address: { type: String },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        walletBalance: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
