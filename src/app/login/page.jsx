"use client";

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-3xl text-navy font-bold mb-6 text-center">Log In</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-navy text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="w-full px-3 py-2 border rounded-lg text-gray-700"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-navy text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-3 py-2 border rounded-lg text-gray-700"
                                placeholder="Enter your password"
                            />
                        </div>
                        <Link href="/dashboard">
                            <button type="submit" className="w-full bg-navy text-white py-2 rounded-lg hover:bg-yellow hover:text-navy transition duration-200">
                                Log In
                            </button>
                        </Link>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
