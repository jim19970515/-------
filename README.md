# 早午餐店管理系統

全端專案，涵蓋顧客點餐前台、店家後台管理、POS 結帳介面。

## 技術棧

| 層級 | 技術 | 說明 |
|------|------|------|
| 前端 | Vue 3 + Pinia + Vue Router | 前端框架與狀態管理 |
| 前台 UI | Tailwind CSS | 顧客點餐介面樣式 |
| 後台 UI | Element Plus | 管理後台與 POS 介面元件 |
| 後端 | Node.js + Express | HTTP 伺服器與 API |
| AI 助理 | Claude API（預留介面） | 自然語言點餐，目前為 mock 關鍵字比對 |
| 資料庫 | PostgreSQL | 關聯式資料庫 |
| ORM | Prisma | 用 JS 操作資料庫，不用直接寫 SQL |
| 身份驗證 | JWT | 登入後取得 token，用來驗證身份 |

## 資料夾結構

```
brunch-app/
├── backend/                  # 後端（Node.js + Express）
│   ├── prisma/
│   │   └── schema.prisma     # 資料庫結構定義（有哪些表、哪些欄位）
│   ├── src/
│   │   ├── index.js          # 程式進入點，Express 伺服器從這裡啟動
│   │   ├── routes/           # 路由：定義 API 的路徑（例如 /api/menu）
│   │   ├── controllers/      # 控制器：每個 API 的邏輯寫在這裡
│   │   └── middleware/       # 中介層：例如 JWT 驗證，API 進入前先經過這裡
│   ├── .env                  # 環境變數（資料庫連線、JWT 密鑰）不上傳 GitHub
│   └── package.json          # 專案設定與依賴套件清單
│
└── frontend/                 # 前端（Vue 3）
    └── src/
        ├── views/
        │   ├── customer/     # 顧客點餐前台頁面
        │   ├── admin/        # 店家後台頁面
        │   └── pos/          # POS 結帳介面頁面
        ├── stores/           # Pinia 狀態管理（全域資料，例如購物車、登入狀態）
        ├── router/           # Vue Router（頁面路由與權限控制）
        ├── api/              # axios 封裝（統一管理所有 API 請求）
        └── components/       # 可重複使用的元件
```

## 名詞解釋

| 名詞 | 說明 |
|------|------|
| **資料庫（Database）** | 存放資料的地方，裡面有很多資料表 |
| **資料表（Table）** | 像 Excel 表格，每一列是一筆資料 |
| **ORM** | 讓你用 JS 語法操作資料庫，Prisma 會把它轉成 SQL |
| **schema.prisma** | 告訴 Prisma 資料庫長什麼樣，有哪些表、哪些欄位、型別是什麼 |
| **Migration** | 把 schema.prisma 的定義實際套用到資料庫，建立真正的資料表 |
| **JWT** | 登入成功後伺服器給的加密字串，之後每次 API 請求帶著它證明身份 |
| **Middleware（中介層）** | API 被執行前先跑的程式，例如先驗證 JWT 是否有效 |
| **Route（路由）** | API 的路徑，例如 `POST /api/auth/login` |
| **Controller（控制器）** | 路由對應的邏輯，例如驗證帳號密碼、回傳 JWT |
| **環境變數（.env）** | 不寫死在程式碼裡的設定值，例如密碼、密鑰，每個環境（本地/正式）可以不同 |
| **package.json** | Node.js 專案的設定檔，記錄專案名稱、啟動指令、依賴套件 |
| **node_modules** | npm install 後套件實際存放的地方，不上傳 GitHub |
| **PATH** | macOS terminal 找指令的路徑清單，找不到就報 command not found |

## 本地開發架構

```
瀏覽器
  │
  ▼ port 8080
nginx（反向代理）
  ├── www.localhost:8080  →  Nuxt 官網     (port 3003)
  ├── app.localhost:8080  →  Vue SPA       (port 5173)
  └── api.localhost:8080  →  Backend API   (port 3001)
```

