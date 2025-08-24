import React from 'react';

export const metadata = { title: "Dyad Debug" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0b0b", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}