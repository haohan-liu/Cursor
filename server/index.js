/**
 * 汽车水晶档把库存管理系统 - 后端 API 服务
 * Node.js + Express + MySQL
 */

const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// ==================== 中间件 ====================
app.use(cors())
app.use(express.json())

// ==================== 数据库连接 ====================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'gear_inventory',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection()
        console.log('✅ 数据库连接成功！')
        connection.release()
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message)
    }
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
 * GET /api/stats
 * 获取今日/本月数据看板统计
 */
app.get('/api/stats', async (req, res) => {
    try {
        const today = formatDate(new Date())
        const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

        // 今日统计
        const [todayStats] = await pool.execute(`
            SELECT 
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs 
            WHERE type = 'OUT' AND DATE(created_at) = ?
        `, [today])

        // 昨日统计（用于计算趋势）
        const yesterday = formatDate(new Date(Date.now() - 86400000))
        const [yesterdayStats] = await pool.execute(`
            SELECT 
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs 
            WHERE type = 'OUT' AND DATE(created_at) = ?
        `, [yesterday])

        // 本月统计
        const [monthStats] = await pool.execute(`
            SELECT 
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs 
            WHERE type = 'OUT' AND DATE(created_at) >= ?
        `, [firstDayOfMonth])

        // 上月统计（用于计算月环比）
        const firstDayOfLastMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))
        const lastDayOfLastMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 0))
        const [lastMonthStats] = await pool.execute(`
            SELECT 
                COALESCE(SUM(quantity), 0) as total_quantity,
                COALESCE(SUM(quantity * unit_cost), 0) as total_cost
            FROM inventory_logs 
            WHERE type = 'OUT' AND DATE(created_at) >= ? AND DATE(created_at) <= ?
        `, [firstDayOfLastMonth, lastDayOfLastMonth])

        // 计算趋势
        const todayQty = todayStats[0].total_quantity || 0
        const yesterdayQty = yesterdayStats[0].total_quantity || 0
        const todayTrend = yesterdayQty > 0 ? ((todayQty - yesterdayQty) / yesterdayQty * 100).toFixed(1) : 0

        const todayCost = parseFloat(todayStats[0].total_cost) || 0
        const yesterdayCost = parseFloat(yesterdayStats[0].total_cost) || 0
        const costTrend = yesterdayCost > 0 ? ((todayCost - yesterdayCost) / yesterdayCost * 100).toFixed(1) : 0

        const monthQty = monthStats[0].total_quantity || 0
        const monthCost = parseFloat(monthStats[0].total_cost) || 0

        const lastMonthQty = lastMonthStats[0].total_quantity || 0
        const lastMonthCost = parseFloat(lastMonthStats[0].total_cost) || 0
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

        const [rows] = await pool.execute(`
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

        const [rows] = await pool.execute(`
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
        const [rows] = await pool.execute(`
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

        const [countResult] = await pool.execute(countSql, params.slice(0, -2))
        const [rows] = await pool.execute(sql, [...params.slice(0, -2), parseInt(pageSize), parseInt(offset)])

        res.json({
            success: true,
            data: rows,
            total: countResult[0].total,
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
        const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id])

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        res.json({
            success: true,
            data: rows[0]
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
        const [rows] = await pool.execute(
            'SELECT p.*, l.location_code FROM products p LEFT JOIN locations l ON p.id = l.product_id WHERE p.sku_code = ?',
            [req.params.skuCode]
        )

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        res.json({
            success: true,
            data: rows[0]
        })
    } catch (error) {
        console.error('获取商品失败:', error)
        res.status(500).json({ success: false, message: '获取商品失败' })
    }
})

/**
 * POST /api/products
 * 创建商品
 */
app.post('/api/products', async (req, res) => {
    try {
        const { sku_code, name, attributes, cost_price, safe_stock, image_url, remark } = req.body

        if (!sku_code || !name || !cost_price) {
            return res.status(400).json({ success: false, message: '缺少必要参数' })
        }

        const [result] = await pool.execute(
            `INSERT INTO products (sku_code, name, attributes, cost_price, safe_stock, image_url, remark) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sku_code, name, JSON.stringify(attributes), cost_price, safe_stock || 0, image_url, remark]
        )

        res.json({
            success: true,
            message: '商品创建成功',
            data: { id: result.insertId }
        })
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'SKU条码已存在' })
        }
        console.error('创建商品失败:', error)
        res.status(500).json({ success: false, message: '创建商品失败' })
    }
})

/**
 * POST /api/inventory/out
 * 扫码出库接口
 */
