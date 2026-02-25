// Dev 1

import { HeroSection } from '@/components/web/HeroSection'
import { SearchBar } from '@/components/web/SearchBar'
import { RoomsSection } from '@/components/web/RoomsSection'
import { WhyChooseUs } from '@/components/web/WhyChooseUs'
import { EventsSection } from '@/components/web/EventsSection'

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <div className="px-6">
                <SearchBar />
            </div>
            <RoomsSection />
            <WhyChooseUs />
            <EventsSection />
        </>
    )
}
