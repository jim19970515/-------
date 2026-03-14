<script setup lang="ts">
useSeoMeta({
  title: '營業資訊 — 心心精緻早午餐',
  description: '心心精緻早午餐的營業時間、地址、電話與停車資訊。位於台北市信義區，歡迎預訂或直接到店。',
  ogTitle: '心心精緻早午餐 — 營業資訊',
  ogDescription: '台北市信義區，週一至週五 07:00–14:30，週六至週日 07:00–15:00',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: '心心精緻早午餐',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '範例路 123 號',
        addressLocality: '信義區',
        addressRegion: '台北市',
        postalCode: '110',
        addressCountry: 'TW',
      },
      telephone: '+886-2-1234-5678',
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '07:00', closes: '14:30' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday','Sunday'], opens: '07:00', closes: '15:00' },
      ],
      servesCuisine: '早午餐',
      priceRange: 'NT$150–NT$380',
    }),
  }],
})

const { trackClick } = useGtm()

const hours = [
  { day: '週一 — 週五', time: '07:00 – 14:30' },
  { day: '週六 — 週日', time: '07:00 – 15:00' },
  { day: '國定假日', time: '休息（不定期公告）' },
]
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-amber-800 mb-2">營業資訊</h1>
      <p class="text-gray-500 text-sm">歡迎到訪，期待為您服務</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 左欄 -->
      <div class="space-y-6">
        <!-- 營業時間 -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="font-bold text-amber-800 text-lg mb-4 flex items-center gap-2">
            <span>⏰</span> 營業時間
          </h2>
          <table class="w-full text-sm">
            <tbody>
              <tr v-for="row in hours" :key="row.day" class="border-b border-stone-50 last:border-none">
                <td class="py-2.5 text-gray-600 font-medium">{{ row.day }}</td>
                <td class="py-2.5 text-right text-gray-800 font-semibold">{{ row.time }}</td>
              </tr>
            </tbody>
          </table>
          <p class="text-xs text-gray-400 mt-3">最後點餐時間為打烊前 30 分鐘</p>
        </div>

        <!-- 聯絡方式 -->
        <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 class="font-bold text-amber-800 text-lg mb-4 flex items-center gap-2">
            <span>📞</span> 聯絡方式
          </h2>
          <a
            href="tel:+886-2-1234-5678"
            class="flex items-center gap-3 text-gray-700 hover:text-amber-700 transition-colors group"
            @click="trackClick('info_phone_click', '電話點擊')"
          >
            <span class="text-2xl">📱</span>
            <div>
              <p class="font-semibold group-hover:text-amber-700">02-1234-5678</p>
              <p class="text-xs text-gray-400">點擊直接撥打</p>
            </div>
          </a>
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-2xl">📧</span>
            <div>
              <p class="font-semibold">hello@xinxin-brunch.com</p>
              <p class="text-xs text-gray-400">一般詢問</p>
            </div>
          </div>
        </div>

        <!-- 地址 -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="font-bold text-amber-800 text-lg mb-4 flex items-center gap-2">
            <span>📍</span> 地址
          </h2>
          <a
            href="https://maps.google.com/?q=台北市信義區範例路123號"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-start gap-3 text-gray-700 hover:text-amber-700 transition-colors group"
            @click="trackClick('info_address_click', '地址點擊')"
          >
            <div>
              <p class="font-semibold group-hover:text-amber-700">台北市信義區範例路 123 號</p>
              <p class="text-xs text-gray-400 mt-0.5">點擊開啟 Google Maps</p>
            </div>
          </a>
          <div class="mt-4 text-sm text-gray-500 space-y-1">
            <p>🚇 捷運信義安和站 3 號出口，步行 5 分鐘</p>
            <p>🚗 附近有公共停車場（信義停車場）</p>
          </div>
        </div>
      </div>

      <!-- 右欄：Google Maps embed -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden h-full min-h-80">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.0!2d121.5636!3d25.0330!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDAxJzU4LjgiTiAxMjHCsDMzJzQ5LjAiRQ!5e0!3m2!1szh-TW!2stw!4v1"
          width="100%"
          height="100%"
          class="w-full h-full min-h-80"
          style="border:0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="心心精緻早午餐地圖"
        />
      </div>
    </div>

    <!-- 注意事項 -->
    <div class="mt-8 bg-amber-50 rounded-2xl p-5 text-sm text-gray-600">
      <p class="font-semibold text-amber-800 mb-2">📋 用餐注意事項</p>
      <ul class="space-y-1 text-sm">
        <li>• 本店無提供免洗餐具，外帶建議自備環保容器</li>
        <li>• 假日用餐高峰期建議提前線上預訂</li>
        <li>• 寵物友善（限戶外座位）</li>
      </ul>
    </div>
  </div>
</template>
