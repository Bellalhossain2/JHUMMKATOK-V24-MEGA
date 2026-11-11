export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}
