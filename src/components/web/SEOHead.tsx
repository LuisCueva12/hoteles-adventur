import Head from 'next/head'

interface SEOHeadProps {
    title: string
    description: string
    keywords?: string
    ogImage?: string
    canonical?: string
}

export function SEOHead({ title, description, keywords, ogImage, canonical }: SEOHeadProps) {
    const fullTitle = `${title} | Adventur Hotels`
    const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'
    const siteUrl = 'https://adventurhotels.com'

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content="Adventur Hotels" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage || defaultImage} />
            {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}
            <meta property="og:site_name" content="Adventur Hotels" />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage || defaultImage} />
            
            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}
            
            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
        </Head>
    )
}
