import type { Metadata } from "next";
import { Varela } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { PantryProvider } from './PantryContext';


const varela = Varela({ weight: "400", subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" data-theme="cupcake">

      <body className={varela.className}><Toaster position="bottom-center" />

        <PantryProvider>
          {children}
        </PantryProvider>

      </body>
    </html>
  );
}
