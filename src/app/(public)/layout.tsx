export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Navbar se importará aquí */}
      <main>{children}</main>
      {/* Footer se importará aquí */}
    </div>
  );
}
