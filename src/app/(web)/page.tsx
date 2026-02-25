// Dev 1

import { HeroSeccion } from '@/components/web/HeroSeccion'
import { SearchBar } from '@/components/web/SearchBar'
import { HabitacionesSeccion } from '@/components/web/HabitacionesSeccion'
import { PorQueElegirnosSeccion } from '@/components/web/PorQueElegirnosSeccion'
import { EventosSeccion } from '@/components/web/EventosSeccion'
import { TestimoniosSeccion } from '@/components/web/TestimoniosSeccion'

export default function HomePage() {
    return (
        <>
            <HeroSeccion />
            <div className="px-6">
                <SearchBar />
            </div>
            <HabitacionesSeccion />
            <PorQueElegirnosSeccion />
            <TestimoniosSeccion />
            <EventosSeccion />
        </>
    )
}
