/**
 * 汽车水晶档把库存管理系统 - 后端 API 服务
 * Node.js + Express + SQLite
 */

const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// ==================== 中间件 ====================
app.use(cors())
app.use(express.json())

// ==================== 数据库连接 ====================
const dbPath = process.env.DB_PATH || './inventory.db'
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err.message)
    } else {
        console.log('✅ 数据库连接成功！')
    }
})

// Promise 封装
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err)
            else resolve({ lastID: this.lastID, changes: this.changes })
        })
    })
}

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err)
            else resolve(row)
        })
    })
}

// ==================== 数据库初始化 ====================
function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 商品表（多属性版本）- 添加版本号字段用于乐观锁
            db.run(`
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sku_code TEXT UNIQUE NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    logo_type TEXT,
                    color_style TEXT,
                    thread_size TEXT,
                    light_status TEXT,
                    attributes TEXT,
                    cost_price REAL NOT NULL DEFAULT 0,
                    current_stock INTEGER NOT NULL DEFAULT 0,
                    safe_stock INTEGER NOT NULL DEFAULT 0,
                    location_code VARCHAR(30),
                    image_url VARCHAR(255),
                    remark VARCHAR(500),
                    version INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `)

            // 尝试添加新字段（如果表已存在）
            db.run(`ALTER TABLE products ADD COLUMN logo_type TEXT`, () => {})
            db.run(`ALTER TABLE products ADD COLUMN color_style TEXT`, () => {})
            db.run(`ALTER TABLE products ADD COLUMN thread_size TEXT`, () => {})
            db.run(`ALTER TABLE products ADD COLUMN light_status TEXT`, () => {})
            db.run(`ALTER TABLE products ADD COLUMN location_code VARCHAR(30)`, () => {})
            db.run(`ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 0`, () => {})

            // 库位表
            db.run(`
                CREATE TABLE IF NOT EXISTS locations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    location_code VARCHAR(30) UNIQUE NOT NULL,
                    product_id INTEGER,
                    stock INTEGER NOT NULL DEFAULT 0,
                    max_capacity INTEGER NOT NULL DEFAULT 100,
                    zone VARCHAR(20),
                    is_active INTEGER NOT NULL DEFAULT 1,
                    remark VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products(id)
                )
            `)

            // 出入库流水表
            db.run(`
                CREATE TABLE IF NOT EXISTS inventory_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER NOT NULL,
                    location_id INTEGER,
                    type TEXT NOT NULL CHECK(type IN ('IN', 'OUT', 'ADJUST', 'TRANSFER')),
                    quantity INTEGER NOT NULL,
                    unit_cost REAL NOT NULL DEFAULT 0,
                    total_cost REAL NOT NULL DEFAULT 0,
                    reference_no VARCHAR(50),
                    operator VARCHAR(50),
                    remark VARCHAR(500),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products(id),
                    FOREIGN KEY (location_id) REFERENCES locations(id)
                )
            `)

            // 用户表
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    real_name VARCHAR(50),
                    role TEXT NOT NULL DEFAULT 'WAREHOUSE' CHECK(role IN ('ADMIN', 'WAREHOUSE', 'SALES')),
                    is_active INTEGER NOT NULL DEFAULT 1,
                    last_login DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `)

            // 插入测试数据（如果表为空）
            db.get("SELECT COUNT(*) as count FROM products", async (err, row) => {
                if (err) {
                    reject(err)
                    return
                }

                if (row.count === 0) {
                    // 插入测试商品（多属性版本）
                    const products = [
                        ['路虎-黑钻-M12-发光', '路虎水晶档把', '路虎', '黑钻', 'M12x1.5', '发光', 85.00, 15, 5, 'A-01-01'],
                        ['路虎-银钻-M14-发光', '路虎水晶档把', '路虎', '银钻', 'M14x1.5', '发光', 92.00, 12, 5, 'A-01-02'],
                        ['宝马-水晶标-不发光', '宝马水晶档把', 'BMW', '水晶标', '专用', '不发光', 45.00, 28, 10, 'A-02-01'],
                        ['奔驰-原厂-发光', '奔驰水晶档把', '奔驰', '原厂黑', '专用', '发光', 120.00, 8, 8, 'A-02-02'],
                        ['奔驰-AMG-发光', '奔驰AMG档把', 'AMG', '黑红', '专用', '发光', 185.00, 10, 5, 'A-02-03'],
                        ['保时捷-718-红-发光', '保时捷718档把', '保时捷', '红色', '专用', '发光', 280.00, 5, 5, 'B-01-01'],
                        ['奥迪-RS-黑-发光', '奥迪RS档把', '奥迪RS', '黑色', '专用', '发光', 95.00, 8, 5, 'B-01-02'],
                        ['雷克萨斯-发光', '雷克萨斯档把', '雷克萨斯', '黑色', '专用', '发光', 150.00, 6, 5, 'B-02-01'],
                        ['通用-水晶套-不发光', '通用档把套', '通用', '水晶', '通用', '不发光', 35.00, 32, 10, 'C-01-01'],
                        ['路虎-白钻-M12-不发光', '路虎水晶档把', '路虎', '白钻', 'M12x1.5', '不发光', 88.00, 20, 5, 'C-01-02']
                    ]

                    for (const p of products) {
                        await dbRun(
                            "INSERT INTO products (sku_code, name, logo_type, color_style, thread_size, light_status, cost_price, current_stock, safe_stock, location_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            p
                        )
                    }

                    // 插入测试库位
                    const locations = [
                        ['A-01-01', 1, 15, 50, 'A区'],
                        ['A-01-02', null, 0, 50, 'A区'],
                        ['A-01-03', 3, 28, 50, 'A区'],
                        ['A-02-01', null, 0, 50, 'A区'],
                        ['A-02-02', 2, 12, 50, 'A区'],
                        ['A-02-03', null, 0, 50, 'A区'],
                        ['A-03-01', null, 0, 50, 'A区'],
                        ['A-03-02', null, 0, 50, 'A区'],
                        ['A-03-03', null, 0, 50, 'A区'],
                        ['A-03-04', 5, 6, 50, 'A区'],
                        ['A-04-01', null, 0, 50, 'A区'],
                        ['A-04-02', null, 0, 50, 'A区'],
                        ['A-04-03', null, 0, 50, 'A区'],
                        ['A-04-04', null, 0, 50, 'A区'],
                        ['A-04-05', null, 0, 50, 'A区'],
                        ['B-01-01', null, 0, 50, 'B区'],
                        ['B-01-02', null, 0, 50, 'B区'],
                        ['B-01-03', null, 0, 50, 'B区'],
                        ['B-01-04', null, 0, 50, 'B区'],
                        ['B-01-05', 8, 8, 50, 'B区'],
                        ['B-02-01', 10, 20, 50, 'B区'],
                        ['B-02-02', null, 0, 50, 'B区'],
                        ['B-02-03', 4, 18, 50, 'B区'],
                        ['B-02-04', null, 0, 50, 'B区'],
                        ['B-02-05', null, 0, 50, 'B区'],
                        ['B-03-01', 7, 1, 50, 'B区'],
                        ['B-03-02', null, 0, 50, 'B区'],
                        ['B-03-03', null, 0, 50, 'B区'],
                        ['B-03-04', 6, 10, 50, 'B区'],
                        ['B-03-05', null, 0, 50, 'B区'],
                        ['B-04-01', null, 0, 50, 'B区'],
                        ['B-04-02', 9, 32, 50, 'B区'],
                        ['B-04-03', null, 0, 50, 'B区'],
                        ['B-04-04', null, 0, 50, 'B区'],
                        ['B-04-05', null, 0, 50, 'B区']
                    ]

                    for (const l of locations) {
                        await dbRun(
                            "INSERT INTO locations (location_code, product_id, stock, max_capacity, zone) VALUES (?, ?, ?, ?, ?)",
                            l
                        )
                    }

                    console.log('✅ 测试数据已插入')
                }

                resolve()
            })
        })
    })
}

// ==================== 工具函数 ====================
function formatDate(date) {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
}

function formatDateTime(date) {
    return new Date(date).toISOString().replace('T', ' ').substring(0, 19)
}

// ==================== API 接口 ====================

/**
 * GET /api/dashboard/stats
 * 获取大屏统计数据（总库存、总资产、本月入库出库、缺货预警）
 */
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const today = formatDate(new Date())
        const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

        // 1. 总库存数量
        const totalStockResult = await dbGet(`
            SELECT COALESCE(SUM(current_stock), 0) as total
            FROM products
        `)

        // 2. 总资产成本（库存 * 成本价）
        const totalAssetResult = await dbGet(`
            SELECT COALESCE(SUM(current_stock * cost_price), 0) as total
            FROM products
        `)

        // 3. 本月入库总量
        const monthInResult = await dbGet(`
            SELECT COALESCE(SUM(quantity), 0) as total
            FROM inventory_logs
            WHERE type = 'IN' AND DATE(created_at) >= ?
        `, [firstDayOfMonth])

        // 4. 本月出库总量
        const monthOutResult = await dbGet(`
            SELECT COALESCE(SUM(quantity), 0) as total
            FROM inventory_logs
            WHERE type = 'OUT' AND DATE(created_at) >= ?
        `, [firstDayOfMonth])

        // 5. 缺货/预警商品列表（当前库存 <= 安全库存）
        const lowStockItems = await dbAll(`
            SELECT
                id,
                sku_code,
                name,
                current_stock,
                safe_stock,
                cost_price,
                (safe_stock - current_stock) as shortage
            FROM products
            WHERE current_stock <= safe_stock
            ORDER BY shortage DESC
            LIMIT 20
        `)

        res.json({
            success: true,
            data: {
                totalStock: totalStockResult?.total || 0,
                totalAsset: parseFloat(totalAssetResult?.total) || 0,
                monthIn: monthInResult?.total || 0,
                monthOut: monthOutResult?.total || 0,
                lowStockItems: lowStockItems || []
            }
        })
    } catch (error) {
        console.error('获取大屏统计数据失败:', error)
        res.status(500).json({ success: false, message: '获取统计数据失败' })
    }
})

/**
 * GET /api/stats
 * 获取今日/本月数据看板统计
 */
app.get('/api/stats', async (req, res) => {
    try {
        const today = formatDate(new Date())
        const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

        // 今日统计
        const todayStats = await dbGet(`
            SELECT
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs
            WHERE type = 'OUT' AND DATE(created_at) = ?
        `, [today])

        // 昨日统计（用于计算趋势）
        const yesterday = formatDate(new Date(Date.now() - 86400000))
        const yesterdayStats = await dbGet(`
            SELECT
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs
            WHERE type = 'OUT' AND DATE(created_at) = ?
        `, [yesterday])

        // 本月统计
        const monthStats = await dbGet(`
            SELECT
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs
            WHERE type = 'OUT' AND DATE(created_at) >= ?
        `, [firstDayOfMonth])

        // 上月统计（用于计算月环比）
        const firstDayOfLastMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))
        const lastDayOfLastMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 0))
        const lastMonthStats = await dbGet(`
            SELECT
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs
            WHERE type = 'OUT' AND DATE(created_at) >= ? AND DATE(created_at) <= ?
        `, [firstDayOfLastMonth, lastDayOfLastMonth])

        // 计算趋势
        const todayQty = todayStats?.total_quantity || 0
        const yesterdayQty = yesterdayStats?.total_quantity || 0
        const todayTrend = yesterdayQty > 0 ? ((todayQty - yesterdayQty) / yesterdayQty * 100).toFixed(1) : 0

        const todayCost = parseFloat(todayStats?.total_cost) || 0
        const yesterdayCost = parseFloat(yesterdayStats?.total_cost) || 0
        const costTrend = yesterdayCost > 0 ? ((todayCost - yesterdayCost) / yesterdayCost * 100).toFixed(1) : 0

        const monthQty = monthStats?.total_quantity || 0
        const monthCost = parseFloat(monthStats?.total_cost) || 0

        const lastMonthQty = lastMonthStats?.total_quantity || 0
        const lastMonthCost = parseFloat(lastMonthStats?.total_cost) || 0
        const monthTrend = lastMonthCost > 0 ? ((monthCost - lastMonthCost) / lastMonthCost * 100).toFixed(1) : 0

        res.json({
            success: true,
            data: {
                todayQuantity: todayQty,
                todayQuantityTrend: parseFloat(todayTrend),
                todayCost: todayCost.toFixed(2),
                todayCostTrend: parseFloat(costTrend),
                monthQuantity: monthQty,
                monthCost: monthCost.toFixed(2),
                monthCostTrend: parseFloat(monthTrend)
            }
        })
    } catch (error) {
        console.error('获取统计数据失败:', error)
        res.status(500).json({ success: false, message: '获取统计数据失败' })
    }
})

/**
 * GET /api/stats/trend
 * 获取近30天发货趋势
 */
app.get('/api/stats/trend', async (req, res) => {
    try {
        const thirtyDaysAgo = formatDate(new Date(Date.now() - 30 * 86400000))

        const rows = await dbAll(`
            SELECT
                DATE(created_at) as date,
                SUM(quantity) as quantity
            FROM inventory_logs
            WHERE type = 'OUT' AND DATE(created_at) >= ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [thirtyDaysAgo])

        // 补齐缺失的日期
        const result = []
        const today = new Date()
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = formatDate(date)
            const found = rows.find(r => r.date === dateStr)
            result.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                quantity: found ? parseInt(found.quantity) : 0
            })
        }

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('获取趋势数据失败:', error)
        res.status(500).json({ success: false, message: '获取趋势数据失败' })
    }
})

