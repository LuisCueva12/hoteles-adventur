import { Hero } from '@/components/home/Hero';
import { HotelesDestacados } from '@/components/home/HotelesDestacados';

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <HotelesDestacados />
    </main>
  );
}
