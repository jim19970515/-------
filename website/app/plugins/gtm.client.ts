export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const gtmId = config.public.gtmId as string

  if (!gtmId || gtmId === 'GTM-XXXXXXX') return

  // 初始化 dataLayer
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  // 注入 GTM script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
  document.head.appendChild(script)

  // 注入 GTM noscript iframe
  const noscript = document.createElement('noscript')
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`
  iframe.height = '0'
  iframe.width = '0'
  iframe.style.display = 'none'
  iframe.style.visibility = 'hidden'
  noscript.appendChild(iframe)
  document.body.prepend(noscript)

  // 每次路由切換送 page_view
  const router = useRouter()
  router.afterEach((to) => {
    window.dataLayer.push({
      event: 'page_view',
      page_path: to.fullPath,
      page_title: document.title,
    })
  })

  // 滾動深度追蹤（25% / 50% / 75% / 100%）
  const triggered = new Set<number>()
  const thresholds = [25, 50, 75, 100]

  function onScroll() {
    const scrolled = window.scrollY + window.innerHeight
    const total = document.documentElement.scrollHeight
    const percent = Math.round((scrolled / total) * 100)
    thresholds.forEach((t) => {
      if (percent >= t && !triggered.has(t)) {
        triggered.add(t)
        window.dataLayer.push({ event: 'scroll_depth', depth: t })
      }
    })
  }

  nuxtApp.hook('page:finish', () => {
    triggered.clear()
    window.addEventListener('scroll', onScroll, { passive: true })
  })
})