/**
 * GET /api/stats/top-products
 * 获取本月发货 Top 10
 */
app.get('/api/stats/top-products', async (req, res) => {
    try {
        const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

        const rows = await dbAll(`
            SELECT
                p.id,
                p.sku_code,
                p.name,
                COALESCE(SUM(il.quantity), 0) as quantity,
                COALESCE(SUM(il.quantity * il.unit_cost), 0) as totalCost
            FROM products p
            LEFT JOIN inventory_logs il ON p.id = il.product_id AND il.type = 'OUT' AND DATE(il.created_at) >= ?
            GROUP BY p.id, p.sku_code, p.name
            ORDER BY quantity DESC
            LIMIT 10
        `, [firstDayOfMonth])

        res.json({
            success: true,
            data: rows
        })
    } catch (error) {
        console.error('获取Top产品失败:', error)
        res.status(500).json({ success: false, message: '获取Top产品失败' })
    }
})

/**
 * GET /api/products/low-stock
 * 获取缺货预警列表
 */
app.get('/api/products/low-stock', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT
                id,
                sku_code,
                name,
                current_stock,
                safe_stock
            FROM products
            WHERE current_stock <= safe_stock
            ORDER BY (safe_stock - current_stock) DESC
        `)

        res.json({
            success: true,
            data: rows
        })
    } catch (error) {
        console.error('获取缺货预警失败:', error)
        res.status(500).json({ success: false, message: '获取缺货预警失败' })
    }
})

/**
 * GET /api/products
 * 获取商品列表
 */
app.get('/api/products', async (req, res) => {
    try {
        const { page = 1, pageSize = 20, keyword = '' } = req.query
        const offset = (page - 1) * pageSize

        let sql = 'SELECT * FROM products'
        let countSql = 'SELECT COUNT(*) as total FROM products'
        const params = []

        if (keyword) {
            sql += ' WHERE name LIKE ? OR sku_code LIKE ?'
            countSql += ' WHERE name LIKE ? OR sku_code LIKE ?'
            const likeKeyword = `%${keyword}%`
            params.push(likeKeyword, likeKeyword)
        }

        sql += ' ORDER BY id DESC LIMIT ? OFFSET ?'

        const countParams = params.slice()
        const countResult = await dbGet(countSql, countParams)
        const rows = await dbAll(sql, [...params.slice(0, -2), parseInt(pageSize), parseInt(offset)])

        res.json({
            success: true,
            data: rows,
            total: countResult.total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        })
    } catch (error) {
        console.error('获取商品列表失败:', error)
        res.status(500).json({ success: false, message: '获取商品列表失败' })
    }
})

/**
 * GET /api/products/:id
 * 获取商品详情
 */
app.get('/api/products/:id', async (req, res) => {
    try {
        const row = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id])

        if (!row) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        res.json({
            success: true,
            data: row
        })
    } catch (error) {
        console.error('获取商品详情失败:', error)
        res.status(500).json({ success: false, message: '获取商品详情失败' })
    }
})

/**
 * GET /api/products/sku/:skuCode
 * 根据SKU条码获取商品
 */
app.get('/api/products/sku/:skuCode', async (req, res) => {
    try {
        const row = await dbGet(
            'SELECT p.*, l.location_code FROM products p LEFT JOIN locations l ON p.id = l.product_id WHERE p.sku_code = ?',
            [req.params.skuCode]
        )

        if (!row) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        res.json({
            success: true,
            data: row
        })
    } catch (error) {
        console.error('获取商品失败:', error)
        res.status(500).json({ success: false, message: '获取商品失败' })
    }
})

/**
 * POST /api/products
 * 创建商品 - 增强 Payload 验证
 */
app.post('/api/products', async (req, res) => {
    try {
        const {
            sku_code,
            name,
            logo_type,
            color_style,
            thread_size,
            light_status,
            attributes,
            cost_price,
            safe_stock,
            location_code,
            image_url,
            remark
        } = req.body

        // 必填字段验证
        if (!sku_code || typeof sku_code !== 'string' || sku_code.trim() === '') {
            return res.status(400).json({ success: false, message: '缺少有效的SKU条码' })
        }
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ success: false, message: '缺少有效的商品名称' })
        }

        // 字段长度限制（防止注入）
        const safeSkuCode = sku_code.trim().substring(0, 100)
        const safeName = name.trim().substring(0, 100)
        const safeLogoType = (logo_type && typeof logo_type === 'string') ? logo_type.trim().substring(0, 50) : null
        const safeColorStyle = (color_style && typeof color_style === 'string') ? color_style.trim().substring(0, 50) : null
        const safeThreadSize = (thread_size && typeof thread_size === 'string') ? thread_size.trim().substring(0, 50) : null
        const safeLightStatus = (light_status && typeof light_status === 'string') ? light_status.trim().substring(0, 50) : null
        const safeLocationCode = (location_code && typeof location_code === 'string') ? location_code.trim().substring(0, 30) : null
        const safeImageUrl = (image_url && typeof image_url === 'string') ? image_url.trim().substring(0, 255) : null
        const safeRemark = (remark && typeof remark === 'string') ? remark.trim().substring(0, 500) : null

        // 数值字段验证
        const safeCostPrice = parseFloat(cost_price)
        if (isNaN(safeCostPrice) || safeCostPrice < 0 || safeCostPrice > 999999.99) {
            return res.status(400).json({ success: false, message: '成本价必须在 0-999999.99 之间' })
        }

        const safeSafeStock = parseInt(safe_stock, 10) || 0
        if (isNaN(safeSafeStock) || safeSafeStock < 0 || safeSafeStock > 999999) {
            return res.status(400).json({ success: false, message: '安全库存必须在 0-999999 之间' })
        }

        const result = await dbRun(
            `INSERT INTO products (sku_code, name, logo_type, color_style, thread_size, light_status, attributes, cost_price, safe_stock, location_code, image_url, remark, version)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [safeSkuCode, safeName, safeLogoType, safeColorStyle, safeThreadSize, safeLightStatus, JSON.stringify(attributes), safeCostPrice, safeSafeStock, safeLocationCode, safeImageUrl, safeRemark]
        )

        res.json({
            success: true,
            message: '商品创建成功',
            data: { id: result.lastID }
        })
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ success: false, message: 'SKU条码已存在' })
        }
        console.error('创建商品失败:', error)
        res.status(500).json({ success: false, message: '创建商品失败' })
    }
})

