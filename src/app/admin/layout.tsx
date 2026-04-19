import { Sidebar } from '@/components/admin/Sidebar';
import { NavbarAdmin } from '@/components/admin/NavbarAdmin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <NavbarAdmin />
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
