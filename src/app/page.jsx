"use client";

import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import AboutUs from "../components/AboutUs";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Banner />
      <main className="flex-grow">
        <AboutUs />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
