"use client";

import { useState } from "react";
import Link from "next/link";
import Image from 'next/image';

export default function Navbar_DB() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-navy text-white sticky top-0 z-50 w-full px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Logo */}
      <Image src="/logo.png" alt="logo" width="60" height="60" />
      <h3 className="text-lg p-4">Senior Care Support</h3>

      {/* Links and Log In Button for Desktop */}
      <div className="hidden md:flex items-center space-x-4 md:space-x-6 ml-auto">
        <Link href="/">
          <button className="bg-red text-white font-bold px-4 py-2 rounded-lg hover:bg-white hover:text-red transition-all duration-200 text-sm md:text-base">
            LOG OUT
          </button>
        </Link>
      </div>

      {/* Hamburger Menu Icon for Mobile */}
      <div className="md:hidden flex items-center">
        <button
          className="text-white focus:outline-none ml-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-navy text-white py-4 px-6 space-y-2">
          <Link href="/">
            <button className="w-full bg-red text-white font-bold px-4 py-2 rounded-lg hover:bg-white hover:text-red transition-all duration-200 mt-3">
              LOG OUT
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
