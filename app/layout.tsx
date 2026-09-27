import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NetZone | Book a Court",
  description: "Book your next pickleball game at NetZone, General Santos City."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
