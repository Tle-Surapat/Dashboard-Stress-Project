"use client";

import { useState } from "react";
import Link from "next/link";
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-navy text-white sticky top-0 z-50 w-full px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Logo */}
      <Image src="/logo.png" alt="logo" width="60" height="60" />
      <h3 className="text-lg p-4">Senior Care Support</h3>

      {/* Links and Log In Button for Desktop */}
      <div className="hidden md:flex items-center space-x-4 md:space-x-6 ml-auto">
        <a href="#about-us" className="hover:text-yellow text-sm md:text-base transition-colors duration-200">
          ABOUT US
        </a>
        <a href="#contact" className="hover:text-yellow text-sm md:text-base transition-colors duration-200">
          CONTACT
        </a>
        <Link href="/login">
          <button className="bg-yellow text-navy font-bold px-4 py-2 rounded-lg hover:bg-white transition-all duration-200 text-sm md:text-base">
            LOG IN
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
          <a href="#about" className="block py-2 px-3 rounded hover:bg-gray-700 transition-colors duration-200">
            ABOUT US
          </a>
          <a href="#contact" className="block py-2 px-3 rounded hover:bg-gray-700 transition-colors duration-200">
            CONTACT
          </a>
          <Link href="/login">
            <button className="w-full bg-yellow text-navy font-bold px-4 py-2 rounded-lg hover:bg-white transition-all duration-200 mt-3">
              LOG IN
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
