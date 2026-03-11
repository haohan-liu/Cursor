# 🚗 汽车水晶档把库存管理系统

> 企业级仓库库存管理系统，支持扫码出库入库、库位可视化、数据看板等核心功能。

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)]()
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-blue)]()
[![License](https://img.shields.io/badge/License-ISC-yellow)]()

---

## 📁 项目目录结构

```
gear-knob-inventory/
├── src/                          # 前端源代码（Vue 3 + Vite）
│   ├── apis/                     # 🔌 API 请求层
│   │   └── index.js              #    统一封装 axios 实例和所有 API 接口
│   ├── composables/              # 🔧 全局可复用逻辑（组合式函数）
│   │   ├── useToast.js           #    消息提示 + 确认框
│   │   └── useProductVersion.js  #    产品版本管理（乐观锁用）
│   ├── features/                 # 📦 业务功能模块（按功能域划分）
│   │   └── inventory/            #    库存业务模块
│   │       └── composables/
│   │           ├── useInventory.js  # 库存相关业务逻辑
│   │           └── useProduct.js    # 产品相关业务逻辑
│   ├── pages/                    # 📄 页面入口组件
│   │   ├── Dashboard/            #    数据看板页面
│   │   ├── ScanStation/          #    扫码工作台页面
│   │   ├── InventoryManage/     #    入库与库存管理页面
│   │   └── WarehouseMap/         #    库位可视化地图页面
│   ├── widgets/                  # 🧩 可复用组件块
│   │   └── AppToast.vue          #    全局 Toast 提示组件
│   ├── App.vue                   # 🖥️ 根组件（主题切换、路由）
│   └── main.js                   # ⚡ 入口文件
│
├── server/                       # 🌐 后端服务（Node.js + Express）
│   └── index.js                  #    主服务入口（API 接口、数据库、CRUD）
│
├── dist/                         # 📦 前端构建产物（部署用）
│   ├── index.html
│   └── assets/
│
├── public/                       # 📂 静态资源（若有）
│
├── .env.development              # 🔧 开发环境配置（前端）
├── .env.production               # 🏭 生产环境配置（前端）
├── .env.server                  # ⚙️ 后端服务器配置
├── .env.example                  # 📝 配置模板
│
├── package.json                  # 📦 项目依赖配置
├── vite.config.js                # ⚡ Vite 构建配置
├── tailwind.config.js            # 🎨 Tailwind CSS 配置
├── postcss.config.js             # 🖌️ PostCSS 配置
├── ecosystem.config.js           # 🔄 PM2 进程管理配置
└── README.md                     # 📖 项目文档
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue.js | 3.4+ |
| 构建工具 | Vite | 5.x |
| UI 样式 | Tailwind CSS | 3.4+ |
| HTTP 客户端 | Axios | 1.6+ |
| 图表库 | Chart.js | 4.4+ |
| 二维码 | qrcode / html5-qrcode | - |
| Excel 导出 | xlsx | 0.18+ |
| 后端框架 | Express | 4.18+ |
| 数据库 | SQLite3 | 5.1+ |
| 进程管理 | PM2 | - |

---

## 🚀 快速开始

### 前置要求

| 环境 | 版本要求 |
|------|----------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |

### 1. 安装依赖

```bash
# 克隆项目后进入目录
cd gear-knob-inventory

# 安装前端和后端依赖
npm install
```

### 2. 配置环境变量

```bash
# 复制环境配置模板
cp .env.development .env.development.local
cp .env.server .env  # 后端配置
```

#### 前端开发环境配置 (`.env.development.local`)

```bash
# API 地址 - 开发环境连接本地后端
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

#### 后端配置 (`.env`)

```bash
# 服务器端口
PORT=3000

# 运行环境
NODE_ENV=development

# 数据库路径
DB_PATH=./inventory.db

# CORS 配置 - 允许的跨域来源
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

### 3. 启动开发模式

```bash
# 同时启动前端和后端
npm run start
```

- 前端访问地址：`http://localhost:5173`
- 后端 API 地址：`http://localhost:3000/api`

---

## 🏭 生产环境部署

> 以下步骤适用于 Linux VPS 服务器部署

### 一、安全构建前端

#### 1. 配置生产环境变量

```bash
# 复制生产环境配置
cp .env.production .env.production.local
```

编辑 `.env.production.local`，修改 API 地址：

```bash
# 【重要】修改为你的服务器域名或 IP
VITE_API_BASE_URL=https://your-domain.com/api

# 可选：调整超时时间
VITE_API_TIMEOUT=15000
```

#### 2. 执行安全构建

```bash
# 构建生产版本（代码压缩、Tree-shaking）
npm run build
```

构建产物输出到 `dist/` 目录。

> ⚠️ **注意**：构建产物中不包含源代码，仅包含编译后的静态文件，安全可部署。

---

### 二、使用 PM2 守护后端进程

#### 1. 全局安装 PM2

```bash
npm install -g pm2
```

#### 2. 创建 PM2 配置文件

项目根目录已包含 `ecosystem.config.js`：

```javascript:ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gear-knob-server',
    script: 'server/index.js',
    cwd: '/home/www/gear-knob-inventory',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/wwwlogs/gear-knob-error.log',
    out_file: '/home/wwwlogs/gear-knob-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
```

#### 3. 启动服务

```bash
# 启动后端服务
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 查看日志
pm2 logs gear-knob-server
```

#### 4. 设置开机自启

```bash
# 生成启动命令
pm2 startup

# 保存当前进程列表
pm2 save
```

#### 常用 PM2 命令

```bash
pm2 status                      # 查看运行状态
pm2 logs gear-knob-server     # 查看实时日志
pm2 restart gear-knob-server  # 重启服务
pm2 stop gear-knob-server     # 停止服务
pm2 delete gear-knob-server   # 删除进程
pm2 monit                    # 监控面板
```

---

### 三、配置 Nginx 反向代理

#### 1. 创建 Nginx 配置文件

```nginx
# /etc/nginx/sites-available/gear-knob-inventory

server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器 IP

    # 前端静态文件（不暴露源代码）
    location / {
        root /home/www/gear-knob-inventory/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 反向代理到 PM2 端口
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3000/api/health;
    }
}
```

#### 2. 启用站点配置

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/gear-knob-inventory /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

---

### 四、配置 SSL 证书（HTTPS）

#### 方式一：使用 Let's Encrypt 免费证书（推荐）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（会自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

#### 方式二：使用宝塔面板（若已安装）

1. 登录宝塔面板
2. 进入 **网站** → **添加站点**
3. 填写域名，创建站点
4. 点击站点右侧 **SSL** 按钮
5. 选择 **Let's Encrypt** 或上传商业证书

#### SSL 配置参考（完整版）

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 前端静态文件
    location / {
        root /home/www/gear-knob-inventory/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

### 五、生产环境部署检查清单

- [ ] Node.js 已安装（`node -v`）
- [ ] npm 依赖已安装（`npm install`）
- [ ] `.env.production.local` 已配置线上 API 地址
- [ ] `.env`（后端）已配置线上域名到 CORS 白名单
- [ ] 前端已构建（`npm run build`）
- [ ] PM2 已安装并启动后端服务
- [ ] Nginx 已配置反向代理
- [ ] SSL 证书已配置（若使用 HTTPS）
- [ ] 防火墙已开放 80/443 端口
- [ ] 访问测试成功

---

## ⚠️ 重要：绝不能上传的文件

以下文件包含敏感信息，**必须**加入 `.gitignore`，**禁止**提交到公开代码仓库：

| 文件/目录 | 原因 |
|-----------|------|
| `.env` | 后端配置（包含敏感端口、CORS 设置） |
| `.env.*.local` | 本地环境变量 |
| `.env.production` | 生产环境 API 地址 |
| `.env.server` | 服务器敏感配置 |
| `dist/` | 构建产物（应从构建生成，不应提交） |
| `node_modules/` | npm 依赖（通过 `npm install` 安装） |
| `*.db` | SQLite 数据库文件 |
| `*.log` | 日志文件 |
| `.DS_Store` | macOS 系统文件 |
| `Thumbs.db` | Windows 系统文件 |

### 推荐的 .gitignore

```gitignore
# 环境配置
.env
.env.*
!.env.example

# 构建产物
dist/

# 依赖
node_modules/

# 数据库
*.db

# 日志
*.log
logs/

# 系统文件
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

---

## 📖 系统功能模块

| 模块 | 功能描述 |
|------|----------|
| 📊 **数据看板** | 库存统计、趋势图表、缺货预警、导出报表 |
| 🔫 **扫码工作台** | 扫码出库/入库、支持 PC 扫码枪和手机摄像头 |
| 📦 **入库与库存** | 商品管理、库存列表、打印标签、Excel 导出 |
| 🗺️ **库位地图** | 可视化货架布局、商品定位搜索 |

---

## 🔒 安全特性

- **乐观锁**：并发出库入库防止库存超卖
- **CORS 白名单**：严格控制跨域请求来源
- **输入验证**：所有 API 请求参数严格校验
- **SQL 注入防护**：使用参数化查询

---

## 📄 许可证

ISC License

---

*文档版本：2.0.0*  
*最后更新：2026-03-11*
