import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import PromoCode from "@/models/PromoCode";

export async function POST(req: Request) {
    try {
        const { code, cartTotal } = await req.json();

        if (!code || typeof cartTotal !== 'number') {
            return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
        }

        await connectToDatabase();

        const promo = await PromoCode.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!promo) {
            return NextResponse.json({ success: false, error: "Invalid or inactive promo code" }, { status: 404 });
        }

        // Check Expiry
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return NextResponse.json({ success: false, error: "Promo code has expired" }, { status: 400 });
        }

        // Check Usage Limit
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return NextResponse.json({ success: false, error: "Promo code usage limit reached" }, { status: 400 });
        }

        // Check Minimum Order Amount
        if (cartTotal < promo.minOrderAmount) {
            return NextResponse.json({
                success: false,
                error: `Minimum order amount of ₹${promo.minOrderAmount} required`
            }, { status: 400 });
        }

        // Calculate Discount
        let discountAmount = 0;
        if (promo.discountType === "fixed") {
            discountAmount = promo.discountValue;
        } else if (promo.discountType === "percentage") {
            discountAmount = (cartTotal * promo.discountValue) / 100;
        }

        // Ensure discount doesn't exceed cart total
        discountAmount = Math.min(discountAmount, cartTotal);

        // ✅ Bug Fix: Increment usedCount so usage limits are enforced
        await PromoCode.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });

        return NextResponse.json({
            success: true,
            data: {
                code: promo.code,
                discountAmount: Number(discountAmount.toFixed(2)),
                message: `Promo code applied successfully!`
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