/**
 * POST /api/inventory/out
 * 扫码出库接口 - 防御并发Race Condition
 * 1. 使用乐观锁 (version) 防止并发冲突
 * 2. 使用原子 UPDATE + WHERE 条件确保库存不为负
 * 3. 严格验证 Payload
 */
app.post('/api/inventory/out', async (req, res) => {
    // ==================== 1. Payload 严格验证 ====================
    const { sku_code, quantity, location_id, operator, remark, reference_no, expected_version } = req.body
    
    // 必填字段验证
    if (!sku_code || typeof sku_code !== 'string' || sku_code.trim() === '') {
        return res.status(400).json({ success: false, message: '缺少有效的SKU条码' })
    }
    
    // 数量验证：正整数，上限 10000
    if (quantity === undefined || quantity === null) {
        return res.status(400).json({ success: false, message: '缺少数量参数' })
    }
    
    const parsedQty = parseInt(quantity, 10)
    if (isNaN(parsedQty) || parsedQty <= 0 || parsedQty > 10000) {
        return res.status(400).json({ success: false, message: '数量必须为 1-10000 的正整数' })
    }
    
    // 操作人验证
    const safeOperator = (operator && typeof operator === 'string') 
        ? operator.substring(0, 50) 
        : 'Anonymous'
    
    // 备注长度限制
    const safeRemark = (remark && typeof remark === 'string')
        ? remark.substring(0, 200)
        : ''

    try {
        // ==================== 2. 获取产品及版本号 ====================
        const product = await dbGet(
            'SELECT id, cost_price, current_stock, version FROM products WHERE sku_code = ?', 
            [sku_code.trim()]
        )

        if (!product) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        // 客户端可传入期望版本号用于乐观锁（可选）
        const clientVersion = expected_version !== undefined 
            ? parseInt(expected_version, 10) 
            : product.version

        // ==================== 3. 原子操作：条件更新 ====================
        // 关键：UPDATE ... WHERE 条件同时检查库存 >= 数量 AND version 匹配
        // 这样即使并发请求，也只有第一个能成功
        const updateResult = await dbRun(
            `UPDATE products 
             SET current_stock = current_stock - ?, 
                 version = version + 1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = ? 
               AND current_stock >= ? 
               AND version = ?`,
            [parsedQty, product.id, parsedQty, clientVersion]
        )

        // ==================== 4. 检查更新是否成功 ====================
        if (updateResult.changes === 0) {
            // 可能是：库存不足 或 版本号不匹配（并发冲突）
            const currentProduct = await dbGet(
                'SELECT current_stock, version FROM products WHERE id = ?',
                [product.id]
            )
            
            if (currentProduct.version !== clientVersion) {
                // 版本号不匹配 - 并发冲突
                return res.status(409).json({ 
                    success: false, 
                    message: '操作过于频繁，请稍后重试',
                    code: 'CONCURRENT_CONFLICT'
                })
            } else {
                // 库存不足
                return res.status(400).json({
                    success: false,
                    message: `库存不足，当前库存: ${currentProduct.current_stock}`,
                    code: 'INSUFFICIENT_STOCK'
                })
            }
        }

        // ==================== 5. 获取更新后的库存（用于返回） ====================
        const updatedProduct = await dbGet(
            'SELECT current_stock, version FROM products WHERE id = ?',
            [product.id]
        )

        const totalCost = parsedQty * product.cost_price

        // ==================== 6. 记录流水（事务外） ====================
        await dbRun(
            `INSERT INTO inventory_logs (product_id, location_id, type, quantity, unit_cost, total_cost, reference_no, operator, remark)
             VALUES (?, ?, 'OUT', ?, ?, ?, ?, ?, ?)`,
            [product.id, location_id || null, parsedQty, product.cost_price, totalCost, reference_no, safeOperator, safeRemark]
        )

        // 如果有指定库位，扣减库位库存
        if (location_id) {
            await dbRun(
                'UPDATE locations SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [parsedQty, location_id, parsedQty]
            )
        }

        res.json({
            success: true,
            message: '出库成功',
            data: {
                product_id: product.id,
                sku_code: sku_code.trim(),
                quantity: parsedQty,
                unit_cost: product.cost_price,
                total_cost: totalCost,
                remaining_stock: updatedProduct.current_stock,
                version: updatedProduct.version
            }
        })
    } catch (error) {
        console.error('出库失败:', error)
        res.status(500).json({ success: false, message: '出库失败' })
    }
})

