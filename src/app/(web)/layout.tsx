import { Navbar } from '@/components/web/Navbar'
import { Footer } from '@/components/web/Footer'
import { ScrollToTop } from '@/components/web/ScrollToTop'
import { Breadcrumbs } from '@/components/web/Breadcrumbs'
import { WhatsAppButton } from '@/components/web/WhatsAppButton'

export default function WebLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <Breadcrumbs />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
            <ScrollToTop />
        </div>
    )
}
