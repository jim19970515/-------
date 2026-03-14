# 心心精緻早午餐 官網 — Nuxt 4 開發規則

## 專案定位
行銷官網，與內部系統（frontend/）獨立。
開發用 SPA（ssr: false dev），部署用 `pnpm generate` 靜態生成（SSG）。

## 技術棧
- Nuxt 4（app/ 目錄結構）
- UnoCSS（@unocss/nuxt + presetUno + presetAttributify + presetIcons）
- TypeScript（`<script setup lang="ts">`）

## 你的角色設定

### 作為資深 Nuxt 工程師
- 所有 composables 放 `app/composables/`，自動 import 不需手動引入
- 所有 plugins 放 `app/plugins/`，client-only 用 `.client.ts` 命名
- 型別定義放 `app/types/`（目前較少，可隨需求建立）
- SEO 每頁必填：`useSeoMeta({ title, description, ogTitle, ogDescription })`
- API fetch 一律：`useFetch(url, { lazy: true, default: () => [] })`
- 不要在 template 裡用 `if` 語句，改用 `&&` 短路或三元

### 作為資深 UI 設計師
- 色系：amber 暖色為主（與品牌 app 一致）
- 版面：max-w-5xl mx-auto px-4，行動優先
- 圓角：卡片 rounded-2xl，按鈕 rounded-full
- 靜態圖片用動態綁定 `:src="'/xxx.png'"`（避免 Vite import 解析錯誤）

## UnoCSS 注意事項
- 使用 UnoCSS presetUno（Tailwind v3 相容語法）
- 漸層用 `bg-gradient-to-b`，**不用** `bg-linear-to-b`（後者是 Tailwind v4 語法）
- 任意值用方括號：`min-h-[92vh]`、`text-[#fff]`
- Icon 用 `i-carbon-xxx` 格式（需安裝對應 icon 集）

## GTM 追蹤規範
- 所有 GTM 操作透過 `useGtm()` composable
- 按鈕追蹤：`trackClick(eventName, label)`
- 頁面瀏覽由 `plugins/gtm.client.ts` 自動送出
- 不直接操作 `window.dataLayer`

## 禁止事項
- 不要安裝 tailwindcss 或 @tailwindcss/vite
- 不要在 app/ 以外建立 pages/layouts/components（Nuxt 4 app/ 目錄規範）
- 不要新增 comment 或 docstring 到沒改動的程式碼
- 不要自作主張重構沒被要求的部分

## 資料夾結構
```
website/
├── app/
│   ├── app.vue
│   ├── layouts/default.vue
│   ├── pages/
│   │   ├── index.vue       # 品牌首頁
│   │   ├── menu.vue        # 菜單展示
│   │   ├── info.vue        # 營業資訊
│   │   └── reservation.vue # 線上預訂
│   ├── composables/
│   │   └── useGtm.ts
│   └── plugins/
│       └── gtm.client.ts
├── public/                 # 靜態資源（logo.png 等）
├── uno.config.ts
└── nuxt.config.ts
```

## API
```
開發環境：http://localhost:3000
生產環境：透過 .env API_BASE 設定
```
