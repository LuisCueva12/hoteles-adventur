'use client'

import { HeroSeccion } from '@/components/web/HeroSeccion'
import { SearchBar } from '@/components/web/BarraBusqueda'
import { HabitacionesSeccion } from '@/components/web/HabitacionesSeccion'
import { PorQueElegirnosSeccion } from '@/components/web/PorQueElegirnosSeccion'
import { EventosSeccion } from '@/components/web/EventosSeccion'
import { TestimoniosSeccion } from '@/components/web/TestimoniosSeccion'
import { OfertasEspeciales } from '@/components/web/OfertasEspeciales'
import { InsigniasConfianza } from '@/components/web/InsigniasConfianza'
import AIChatbot from '@/components/web/ChatbotIA'

export default function HomePage() {
    return (
        <>
            <HeroSeccion />
            <div className="px-6">
                <SearchBar />
            </div>
            <InsigniasConfianza />
            <HabitacionesSeccion />
            <OfertasEspeciales />
            <PorQueElegirnosSeccion />
            <TestimoniosSeccion />
            <EventosSeccion />
            <AIChatbot />
        </>
    )
}
