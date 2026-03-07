"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", whatsapp: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to register");
                setLoading(false);
                return;
            }

            toast.success("Account created! Logging you in...");

            // Automatically sign in upon successful registration
            const loginRes = await signIn("credentials", {
                redirect: false,
                email: form.email,
                password: form.password,
            });

            if (loginRes?.error) {
                toast.error("Failed to auto-login. Please login manually.");
                router.push("/login");
            } else {
                router.push("/");
                router.refresh();
            }

        } catch (error) {
            toast.error("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative">
            <Link
                href="/"
                className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="text-center mb-10 mt-6">
                <h2 className="text-3xl font-black text-gray-900">Create Account</h2>
                <p className="text-gray-500 font-medium mt-2">Join LocalU Delivery today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
                    <input
                        type="tel"
                        required
                        value={form.whatsapp}
                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                        className="w-full border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="+91 9876543210"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="At least 6 characters"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                </button>
            </form>

            <p className="text-center mt-8 text-gray-500 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                    Log in here
                </Link>
            </p>
        </div>
    );
}
