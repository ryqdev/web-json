import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Json Viewer",
  description: "Save time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
