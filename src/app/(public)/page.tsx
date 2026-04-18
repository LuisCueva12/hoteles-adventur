import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-green-700">Hoteles Adventur</h1>
      <p className="text-lg text-gray-600">
        Encuentra tu hotel ideal y reserva por WhatsApp
      </p>
      <Link
        href="/hoteles"
        className="rounded-xl bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition-colors"
      >
        Ver hoteles
      </Link>
    </main>
  );
}
