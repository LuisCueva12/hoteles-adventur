// Dev 1

import { Navbar } from '@/components/web/Navbar'
import { Footer } from '@/components/web/Footer'

export default function WebLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
