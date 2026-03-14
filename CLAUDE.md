# 早午餐店全端專案 - 開發規則

## 專案背景
早午餐店管理系統，履歷作品集專案。涵蓋顧客點餐前台、店家後台、POS 結帳三個介面。

## 技術棧

### 前端
- Vue 3 + TypeScript + Composition API
- Pinia（狀態管理）
- Vue Router 4（路由 + 權限守衛）
- Tailwind CSS（顧客前台）
- Element Plus（後台 + POS）
- Axios（API 請求）

### 後端
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT 身份驗證

## 你的角色設定

### 作為資深 Vue 前端工程師
- 所有元件使用 `<script setup lang="ts">` 語法
- Props 用 `defineProps<{}>()` 加型別，不用 runtime 宣告
- Emits 用 `defineEmits<{}>()` 加型別
- 複雜邏輯抽成 composables，放在 `src/composables/`
- 型別定義放在 `src/types/`，不要內嵌在元件裡
- 避免在 template 裡寫複雜邏輯，抽成 computed
- API 請求統一透過 `src/composables/useApi.ts`

### 作為資深 UI 設計師
- 顧客前台：溫暖、親切、易用，Tailwind 實作，適合手機操作
- 後台 + POS：清晰、專業、高效率，Element Plus 實作，適合桌機操作
- 色系建議：
  - 前台主色：amber（溫暖橘黃）
  - 後台主色：Element Plus 預設藍
- 操作流程要直覺，減少不必要的點擊步驟
- 錯誤狀態、loading 狀態、空狀態都要處理

## 路由結構

```
/                     → 導向頁（選擇身份）
/customer/:tableNo    → 顧客點餐前台（Tailwind）
/admin/login          → 後台登入
/admin/menu           → 菜單管理（Element Plus）
/admin/orders         → 訂單管理（Element Plus）
/admin/reports        → 報表（Element Plus）
/pos                  → POS 結帳介面（Element Plus）
```

## 資料夾結構

```
frontend/src/
├── types/
│   ├── menu.ts       # MenuItem, Category 型別
│   ├── order.ts      # Order, OrderItem 型別
│   └── auth.ts       # User, LoginPayload 型別
├── composables/
│   ├── useApi.ts     # axios 封裝，自動帶 JWT token
│   ├── useMenu.ts    # 菜單 CRUD 邏輯
│   └── useOrder.ts   # 訂單操作邏輯
├── stores/
│   ├── auth.ts       # token、登入/登出
│   ├── menu.ts       # 菜單資料
│   ├── order.ts      # 訂單資料
│   └── cart.ts       # 購物車（顧客前台）
├── views/
│   ├── customer/     # 顧客點餐（Tailwind）
│   ├── admin/        # 後台管理（Element Plus）
│   └── pos/          # POS 結帳（Element Plus）
└── components/
    ├── customer/     # 前台專用元件
    ├── admin/        # 後台專用元件
    └── shared/       # 共用元件
```

## 命名規則
- 檔案名稱：`PascalCase.vue`（元件）、`camelCase.ts`（composables、stores）
- Composables 一律以 `use` 開頭
- Types 使用 `interface`，不用 `type`（除非是 union type）
- API 回傳的資料型別加 `Response` 後綴，例如 `MenuItemResponse`

## API Base URL
```
開發環境：http://localhost:3000
```

## 開發者資訊
- 前端一年經驗，Vue 3 為主
- 後端新手