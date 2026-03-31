'use client'

import { Facebook, Twitter, MessageCircle, Mail, Share2 } from 'lucide-react'
import { useState } from 'react'

interface BotonesCompartirProps {
    title: string
    description?: string
    url?: string
}

export function BotonesCompartir({ title, description = '', url }: BotonesCompartirProps) {
    const [showMenu, setShowMenu] = useState(false)
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const shareText = `${title} - ${description}`

    const shareLinks = [
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-blue-600'
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-sky-500'
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
            color: 'hover:bg-green-600'
        },
        {
            name: 'Email',
            icon: Mail,
            url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
            color: 'hover:bg-gray-600'
        }
    ]

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url: shareUrl
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            setShowMenu(!showMenu)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Compartir</span>
            </button>

            {showMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 animate-fadeIn">
                    <div className="flex flex-col gap-1 min-w-[160px]">
                        {shareLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:text-white transition-colors ${link.color}`}
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{link.name}</span>
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
