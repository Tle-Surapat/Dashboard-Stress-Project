import { Montserrat } from "next/font/google";
import "./globals.css"; // Import your global CSS
import "../components/fontawesome"; // Adjust the path to your fontawesome.js file
import { Toaster } from 'react-hot-toast';

// Correct font weight values (no `100 900`, use individual weights)
const montserrat = Montserrat({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Specify valid weights
  subsets: ["latin"], // Ensure Latin subset is loaded
  variable: "--font-montserrat", // Variable name for Montserrat
});

export const metadata = {
  title: "WU Care",
  description: "WU Care by senior care support",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
