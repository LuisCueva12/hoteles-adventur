'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { pageview, GA_TRACKING_ID, FB_PIXEL_ID, fbPageview } from '@/lib/analiticas'
import Script from 'next/script'

function AnalyticsContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
            pageview(url)
            fbPageview()
        }
    }, [pathname, searchParams])

    if (!GA_TRACKING_ID && !FB_PIXEL_ID) {
        return null
    }

    return (
        <>
            {GA_TRACKING_ID && (
                <>
                    <Script
                        strategy="lazyOnload"
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                    />
                    <Script
                        id="google-analytics"
                        strategy="lazyOnload"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${GA_TRACKING_ID}', {
                                    page_path: window.location.pathname,
                                    anonymize_ip: true,
                                    cookie_flags: 'SameSite=None;Secure'
                                });
                            `
                        }}
                    />
                </>
            )}

            {FB_PIXEL_ID && (
                <Script
                    id="facebook-pixel"
                    strategy="lazyOnload"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${FB_PIXEL_ID}');
                            fbq('track', 'PageView');
                        `
                    }}
                />
            )}
        </>
    )
}

export function Analytics() {
    return (
        <Suspense fallback={null}>
            <AnalyticsContent />
        </Suspense>
    )
}
