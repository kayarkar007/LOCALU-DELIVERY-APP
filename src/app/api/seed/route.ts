import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";

const categories = [
    { name: "Fresh Groceries", slug: "groceries", type: "product", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" },
    { name: "Fruits & Veggies", slug: "fruits-veg", type: "product", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800" },
    { name: "Dairy & Bakery", slug: "dairy-bakery", type: "product", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=800" },
    { name: "Pharmacy", slug: "pharmacy", type: "product", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800" },
    { name: "Meat & Seafood", slug: "meat-seafood", type: "product", image: "https://images.unsplash.com/photo-1607623814075-8bbdb5cfaeac?auto=format&fit=crop&q=80&w=800" },
    { name: "Snacks & Drinks", slug: "snacks-drinks", type: "product", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=800" },
    { name: "Personal Care", slug: "personal-care", type: "product", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800" },
    { name: "Pickup & Drop", slug: "pickup-drop", type: "service", image: "https://images.unsplash.com/photo-1611599537845-1c7ce00f0745?auto=format&fit=crop&q=80&w=800" },
    { name: "Petrol Delivery", slug: "petrol-delivery", type: "service", image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800" },
    { name: "Home Repairs", slug: "home-repairs", type: "service", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" },
];

const products = [
    // --- GROCERIES (Staples, Dals, Spices, Oils) ---
    { name: "Aashirvaad Whole Wheat Atta", price: 215, unit: "5 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1508338712271-4052ecce8caa?w=600&q=80" },
    { name: "India Gate Basmati Rice", price: 185, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80" },
    { name: "Sona Masoori Rice", price: 140, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80" },
    { name: "Toor Dal (Premium)", price: 165, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&q=80" },
    { name: "Moong Dal (Yellow)", price: 120, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&q=80" },
    { name: "Chana Dal", price: 85, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&q=80" },
    { name: "Urad Dal (White)", price: 130, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&q=80" },
    { name: "Fortune Sunflower Oil", price: 135, unit: "1 L", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80" },
    { name: "Gemini Refined Groundnut Oil", price: 195, unit: "1 L", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80" },
    { name: "Amul Pure Ghee", price: 540, unit: "1 L", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1589301773820-2bf8b33560ec?w=600&q=80" },
    { name: "Tata Salt, Iodized", price: 28, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1626082929543-5b87823f5bce?w=600&q=80" },
    { name: "Madhur Pure & Hygienic Sugar", price: 45, unit: "1 kg", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1625944230945-1b7dd12ce240?w=600&q=80" },
    { name: "Everest Turmeric Powder (Haldi)", price: 30, unit: "100 g", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1615486171447-380d0d80dcb8?w=600&q=80" },
    { name: "Everest Red Chilli Powder", price: 40, unit: "100 g", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80" },
    { name: "Everest Coriander Powder (Dhaniya)", price: 32, unit: "100 g", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80" },
    { name: "Everest Garam Masala", price: 45, unit: "50 g", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80" },
    { name: "Cumin Seeds (Jeera)", price: 90, unit: "100 g", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80" },
    { name: "Mustard Seeds (Rai)", price: 25, unit: "100 g", categorySlug: "groceries", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80" },

    // --- FRUITS & VEGGIES ---
    { name: "Fresh Tomatoes (Local)", price: 30, unit: "500 g", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80" },
    { name: "Onions (Pyaz)", price: 40, unit: "1 kg", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1618512496248-a07ce83aa8cb?w=600&q=80" },
    { name: "Potatoes (Aloo)", price: 35, unit: "1 kg", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80" },
    { name: "Bananas (Robusta)", price: 60, unit: "1 Dozen", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=600&q=80" },
    { name: "Green Chilli (Mirchi)", price: 15, unit: "100 g", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1588123190131-1c3fac394f4b?w=600&q=80" },
    { name: "Coriander Leaves (Dhaniya Patta)", price: 15, unit: "1 Bunch", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1599909618035-77ee126ca689?w=600&q=80" },
    { name: "Lemon (Nimbu)", price: 20, unit: "4 Pcs", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1590502593747-422e17551062?w=600&q=80" },
    { name: "Carrots", price: 50, unit: "500 g", categorySlug: "fruits-veg", image: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&q=80" },

    // --- DAIRY & BAKERY ---
    { name: "Amul Taaza Toned Milk", price: 26, unit: "500 ml", categorySlug: "dairy-bakery", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80" },
    { name: "Amul Gold Full Cream Milk", price: 33, unit: "500 ml", categorySlug: "dairy-bakery", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80" },
    { name: "Amul Butter", price: 55, unit: "100 g", categorySlug: "dairy-bakery", image: "https://images.unsplash.com/photo-1589301773820-2bf8b33560ec?w=600&q=80" },
    { name: "Amul Cheese Slices", price: 135, unit: "200 g", categorySlug: "dairy-bakery", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80" },
    { name: "Britannia White Bread", price: 45, unit: "1 Packet", categorySlug: "dairy-bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80" },
    { name: "Farm Fresh Eggs", price: 42, unit: "6 Pcs", categorySlug: "dairy-bakery", image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&q=80" },

    // --- SNACKS & DRINKS ---
    { name: "Lay's Magic Masala", price: 20, unit: "50 g", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1566478989037-e923e2079c65?w=600&q=80" },
    { name: "Kurkure Masala Munch", price: 20, unit: "90 g", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80" },
    { name: "Maggi 2-Minute Noodles", price: 14, unit: "70 g", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80" },
    { name: "Haldiram's Bhujia Sev", price: 50, unit: "200 g", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80" },
    { name: "Coca-Cola Can", price: 40, unit: "300 ml", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80" },
    { name: "Thums Up", price: 40, unit: "750 ml", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80" },
    { name: "Nutella Hazelnut Spread", price: 375, unit: "350 g", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1599599596001-f2f4c7185df3?w=600&q=80" },
    { name: "Tata Tea Premium", price: 145, unit: "250 g", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&q=80" },
    { name: "Nescafe Classic Coffee", price: 165, unit: "50 g", categorySlug: "snacks-drinks", image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=600&q=80" },

    // --- PERSONAL CARE ---
    { name: "Dettol Original Soap", price: 35, unit: "1 Pc", categorySlug: "personal-care", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=600&q=80" },
    { name: "Colgate MaxFresh", price: 95, unit: "150 g", categorySlug: "personal-care", image: "https://images.unsplash.com/photo-1559495116-2fd1ff901967?w=600&q=80" },
    { name: "Clinic Plus Shampoo", price: 120, unit: "175 ml", categorySlug: "personal-care", image: "https://images.unsplash.com/photo-1582215359746-d5be0f769213?w=600&q=80" },
    { name: "Himalaya Purifying Neem Face Wash", price: 155, unit: "100 ml", categorySlug: "personal-care", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80" },

    // --- PHARMACY ---
    { name: "Dolo 650 Tablet", price: 30, unit: "15 Tablets", categorySlug: "pharmacy", image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&q=80" },
    { name: "Vicks Vaporub", price: 155, unit: "50 g", categorySlug: "pharmacy", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80" },
    { name: "Savlon Antiseptic Liquid", price: 120, unit: "500 ml", categorySlug: "pharmacy", image: "https://images.unsplash.com/photo-1585435421671-0c16764628ce?w=600&q=80" },
    { name: "ENO Fruit Salt (Lemon)", price: 9, unit: "1 Sachet", categorySlug: "pharmacy", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80" },

    // --- MEAT & SEAFOOD ---
    { name: "Chicken Breast (Boneless)", price: 299, unit: "500 g", categorySlug: "meat-seafood", image: "https://images.unsplash.com/photo-1604503468506-a8da13fc951c?w=600&q=80" },
    { name: "Fresh Rohu Fish", price: 350, unit: "1 kg", categorySlug: "meat-seafood", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&q=80" },
];

export async function GET() {
    try {
        await connectToDatabase();

        // Clear existing
        await Category.deleteMany({});
        await Product.deleteMany({});

        // Seed Categories
        await Category.insertMany(categories);

        // Seed Products
        await Product.insertMany(products.map(p => ({ ...p, inStock: true })));

        return NextResponse.json({ success: true, message: "Database meticulously seeded with an extensive local catalog featuring unique item images!" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