/**
 * POST /api/inventory/in
 * 扫码入库接口 - 防御并发Race Condition
 * 1. 使用乐观锁 (version) 防止并发冲突
 * 2. 使用原子 UPDATE 确保数据一致性
 * 3. 严格验证 Payload
 */
app.post('/api/inventory/in', async (req, res) => {
    // ==================== 1. Payload 严格验证 ====================
    const { sku_code, quantity, location_id, operator, remark, reference_no, cost_price, expected_version } = req.body
    
    // 必填字段验证
    if (!sku_code || typeof sku_code !== 'string' || sku_code.trim() === '') {
        return res.status(400).json({ success: false, message: '缺少有效的SKU条码' })
    }
    
    // 数量验证：正整数，上限 100000
    if (quantity === undefined || quantity === null) {
        return res.status(400).json({ success: false, message: '缺少数量参数' })
    }
    
    const parsedQty = parseInt(quantity, 10)
    if (isNaN(parsedQty) || parsedQty <= 0 || parsedQty > 100000) {
        return res.status(400).json({ success: false, message: '数量必须为 1-100000 的正整数' })
    }
    
    // 操作人验证
    const safeOperator = (operator && typeof operator === 'string') 
        ? operator.substring(0, 50) 
        : 'Anonymous'
    
    // 备注长度限制
    const safeRemark = (remark && typeof remark === 'string')
        ? remark.substring(0, 200)
        : ''

    try {
        // ==================== 2. 查询商品是否存在 ====================
        const product = await dbGet(
            'SELECT id, cost_price, current_stock, version FROM products WHERE sku_code = ?',
            [sku_code.trim()]
        )

        if (!product) {
            return res.status(404).json({ success: false, message: '商品不存在，请先创建商品' })
        }

        const productId = product.id
        const unitCost = product.cost_price  // 使用数据库中已有成本价
        
        // 客户端可传入期望版本号用于乐观锁（可选）
        const clientVersion = expected_version !== undefined 
            ? parseInt(expected_version, 10) 
            : product.version

        const totalCost = parsedQty * unitCost

        // ==================== 3. 原子操作：更新库存和版本号 ====================
        const updateResult = await dbRun(
            `UPDATE products 
             SET current_stock = current_stock + ?, 
                 version = version + 1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = ? 
               AND version = ?`,
            [parsedQty, productId, clientVersion]
        )

        // ==================== 4. 检查更新是否成功 ====================
        if (updateResult.changes === 0) {
            // 版本号不匹配 - 并发冲突
            return res.status(409).json({ 
                success: false, 
                message: '操作过于频繁，请稍后重试',
                code: 'CONCURRENT_CONFLICT'
            })
        }

        // ==================== 5. 获取更新后的库存 ====================
        const updatedProduct = await dbGet(
            'SELECT current_stock, version FROM products WHERE id = ?',
            [productId]
        )

        // ==================== 6. 记录流水 ====================
        await dbRun(
            `INSERT INTO inventory_logs (product_id, location_id, type, quantity, unit_cost, total_cost, reference_no, operator, remark)
             VALUES (?, ?, 'IN', ?, ?, ?, ?, ?, ?)`,
            [productId, location_id || null, parsedQty, unitCost, totalCost, reference_no, safeOperator, safeRemark]
        )

        // 如果有指定库位，增加库位库存
        if (location_id) {
            await dbRun(
                'UPDATE locations SET stock = stock + ? WHERE id = ?',
                [parsedQty, location_id]
            )
        }

        res.json({
            success: true,
            message: '入库成功',
            data: {
                product_id: productId,
                sku_code: sku_code.trim(),
                quantity: parsedQty,
                unit_cost: unitCost,
                total_cost: totalCost,
                remaining_stock: updatedProduct.current_stock,
                version: updatedProduct.version
            }
        })
    } catch (error) {
        console.error('入库失败:', error)
        res.status(500).json({ success: false, message: '入库失败' })
    }
})
            }
        })
    } catch (error) {
        console.error('入库失败:', error)
        res.status(500).json({ success: false, message: '入库失败' })
    }
})

