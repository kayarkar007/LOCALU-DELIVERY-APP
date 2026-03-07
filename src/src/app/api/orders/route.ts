import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        const { type, customerName, customerPhone, address, latitude, longitude } = body;

        let subtotal = 0;
        const deliveryFee = 30;
        const platformFee = 5;
        let tax = 0;

        let whatsappText = "";

        if (type === "product") {
            const { items } = body;
            items.forEach((item: any) => {
                subtotal += item.price * item.quantity;
            });
            tax = subtotal * 0.05;

            const total = subtotal + deliveryFee + platformFee + tax;

            body.subtotal = subtotal;
            body.deliveryFee = deliveryFee;
            body.platformFee = platformFee;
            body.tax = tax;
            body.total = total;

            whatsappText = `New Product Order:
--------------------------------
${items.map((i: any) => `${i.name} x ${i.quantity} = ₹${i.price * i.quantity}`).join("\n")}
--------------------------------
Subtotal: ₹${subtotal.toFixed(2)}
Delivery Fee: ₹${deliveryFee}
Platform Fee: ₹${platformFee}
Tax: ₹${tax.toFixed(2)}
Total: ₹${total.toFixed(2)}
--------------------------------
Customer: ${customerName}
Phone: ${customerPhone}
Address: ${address}
Google Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
        } else if (type === "service") {
            const { serviceCategory, serviceDetails } = body;

            // Mock dynamic pricing logic
            if (serviceCategory === "Petrol Delivery") {
                subtotal = (serviceDetails.quantity || 1) * 105; // Mock 105 per liter
            } else if (serviceCategory === "Pickup & Drop") {
                subtotal = 150; // Mock base rate
            } else {
                subtotal = 200;
            }

            tax = subtotal * 0.05;
            const total = subtotal + deliveryFee + platformFee + tax;

            body.subtotal = subtotal;
            body.deliveryFee = deliveryFee;
            body.platformFee = platformFee;
            body.tax = tax;
            body.total = total;

            const detailsText = Object.entries(serviceDetails || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n");

            whatsappText = `New Service Request:
--------------------------------
Service Type: ${serviceCategory}
Details:
${detailsText}
--------------------------------
Estimated Price: ₹${total.toFixed(2)}
--------------------------------
Customer: ${customerName}
Phone: ${customerPhone}
Address: ${address}
Google Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
        }

        const order = await Order.create(body);

        const ownerNumber = process.env.OWNER_NUMBER || "919999999999";
        const encodedMessage = encodeURIComponent(whatsappText);
        const redirectUrl = `https://wa.me/${ownerNumber}?text=${encodedMessage}`;

        return NextResponse.json({ success: true, data: order, redirectUrl });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to place order" },
            { status: 400 }
        );
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: orders });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch orders" },
            { status: 400 }
        );
    }
}
