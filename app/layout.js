import "./globals.css";

export const metadata = {
  title: "EMS Configurator — Energy System Selection",
  description: "Find the best Energy Management System based on your ROI expectations and energy profile",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