nginx 扮演「守門員」角色，根據子網域決定把請求轉給哪個服務。
各服務本身繼續跑在自己的 port，不知道 nginx 的存在。

### nginx 常用指令

| 指令 | 說明 |
|------|------|
| `brew services start nginx` | 啟動 nginx（開機自動啟動） |
| `brew services stop nginx` | 停止 nginx |
| `brew services restart nginx` | 重新啟動（修改設定後執行） |
| `nginx -t` | 測試設定檔語法是否正確 |
| `nginx -s reload` | 重新載入設定（不中斷服務） |

### nginx 設定檔位置

| 檔案 | 說明 |
|------|------|
| `/opt/homebrew/etc/nginx/nginx.conf` | 主設定檔 |
| `/opt/homebrew/etc/nginx/servers/xinxin.conf` | 本專案子網域設定 |

### 修改設定的流程

```bash
# 1. 編輯設定檔
# 2. 測試語法
nginx -t
# 3. 若通過，重新載入
nginx -s reload
```

## 如何啟動（本地開發）

### 前置需求
- Node.js v20+
- PostgreSQL（Postgres.app）
- psql 加入 PATH（見下方）
- nginx（`brew install nginx`）
- Homebrew（https://brew.sh）

### 設定子網域（只需做一次）
```bash
sudo sh -c 'echo "127.0.0.1  www.localhost" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1  app.localhost" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1  api.localhost" >> /etc/hosts'
brew services start nginx
```

### 設定 psql PATH（只需做一次）
```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 建立資料庫
```bash
psql -U jim -c "CREATE DATABASE brunch_db;"
```

### 啟動後端
```bash
cd backend
npm install
npx prisma migrate dev --name init   # 建立資料表
npm run dev                           # 啟動伺服器（port 3001）
```

### 啟動前端
```bash
cd frontend
npm install
npm run dev
```

### 設定前端本地環境變數（只需做一次）
```bash
echo 'VITE_API_BASE=http://api.localhost:8080' > frontend/.env.local
```
> `.env.local` 不會上傳 GitHub，每台機器都要自己建。

## 測試帳號

| 系統 | 帳號 | 密碼 / PIN |
|------|------|------------|
| 後台管理 `/admin` | admin@brunch.com | admin123 |
| POS 系統 `/pos` | — | 1234 |

## API 文件

### Auth
| Method | Path | 說明 | 需要登入 |
|--------|------|------|----------|
| POST | `/api/auth/login` | 登入，回傳 JWT token | 否 |

### 菜單
| Method | Path | 說明 | 需要登入 |
|--------|------|------|----------|
| GET | `/api/menu` | 取得所有菜單 | 否 |
| POST | `/api/menu` | 新增品項 | 是 |
| PUT | `/api/menu/:id` | 修改品項 | 是 |
| DELETE | `/api/menu/:id` | 刪除品項 | 是 |

### 訂單
| Method | Path | 說明 | 需要登入 |
|--------|------|------|----------|
| POST | `/api/orders` | 顧客建立訂單 | 否 |
| GET | `/api/orders` | 查詢所有訂單 | 是 |
| PATCH | `/api/orders/:id/status` | 更新訂單狀態 | 是 |

### 報表
| Method | Path | 說明 | 需要登入 |
|--------|------|------|----------|
| GET | `/api/reports/today` | 今日營收與熱門品項 | 是 |

### AI 點餐助理
| Method | Path | 說明 | 需要登入 |
|--------|------|------|----------|
| POST | `/api/assistant/chat` | 自然語言點餐，回傳建議品項 | 否 |

**Request body：**
```json
{ "message": "我想吃套餐" }
```

**Response：**
```json
{
  "reply": "以下幾項符合你的需求：「心心招牌早午餐」、「美式大份量早午餐」",
  "suggestedItems": [
    { "menuItemId": 3, "quantity": 1, "name": "心心招牌早午餐", "price": "320" }
  ]
}
```

> 目前使用關鍵字比對（mock），未來可替換為 Claude API function calling。
