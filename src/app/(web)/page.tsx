import dynamic from 'next/dynamic'
import { HeroSeccion } from '@/components/web/HeroSeccion'
import { BuscadorHoteles } from '@/components/web/BuscadorHoteles'
import { HabitacionesSeccion } from '@/components/web/HabitacionesSeccion'
import { PorQueElegirnosSeccion } from '@/components/web/PorQueElegirnosSeccion'
import { EventosSeccion } from '@/components/web/EventosSeccion'
import { TestimoniosSeccion } from '@/components/web/TestimoniosSeccion'
import { OfertasEspeciales } from '@/components/web/OfertasEspeciales'
import { InsigniasConfianza } from '@/components/web/InsigniasConfianza'

// Carga diferida del chatbot — no es crítico para el LCP
const AIChatbot = dynamic(() => import('@/components/web/ChatbotIA'), { ssr: false })

export default function HomePage() {
    return (
        <>
            <HeroSeccion />
            <div className="px-6">
                <BuscadorHoteles />
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
