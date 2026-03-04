'use client'

import { HeroSeccion } from '@/components/web/HeroSeccion'
import { SearchBar } from '@/components/web/SearchBar'
import { HabitacionesSeccion } from '@/components/web/HabitacionesSeccion'
import { PorQueElegirnosSeccion } from '@/components/web/PorQueElegirnosSeccion'
import { EventosSeccion } from '@/components/web/EventosSeccion'
import { TestimoniosSeccion } from '@/components/web/TestimoniosSeccion'
import { OfertasEspeciales } from '@/components/web/OfertasEspeciales'
import { TrustBadges } from '@/components/web/TrustBadges'
import AIChatbot from '@/components/web/AIChatbot'

export default function HomePage() {
    return (
        <>
            <HeroSeccion />
            <div className="px-6">
                <SearchBar />
            </div>
            <TrustBadges />
            <HabitacionesSeccion />
            <OfertasEspeciales />
            <PorQueElegirnosSeccion />
            <TestimoniosSeccion />
            <EventosSeccion />
            <AIChatbot />
        </>
    )
}