/**
 * GET /api/inventory/logs
 * 获取出入库流水记录
 */
app.get('/api/inventory/logs', async (req, res) => {
    try {
        const { type, startDate, endDate, product_id, page = 1, pageSize = 50 } = req.query
        const offset = (page - 1) * pageSize

        let sql = `
            SELECT
                il.*,
                p.name as product_name,
                p.sku_code,
                l.location_code
            FROM inventory_logs il
            LEFT JOIN products p ON il.product_id = p.id
            LEFT JOIN locations l ON il.location_id = l.id
            WHERE 1=1
        `
        const params = []

        if (type) {
            sql += ' AND il.type = ?'
            params.push(type)
        }

        if (startDate) {
            sql += ' AND il.created_at >= ?'
            params.push(startDate)
        }

        if (endDate) {
            sql += ' AND il.created_at <= ?'
            params.push(endDate)
        }

        if (product_id) {
            sql += ' AND il.product_id = ?'
            params.push(product_id)
        }

        sql += ' ORDER BY il.created_at DESC LIMIT ? OFFSET ?'

        const rows = await dbAll(sql, [...params, parseInt(pageSize), parseInt(offset)])

        // 格式化 attributes
        const formattedRows = rows.map(row => ({
            ...row,
            attributes: row.attributes ? (typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes) : null
        }))

        res.json({
            success: true,
            data: formattedRows
        })
    } catch (error) {
        console.error('获取流水记录失败:', error)
        res.status(500).json({ success: false, message: '获取流水记录失败' })
    }
})

