import { Navbar } from '@/components/web/BarraNavegacion'
import { Footer } from '@/components/web/PiePagina'
import { VolverArriba } from '@/components/web/VolverArriba'
import { MigasPan } from '@/components/web/MigasPan'
import { WidgetsCliente } from '@/components/web/WidgetsCliente'

export default function WebLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <MigasPan />
            <main className="flex-1">{children}</main>
            <Footer />
            <VolverArriba />
            <WidgetsCliente />
        </div>
    )
}
