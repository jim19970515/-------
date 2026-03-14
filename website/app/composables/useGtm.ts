interface GtmEvent {
  event: string
  [key: string]: unknown
}

declare global {
  interface Window {
    dataLayer: GtmEvent[]
  }
}

export function useGtm() {
  function push(payload: GtmEvent) {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push(payload)
  }

  function trackClick(eventName: string, label: string) {
    push({ event: eventName, label })
  }

  function trackScroll(depth: number) {
    push({ event: 'scroll_depth', depth })
  }

  function trackPhone(phone: string) {
    push({ event: 'phone_click', phone })
  }

  function trackAddress() {
    push({ event: 'address_click' })
  }

  return { push, trackClick, trackScroll, trackPhone, trackAddress }
}
