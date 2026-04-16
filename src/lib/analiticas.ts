export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url
    })
  }
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

export const trackRoomView = (roomId: string, roomName: string) => {
  event({
    action: 'view_room',
    category: 'Rooms',
    label: `${roomId} - ${roomName}`
  })
}

export const trackBookingStart = (roomId: string, roomName: string) => {
  event({
    action: 'begin_checkout',
    category: 'Booking',
    label: `${roomId} - ${roomName}`
  })
}

export const trackBookingComplete = (bookingId: string, value: number) => {
  event({
    action: 'purchase',
    category: 'Booking',
    label: bookingId,
    value
  })
}

export const trackSearch = (searchTerm: string) => {
  event({
    action: 'search',
    category: 'Search',
    label: searchTerm
  })
}

export const trackNewsletterSignup = (email: string) => {
  event({
    action: 'newsletter_signup',
    category: 'Engagement',
    label: email
  })
}

export const trackSocialShare = (platform: string, url: string) => {
  event({
    action: 'share',
    category: 'Social',
    label: `${platform} - ${url}`
  })
}

export const trackError = (error: string, fatal: boolean = false) => {
  event({
    action: 'exception',
    category: 'Error',
    label: error,
    value: fatal ? 1 : 0
  })
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

export const fbPageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView')
  }
}

export const fbEvent = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options)
  }
}

export const fbTrackBooking = (value: number, currency: string = 'PEN') => {
  fbEvent('Purchase', { value, currency })
}

export const fbTrackSearch = (searchString: string) => {
  fbEvent('Search', { search_string: searchString })
}