/**
 * GET /api/inventory/today-logs
 * 获取今日出库明细（扫码出库页面使用）
 */
app.get('/api/inventory/today-logs', async (req, res) => {
    try {
        const today = formatDate(new Date())
        const startDate = today + ' 00:00:00'
        const endDate = today + ' 23:59:59'

        const rows = await dbAll(`
            SELECT
                il.*,
                p.name as product_name,
                p.sku_code,
                p.attributes
            FROM inventory_logs il
            LEFT JOIN products p ON il.product_id = p.id
            WHERE il.type = 'OUT' AND il.created_at BETWEEN ? AND ?
            ORDER BY il.created_at DESC
        `, [startDate, endDate])

        // 格式化 attributes
        const formattedRows = rows.map(row => ({
            ...row,
            attributes: row.attributes ? (typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes) : null
        }))

        res.json({
            success: true,
            data: formattedRows
        })
    } catch (error) {
        console.error('获取今日出库明细失败:', error)
        res.status(500).json({ success: false, message: '获取今日出库明细失败' })
    }
})

/**
 * GET /api/locations
 * 获取库位列表
 */
app.get('/api/locations', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT
                l.*,
                p.name as product_name,
                p.sku_code,
                p.attributes as product_attributes
            FROM locations l
            LEFT JOIN products p ON l.product_id = p.id
            WHERE l.is_active = 1
            ORDER BY l.location_code
        `)

        res.json({
            success: true,
            data: rows
        })
    } catch (error) {
        console.error('获取库位列表失败:', error)
        res.status(500).json({ success: false, message: '获取库位列表失败' })
    }
})

/**
 * GET /api/locations/:code
 * 根据库位编码获取库位信息
 */
app.get('/api/locations/code/:code', async (req, res) => {
    try {
        const row = await dbGet(`
            SELECT
                l.*,
                p.name as product_name,
                p.sku_code,
                p.attributes as product_attributes,
                p.current_stock as product_stock
            FROM locations l
            LEFT JOIN products p ON l.product_id = p.id
            WHERE l.location_code = ?
        `, [req.params.code])

        if (!row) {
            return res.status(404).json({ success: false, message: '库位不存在' })
        }

        res.json({
            success: true,
            data: row
        })
    } catch (error) {
        console.error('获取库位信息失败:', error)
        res.status(500).json({ success: false, message: '获取库位信息失败' })
    }
})

/**
 * POST /api/locations
 * 创建库位
 */
app.post('/api/locations', async (req, res) => {
    try {
        const { location_code, product_id, max_capacity, zone, remark } = req.body

        if (!location_code) {
            return res.status(400).json({ success: false, message: '缺少库位编码' })
        }

        const result = await dbRun(
            `INSERT INTO locations (location_code, product_id, max_capacity, zone, remark) VALUES (?, ?, ?, ?, ?)`,
            [location_code, product_id || null, max_capacity || 100, zone, remark]
        )

        res.json({
            success: true,
            message: '库位创建成功',
            data: { id: result.lastID }
        })
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ success: false, message: '库位编码已存在' })
        }
        console.error('创建库位失败:', error)
        res.status(500).json({ success: false, message: '创建库位失败' })
    }
})

/**
 * PUT /api/products/:id
 * 更新商品信息 - 增强 Payload 验证 + 乐观锁
 */
app.put('/api/products/:id', async (req, res) => {
    try {
        const {
            name,
            logo_type,
            color_style,
            thread_size,
            light_status,
            attributes,
            cost_price,
            safe_stock,
            location_code,
            image_url,
            remark,
            expected_version
        } = req.body
        const { id } = req.params

        // ID 验证
        const parsedId = parseInt(id, 10)
        if (isNaN(parsedId) || parsedId <= 0) {
            return res.status(400).json({ success: false, message: '无效的商品ID' })
        }

        // 字段验证
        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            return res.status(400).json({ success: false, message: '商品名称无效' })
        }

        const safeName = name ? name.trim().substring(0, 100) : undefined
        const safeLogoType = (logo_type && typeof logo_type === 'string') ? logo_type.trim().substring(0, 50) : undefined
        const safeColorStyle = (color_style && typeof color_style === 'string') ? color_style.trim().substring(0, 50) : undefined
        const safeThreadSize = (thread_size && typeof thread_size === 'string') ? thread_size.trim().substring(0, 50) : undefined
        const safeLightStatus = (light_status && typeof light_status === 'string') ? light_status.trim().substring(0, 50) : undefined
        const safeLocationCode = (location_code && typeof location_code === 'string') ? location_code.trim().substring(0, 30) : undefined
        const safeImageUrl = (image_url && typeof image_url === 'string') ? image_url.trim().substring(0, 255) : undefined
        const safeRemark = (remark && typeof remark === 'string') ? remark.trim().substring(0, 500) : undefined

        // 数值字段验证
        if (cost_price !== undefined) {
            const safeCostPrice = parseFloat(cost_price)
            if (isNaN(safeCostPrice) || safeCostPrice < 0 || safeCostPrice > 999999.99) {
                return res.status(400).json({ success: false, message: '成本价必须在 0-999999.99 之间' })
            }
        }

        if (safe_stock !== undefined) {
            const safeStock = parseInt(safe_stock, 10)
            if (isNaN(safeStock) || safeStock < 0 || safeStock > 999999) {
                return res.status(400).json({ success: false, message: '安全库存必须在 0-999999 之间' })
            }
        }

        // 获取当前产品信息（用于乐观锁）
        const currentProduct = await dbGet('SELECT version FROM products WHERE id = ?', [parsedId])
        if (!currentProduct) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        // 版本号验证（乐观锁）
        const clientVersion = expected_version !== undefined 
            ? parseInt(expected_version, 10) 
            : currentProduct.version

        // 构建动态更新语句
        const updates = []
        const params = []
        
        if (safeName !== undefined) { updates.push('name = ?'); params.push(safeName) }
        if (safeLogoType !== undefined) { updates.push('logo_type = ?'); params.push(safeLogoType) }
        if (safeColorStyle !== undefined) { updates.push('color_style = ?'); params.push(safeColorStyle) }
        if (safeThreadSize !== undefined) { updates.push('thread_size = ?'); params.push(safeThreadSize) }
        if (safeLightStatus !== undefined) { updates.push('light_status = ?'); params.push(safeLightStatus) }
        if (attributes !== undefined) { updates.push('attributes = ?'); params.push(JSON.stringify(attributes)) }
        if (cost_price !== undefined) { updates.push('cost_price = ?'); params.push(parseFloat(cost_price)) }
        if (safe_stock !== undefined) { updates.push('safe_stock = ?'); params.push(parseInt(safe_stock, 10)) }
        if (safeLocationCode !== undefined) { updates.push('location_code = ?'); params.push(safeLocationCode) }
        if (safeImageUrl !== undefined) { updates.push('image_url = ?'); params.push(safeImageUrl) }
        if (safeRemark !== undefined) { updates.push('remark = ?'); params.push(safeRemark) }
        
        updates.push('version = version + 1')
        updates.push('updated_at = CURRENT_TIMESTAMP')
        
        // 添加版本号条件实现乐观锁
        params.push(clientVersion)
        params.push(parsedId)

        const result = await dbRun(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND version = ?`,
            params
        )

        if (result.changes === 0) {
            return res.status(409).json({ 
                success: false, 
                message: '数据已被其他操作修改，请刷新后重试',
                code: 'CONCURRENT_CONFLICT'
            })
        }

        res.json({ 
            success: true, 
            message: '商品更新成功',
            data: { version: clientVersion + 1 }
        })
    } catch (error) {
        console.error('更新商品失败:', error)
        res.status(500).json({ success: false, message: '更新商品失败' })
    }
})