app.post('/api/inventory/out', async (req, res) => {
    const connection = await pool.getConnection()
    try {
        const { sku_code, quantity = 1, location_id, operator, remark, reference_no } = req.body

        if (!sku_code) {
            return res.status(400).json({ success: false, message: '缺少SKU条码' })
        }

        await connection.beginTransaction()

        // 1. 查询商品信息
        const [products] = await connection.execute(
            'SELECT id, cost_price, current_stock FROM products WHERE sku_code = ?',
            [sku_code]
        )

        if (products.length === 0) {
            await connection.rollback()
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        const product = products[0]

        // 2. 检查库存
        if (product.current_stock < quantity) {
            await connection.rollback()
            return res.status(400).json({ 
                success: false, 
                message: `库存不足，当前库存: ${product.current_stock}` 
            })
        }

        const totalCost = quantity * product.cost_price

        // 3. 写入出库流水
        await connection.execute(
            `INSERT INTO inventory_logs (product_id, location_id, type, quantity, unit_cost, total_cost, reference_no, operator, remark)
             VALUES (?, ?, 'OUT', ?, ?, ?, ?, ?, ?)`,
            [product.id, location_id || null, quantity, product.cost_price, totalCost, reference_no, operator, remark]
        )

        // 4. 扣减商品库存
        await connection.execute(
            'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
            [quantity, product.id]
        )

        // 5. 如果有指定库位，扣减库位库存
        if (location_id) {
            await connection.execute(
                'UPDATE locations SET stock = stock - ? WHERE id = ?',
                [quantity, location_id]
            )
        }

        await connection.commit()

        res.json({
            success: true,
            message: '出库成功',
            data: {
                product_id: product.id,
                sku_code,
                quantity,
                unit_cost: product.cost_price,
                total_cost: totalCost,
                remaining_stock: product.current_stock - quantity
            }
        })
    } catch (error) {
        await connection.rollback()
        console.error('出库失败:', error)
        res.status(500).json({ success: false, message: '出库失败' })
    } finally {
        connection.release()
    }
})

/**
 * POST /api/inventory/in
 * 扫码入库接口
 */
app.post('/api/inventory/in', async (req, res) => {
    const connection = await pool.getConnection()
    try {
        const { sku_code, quantity = 1, location_id, operator, remark, reference_no, cost_price } = req.body

        if (!sku_code || !quantity) {
            return res.status(400).json({ success: false, message: '缺少必要参数' })
        }

        await connection.beginTransaction()

        // 1. 查询商品是否存在
        let productId
        let unitCost = parseFloat(cost_price) || 0

        const [products] = await connection.execute(
            'SELECT id, cost_price, current_stock FROM products WHERE sku_code = ?',
            [sku_code]
        )

        if (products.length > 0) {
            // 商品存在，使用当前成本价
            productId = products[0].id
            unitCost = products[0].cost_price
        } else {
            // 商品不存在，需要先创建（这里暂时不支持自动创建，返回错误）
            await connection.rollback()
            return res.status(404).json({ success: false, message: '商品不存在，请先创建商品' })
        }

        const totalCost = quantity * unitCost

        // 2. 写入入库流水
        await connection.execute(
            `INSERT INTO inventory_logs (product_id, location_id, type, quantity, unit_cost, total_cost, reference_no, operator, remark)
             VALUES (?, ?, 'IN', ?, ?, ?, ?, ?, ?)`,
            [productId, location_id || null, quantity, unitCost, totalCost, reference_no, operator, remark]
        )

        // 3. 增加商品库存
        await connection.execute(
            'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
            [quantity, productId]
        )

        // 4. 如果有指定库位，增加库位库存
        if (location_id) {
            await connection.execute(
                'UPDATE locations SET stock = stock + ? WHERE id = ?',
                [quantity, location_id]
            )
        }

        await connection.commit()

        res.json({
            success: true,
            message: '入库成功',
            data: {
                product_id: productId,
                sku_code,
                quantity,
                unit_cost: unitCost,
                total_cost: totalCost,
                remaining_stock: products.length > 0 ? products[0].current_stock + quantity : quantity
            }
        })
    } catch (error) {
        await connection.rollback()
        console.error('入库失败:', error)
        res.status(500).json({ success: false, message: '入库失败' })
    } finally {
        connection.release()
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

        const [rows] = await pool.execute(sql, [...params, parseInt(pageSize), parseInt(offset)])

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

        const [rows] = await pool.execute(`
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
        const [rows] = await pool.execute(`
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
        const [rows] = await pool.execute(`
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

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '库位不存在' })
        }

        res.json({
            success: true,
            data: rows[0]
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

        const [result] = await pool.execute(
            `INSERT INTO locations (location_code, product_id, max_capacity, zone, remark) VALUES (?, ?, ?, ?, ?)`,
            [location_code, product_id || null, max_capacity || 100, zone, remark]
        )

        res.json({
            success: true,
            message: '库位创建成功',
            data: { id: result.insertId }
        })
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: '库位编码已存在' })
        }
        console.error('创建库位失败:', error)
        res.status(500).json({ success: false, message: '创建库位失败' })
    }
})

/**
 * PUT /api/products/:id
 * 更新商品信息
 */
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, attributes, cost_price, safe_stock, image_url, remark } = req.body
        const { id } = req.params

        const [result] = await pool.execute(
            `UPDATE products SET name = ?, attributes = ?, cost_price = ?, safe_stock = ?, image_url = ?, remark = ? WHERE id = ?`,
            [name, JSON.stringify(attributes), cost_price, safe_stock, image_url, remark, id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '商品不存在' })
        }

        res.json({ success: true, message: '商品更新成功' })
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
        const [products] = await pool.execute('SELECT current_stock FROM products WHERE id = ?', [id])
        if (products.length > 0 && products[0].current_stock > 0) {
            return res.status(400).json({ success: false, message: '该商品还有库存，无法删除' })
        }

        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id])

        if (result.affectedRows === 0) {
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

// ==================== 启动服务器 ====================
app.listen(PORT, async () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
    await testConnection()
})

module.exports = app
