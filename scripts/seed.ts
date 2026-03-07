import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables manually
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Define Minimal schemas for seeding script since we run this outside of Next.js context
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ["product", "service"], required: true },
    image: { type: String, required: false },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    categorySlug: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    image: { type: String, required: false },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env.local");
}

const seedData = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully.");

        console.log("Clearing existing categories and products...");
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log("Cleared existing data.");

        const categories = [
            {
                name: "Fruits & Veggies",
                slug: "fruits-veg",
                type: "product",
                image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800"
            },
            {
                name: "Groceries",
                slug: "groceries",
                type: "product",
                image: "https://images.unsplash.com/photo-1609842947419-ba4f04d5d60f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGdyb2Nlcmllc3xlbnwwfHwwfHx8MA%3D%3D"
            },
            {
                name: "Medicines",
                slug: "medicines",
                type: "product",
                image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVkaWNpbmV8ZW58MHx8MHx8fDA%3D"
            },
            {
                name: "Home Services",
                slug: "home-services",
                type: "service",
                image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800"
            },
            {
                name: "Bakery & Dairy",
                slug: "bakery-dairy",
                type: "product",
                image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800"
            },
            {
                name: "Snacks & Drinks",
                slug: "snacks-drinks",
                type: "product",
                image: "https://images.unsplash.com/photo-1762284513076-8a2885838afe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
                name: "Meat & Seafood",
                slug: "meat-seafood",
                type: "product",
                image: "https://images.unsplash.com/photo-1611038333075-2efd28705f42?q=80&w=1549&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
                name: "Personal Care",
                slug: "personal-care",
                type: "product",
                image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800"
            },
            {
                name: "Pet Supplies",
                slug: "pet-supplies",
                type: "product",
                image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"
            }
        ];

        console.log("Inserting categories...");
        await Category.insertMany(categories);

        const products = [
            // Fruits & Veggies
            {
                name: "Farm Fresh Apples",
                price: 150,
                unit: "1 kg",
                categorySlug: "fruits-veg",
                inStock: true,
                image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwbGVzfGVufDB8fDB8fHww"
            },
            {
                name: "Yellow Bananas",
                price: 60,
                unit: "1 Dozen",
                categorySlug: "fruits-veg",
                inStock: true,
                image: "https://images.unsplash.com/photo-1603052875302-d376b7c0638a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJhbmFuYXxlbnwwfHwwfHx8MA%3D%3D"
            },
            {
                name: "Red Tomatoes",
                price: 40,
                unit: "1 kg",
                categorySlug: "fruits-veg",
                inStock: true,
                image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Organic Spinach",
                price: 35,
                unit: "1 Bunch",
                categorySlug: "fruits-veg",
                inStock: true,
                image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=500"
            },
            // Groceries
            {
                name: "Premium Basmati Rice",
                price: 180,
                unit: "1 kg",
                categorySlug: "groceries",
                inStock: true,
                image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Refined Sunflower Oil",
                price: 210,
                unit: "1 L",
                categorySlug: "groceries",
                inStock: true,
                image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Red Lentils (Masoor Dal)",
                price: 120,
                unit: "1 kg",
                categorySlug: "groceries",
                inStock: true,
                image: "https://images.unsplash.com/photo-1730591857303-0fa44be3f677?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVkJTIwbGVudGlsc3xlbnwwfHwwfHx8MA%3D%3D"
            },
            // Medicines
            {
                name: "Paracetamol 500mg",
                price: 25,
                unit: "10 Tablets",
                categorySlug: "medicines",
                inStock: true,
                image: "https://images.unsplash.com/photo-1588718889344-f7bd7a565d20?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFyYWNldGFtb2x8ZW58MHx8MHx8fDA%3D"
            },
            {
                name: "Vitamin C Supplements",
                price: 150,
                unit: "30 Tablets",
                categorySlug: "medicines",
                inStock: true,
                image: "https://images.unsplash.com/photo-1610833804933-264b7f75c99c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dml0YW1pbiUyMGMlMjB0YWJsZXR8ZW58MHx8MHx8fDA%3D"
            },
            {
                name: "First Aid Kit",
                price: 450,
                unit: "1 Box",
                categorySlug: "medicines",
                inStock: true,
                image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=500"
            },
            // Bakery & Dairy
            {
                name: "Whole Wheat Bread",
                price: 45,
                unit: "1 Packet",
                categorySlug: "bakery-dairy",
                inStock: true,
                image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Fresh Cow Milk",
                price: 65,
                unit: "1 L",
                categorySlug: "bakery-dairy",
                inStock: true,
                image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Salted Butter",
                price: 250,
                unit: "500 g",
                categorySlug: "bakery-dairy",
                inStock: true,
                image: "https://images.unsplash.com/photo-1587185717368-4d92f8de4ad2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YnV0dGVyfGVufDB8fDB8fHww"
            },
            // Snacks & Drinks
            {
                name: "Potato Chips",
                price: 30,
                unit: "1 Packet",
                categorySlug: "snacks-drinks",
                inStock: true,
                image: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpcHN8ZW58MHx8MHx8fDA%3D"
            },
            {
                name: "Cola Drink",
                price: 90,
                unit: "2 L",
                categorySlug: "snacks-drinks",
                inStock: true,
                image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Dark Chocolate Bar",
                price: 100,
                unit: "1 Bar",
                categorySlug: "snacks-drinks",
                inStock: true,
                image: "https://images.unsplash.com/photo-1523035274455-b2e5c6d5c2e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFyayUyMGNob2NvbGF0ZXxlbnwwfHwwfHx8MA%3D%3D"
            },
            // Meat & Seafood
            {
                name: "Fresh Chicken",
                price: 280,
                unit: "1 kg",
                categorySlug: "meat-seafood",
                inStock: true,
                image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Fish",
                price: 850,
                unit: "500 g",
                categorySlug: "meat-seafood",
                inStock: true,
                image: "https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsbW9ufGVufDB8fDB8fHww"
            },
            {
                name: "Eggs",
                price: 80,
                unit: "1 Dozen",
                categorySlug: "meat-seafood",
                inStock: true,
                image: "https://images.unsplash.com/photo-1639194335563-d56b83f0060c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D"
            },
            // Personal Care
            {
                name: "Herbal Shampoo",
                price: 199,
                unit: "1 Bottle",
                categorySlug: "personal-care",
                inStock: true,
                image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Mint Toothpaste",
                price: 85,
                unit: "1 Tube",
                categorySlug: "personal-care",
                inStock: true,
                image: "https://images.unsplash.com/photo-1612705166160-97d3b2e8e212?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRvb3RocGFzdGV8ZW58MHx8MHx8fDA%3D"
            },
            {
                name: "Moisturizing Soap",
                price: 45,
                unit: "1 Bar",
                categorySlug: "personal-care",
                inStock: true,
                image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&q=80&w=500"
            },
            // Pet Supplies
            {
                name: "Premium Dog Food",
                price: 1200,
                unit: "3 kg",
                categorySlug: "pet-supplies",
                inStock: true,
                image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Clumping Cat Litter",
                price: 450,
                unit: "5 kg",
                categorySlug: "pet-supplies",
                inStock: true,
                image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Pet Chew Toy",
                price: 150,
                unit: "1 Piece",
                categorySlug: "pet-supplies",
                inStock: true,
                image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=500"
            },
            // Service Items placeholder logic
            {
                name: "Appliance Repair",
                price: 500,
                unit: "base price",
                categorySlug: "home-services",
                inStock: true,
                image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=500"
            },
            {
                name: "Deep Home Cleaning",
                price: 1500,
                unit: "base price",
                categorySlug: "home-services",
                inStock: true,
                image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=500"
            }
        ];

        console.log("Inserting products...");
        await Product.insertMany(products);

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
