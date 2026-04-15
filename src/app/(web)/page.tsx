import { HeroSeccion } from '@/components/web/HeroSeccion'
import { InsigniasConfianza } from '@/components/web/InsigniasConfianza'
import { HabitacionesSeccion } from '@/components/web/HabitacionesSeccion'
import { PorQueElegirnosSeccion } from '@/components/web/PorQueElegirnosSeccion'
import { TestimoniosSeccion } from '@/components/web/TestimoniosSeccion'

export default function HomePage() {
  return (
    <>
      <HeroSeccion />
      <InsigniasConfianza />
      <HabitacionesSeccion />
      <PorQueElegirnosSeccion />
      <TestimoniosSeccion />
    </>
  )
}
