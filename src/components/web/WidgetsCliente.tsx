'use client'

import dynamic from 'next/dynamic'

// Agrega un default export a PopupBoletin para que dynamic lo resuelva correctamente
const NewsletterPopup = dynamic(
    () => import('@/components/web/PopupBoletin').then((m) => {
        // Envolver el named export como default para next/dynamic
        const Component = m.NewsletterPopup
        return { default: Component }
    }),
    { ssr: false }
)

const HomeChatLauncher = dynamic(
    () => import('@/components/web/HomeChatLauncher').then((m) => ({
        default: m.HomeChatLauncher
    })),
    { ssr: false }
)

export function WidgetsCliente() {
    return (
        <>
            <NewsletterPopup />
            <HomeChatLauncher />
        </>
    )
}