/**
 * DELETE /api/products/:id
 * 删除商品
 */
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params

        // 检查是否有库存
        const product = await dbGet('SELECT current_stock FROM products WHERE id = ?', [id])
        if (product && product.current_stock > 0) {
            return res.status(400).json({ success: false, message: '该商品还有库存，无法删除' })
        }

        const result = await dbRun('DELETE FROM products WHERE id = ?', [id])

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        res.json({ success: true, message: '商品删除成功' })
    } catch (error) {
        console.error('删除商品失败:', error)
        res.status(500).json({ success: false, message: '删除商品失败' })
    }
})

/**
 * GET /api/health
 * 健康检查
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ==================== 导出接口 ====================

/**
 * GET /api/export/inventory
 * 导出库存数据 Excel
 */
app.get('/api/export/inventory', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT
                p.sku_code as 'SKU条码',
                p.name as '商品名称',
                p.attributes as '属性',
                p.cost_price as '成本价',
                p.current_stock as '当前库存',
                p.safe_stock as '安全库存',
                p.image_url as '图片URL',
                p.remark as '备注',
                l.location_code as '库位',
                p.created_at as '创建时间',
                p.updated_at as '更新时间'
            FROM products p
            LEFT JOIN locations l ON p.id = l.product_id
            ORDER BY p.id DESC
        `)

        // 处理 attributes 字段
        const data = rows.map(row => ({
            ...row,
            '属性': row['属性'] ? (typeof row['属性'] === 'string' ? row['属性'] : JSON.stringify(row['属性'])) : ''
        }))

        res.json({
            success: true,
            data: data,
            count: data.length
        })
    } catch (error) {
        console.error('导出库存数据失败:', error)
        res.status(500).json({ success: false, message: '导出库存数据失败' })
    }
})

/**
 * GET /api/export/logs
 * 导出出入库流水 Excel
 */
app.get('/api/export/logs', async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query

        let sql = `
            SELECT
                il.id as '流水ID',
                p.sku_code as 'SKU条码',
                p.name as '商品名称',
                l.location_code as '库位',
                il.type as '类型',
                il.quantity as '数量',
                il.unit_cost as '单价',
                il.total_cost as '总成本',
                il.reference_no as '关联单号',
                il.operator as '操作人',
                il.remark as '备注',
                il.created_at as '操作时间'
            FROM inventory_logs il
            LEFT JOIN products p ON il.product_id = p.id
            LEFT JOIN locations l ON il.location_id = l.id
            WHERE 1=1
        `
        const params = []

        if (type) {
            sql += ' AND il.type = ?'
            params.push(type)
        }

        if (startDate) {
            sql += ' AND il.created_at >= ?'
            params.push(startDate)
        }

        if (endDate) {
            sql += ' AND il.created_at <= ?'
            params.push(endDate)
        }

        sql += ' ORDER BY il.created_at DESC'

        const rows = await dbAll(sql, params)

        // 转换类型为中文
        const data = rows.map(row => ({
            ...row,
            '类型': row['类型'] === 'IN' ? '入库' : row['类型'] === 'OUT' ? '出库' : row['类型'] === 'ADJUST' ? '调整' : '调拨'
        }))

        res.json({
            success: true,
            data: data,
            count: data.length
        })
    } catch (error) {
        console.error('导出流水数据失败:', error)
        res.status(500).json({ success: false, message: '导出流水数据失败' })
    }
})

// ==================== 启动服务器 ====================
async function startServer() {
    try {
        // 先执行数据库迁移
        await runMigrations()
        // 然后初始化数据库
        await initDatabase()
        app.listen(PORT, () => {
            console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('❌ 服务器启动失败:', error)
        process.exit(1)
    }
}

// ==================== 迁移函数（供启动时调用）====================
function runMigrations() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 创建迁移记录表
            db.run(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) { reject(err); return }
                
                // 迁移 001: 添加 version 字段
                db.get('SELECT id FROM migrations WHERE name = ?', ['001_add_version'], (err, row) => {
                    if (err) { reject(err); return }
                    
                    if (!row) {
                        // 执行迁移
                        db.run('ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 0', (err) => {
                            if (err && !err.message.includes('duplicate column')) {
                                console.log(`⚠️  迁移 001: ${err.message}`)
                            } else {
                                console.log('✅ 执行迁移: 001_add_version')
                                db.run('INSERT INTO migrations (name) VALUES (?)', ['001_add_version'])
                            }
                            
                            // 添加索引优化并发性能
                            db.run('CREATE INDEX IF NOT EXISTS idx_products_version ON products(version)', () => {
                                db.run('CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku_code)', () => {
                                    resolve()
                                })
                            })
                        })
                    } else {
                        console.log('⏭️  迁移已执行: 001_add_version')
                        resolve()
                    }
                })
            })
        })
    })
}

startServer()

module.exports = app
