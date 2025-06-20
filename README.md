# Stock Insight Platform

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

![GitHub repo size](https://img.shields.io/github/repo-size/william10310406/social-stock-platform?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/william10310406/social-stock-platform?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/william10310406/social-stock-platform?style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/william10310406/social-stock-platform?style=flat-square)

一個互動式的社交金融平台，提供用戶註冊、好友系統、社交發帖、即時聊天等功能。未來將整合股票數據和市場新聞。

## ✨ 主要功能

### 🔐 用戶認證
- 用戶註冊與登入
- JWT token 認證
- 個人資料管理
- 密碼安全加密

### 👥 社交系統
- 好友請求與管理
- 用戶搜索功能
- 好友列表顯示
- 接受/拒絕好友請求

### 📝 內容分享
- 創建、編輯、刪除帖子
- 帖子評論系統
- 點讚/取消點讚功能
- 個人帖子歷史

### 💬 即時聊天
- 與好友私人聊天
- 實時消息更新（每3秒自動刷新）
- 未讀消息提醒
- 聊天歷史記錄
- 好友限制聊天

### 🎨 用戶界面
- 響應式設計（支援手機/桌面）
- 中文界面本地化
- 現代化UI設計（TailwindCSS）
- 統一導航系統

## 🛠️ 技術架構

### 前端 (Frontend)
- **框架**: Vite + HTML5 + JavaScript (ES6模組)
- **樣式**: TailwindCSS
- **頁面**:
  - `index.html` - 首頁
  - `login.html` - 登入頁面
  - `register.html` - 註冊頁面
  - `dashboard.html` - 主儀表板
  - `profile.html` - 個人資料
  - `friends.html` - 好友管理
  - `chat.html` - 即時聊天
  - `post.html` - 帖子詳情

### 後端 (Backend)
- **框架**: Flask 2.x + Gunicorn
- **數據庫**: PostgreSQL 14
- **快取**: Redis
- **認證**: JWT Token
- **API藍圖**:
  - `/api/auth` - 用戶認證
  - `/api/posts` - 帖子管理
  - `/api/friends` - 好友系統
  - `/api/chat` - 聊天功能
  - `/api/stocks` - 股票數據 (計劃中)
  - `/api/news` - 新聞feed (計劃中)

### 數據庫設計

完整的關聯式數據庫架構，包含詳細的約束條件和索引優化：

**🔑 核心表格**

- **Users** - 用戶基本資料
  - 主鍵：`id` (自增)
  - 唯一約束：`username`, `email`
  - 驗證：用戶名最少3字符
  - 索引：用戶名、信箱查詢優化

- **Posts** - 帖子內容管理
  - 外鍵關聯：`author_id → users(id)`
  - 自動時間戳：創建/更新時間
  - 索引：作者、時間、標題搜索
  - 級聯刪除：用戶刪除時同步刪除帖子

- **Comments** - 評論系統
  - 雙重外鍵：關聯帖子和評論者
  - 時間索引：支援按時間排序
  - 級聯刪除：帖子或用戶刪除時同步清理

**👥 社交關係表格**

- **Friendships** - 好友關係管理
  - 複合主鍵：`(requester_id, addressee_id)`
  - 狀態約束：`pending`, `accepted`, `declined`
  - 防自我好友：檢查約束
  - 索引：待處理請求快速查詢

- **Likes** - 點讚記錄
  - 複合主鍵：防重複點讚
  - 時間戳：記錄點讚時間
  - 索引：統計帖子讚數優化

**💬 聊天系統表格**

- **Conversations** - 聊天對話
  - 唯一約束：防重複對話創建
  - 防自聊：檢查約束
  - 更新時間：自動維護最後活動時間
  - 索引：參與者、時間排序

- **Messages** - 聊天消息
  - 外鍵級聯：對話刪除時清理消息
  - 已讀狀態：支援未讀計數
  - 複合索引：對話+時間快速分頁
  - 內容驗證：非空消息檢查

**📈 擴展功能表格**

- **Stocks** - 股票基礎資料 (計劃中)
- **User_Stocks** - 用戶關注股票列表 (計劃中)
- **News** - 市場新聞數據 (計劃中)

**🔧 數據庫特性**
- PostgreSQL 14 引擎
- 自動時間戳管理
- 完整的外鍵約束
- 查詢性能索引優化
- 數據完整性檢查
- Flask-Migrate 版本控制

## 📁 專案結構

```
test/
├── frontend/                 # Vite前端應用
│   ├── src/
│   │   ├── css/style.css    # 樣式文件
│   │   └── js/              # JavaScript模組
│   │       ├── api.js       # API設定
│   │       ├── auth.js      # 認證功能
│   │       ├── dashboard.js # 主頁功能
│   │       ├── profile.js   # 個人資料
│   │       ├── friends.js   # 好友系統
│   │       └── chat.js      # 聊天功能
│   └── *.html               # 頁面文件
├── backend/                  # Flask後端應用
│   ├── app/
│   │   ├── blueprints/      # API端點
│   │   ├── models.py        # 資料庫模型
│   │   └── __init__.py      # 應用工廠
│   ├── migrations/          # 資料庫遷移
│   └── requirements.txt     # Python依賴
├── docker-compose.yml       # Docker編排
└── stock-architecture.yaml  # 架構設計文件
```

## 🚀 如何運行

### 系統需求

- Docker
- Docker Compose
- 至少 2GB RAM

### 快速開始

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd test
   ```

2. **啟動所有服務**
   ```bash
   docker-compose up --build
   ```

3. **訪問應用**
   - **前端**: `http://localhost:5173`
   - **後端API**: `http://localhost:5001`

### 服務詳情

| 服務 | 端口 | 說明 |
|------|------|------|
| Frontend (Vite) | 5173 | 前端開發服務器 |
| Backend (Flask) | 5001 | REST API 服務 |
| PostgreSQL | 5432 | 主數據庫 |
| Redis | 6379 | 快取與會話存儲 |

### 首次使用

1. **訪問註冊頁面**: `http://localhost:5173/register.html`
2. **創建用戶帳號**
3. **登入系統**: `http://localhost:5173/login.html`
4. **開始探索各項功能**

### 開發模式

- 前端支援**熱重載**，修改代碼後自動刷新
- 後端使用 Gunicorn 多進程服務器
- 數據庫自動執行遷移
- 所有服務透過 Docker 網路互連

## 📖 使用指南

### 基本操作流程

1. **註冊與登入**
   - 填寫用戶名、電子郵件、密碼
   - 登入後獲得 JWT token

2. **好友系統**
   - 搜索用戶並發送好友請求
   - 接受或拒絕其他人的好友請求
   - 查看好友列表

3. **社交互動**
   - 發布帖子分享想法
   - 對帖子進行評論和點讚
   - 查看自己的帖子歷史

4. **即時聊天**
   - 只能與好友聊天
   - 實時消息更新
   - 未讀消息提醒

## 🔧 開發說明

### 數據庫遷移

```bash
# 進入後端容器
docker-compose exec backend bash

# 創建新遷移
python manage.py db migrate -m "description"

# 執行遷移
python manage.py db upgrade
```

### 查看日誌

```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs backend
docker-compose logs frontend
```

### 停止服務

```bash
# 停止所有服務
docker-compose down

# 停止並刪除數據
docker-compose down -v
```

## 🚧 開發狀態

- ✅ **已完成**: 用戶認證、好友系統、帖子分享、即時聊天
- 🚧 **進行中**: 股票數據整合、新聞feed
- 📋 **計劃中**: 實時通知、高級股票圖表、移動端App

## 📄 許可證

This project is for educational and development purposes. 