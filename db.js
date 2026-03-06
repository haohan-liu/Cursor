/**
 * 汽车水晶档把库存管理系统 - 数据库连接配置
 * Node.js + Express + MySQL
 */

const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'gear_knob_inventory',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 数据库连接成功！');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        return false;
    }
}

// 基础查询方法封装
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ 数据库查询错误:', error.message);
        throw error;
    }
}

// 事务处理封装
async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// =====================================================
// 核心业务 SQL 示例
// =====================================================

/**
 * 1. 商品管理 - 创建商品
 */
async function createProduct(productData) {
    const { sku_code, name, attributes, cost_price, safe_stock, image_url, remark } = productData;
    
    const sql = `
        INSERT INTO products (sku_code, name, attributes, cost_price, safe_stock, image_url, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
        sku_code,
        name,
        JSON.stringify(attributes),
        cost_price,
        safe_stock,
        image_url,
        remark
    ]);
    
    return result;
}

/**
 * 2. 扫码出入库 - 入库操作
 */
async function stockIn(productId, locationId, quantity, referenceNo, operator, remark) {
    return await transaction(async (conn) => {
        // 获取商品当前成本价
        const [products] = await conn.execute(
            'SELECT cost_price FROM products WHERE id = ?',
            [productId]
        );
        
        if (products.length === 0) {
            throw new Error('商品不存在');
        }
        
        const unitCost = products[0].cost_price;
        const totalCost = quantity * unitCost;
        
        // 1. 插入出入库流水
        await conn.execute(
            `INSERT INTO inventory_logs 
            (product_id, location_id, type, quantity, unit_cost, total_cost, reference_no, operator, remark)
            VALUES (?, ?, 'IN', ?, ?, ?, ?, ?, ?)`,
            [productId, locationId, quantity, unitCost, totalCost, referenceNo, operator, remark]
        );
        
        // 2. 更新商品总库存
        await conn.execute(
            'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
            [quantity, productId]
        );
        
        // 3. 更新库位库存
        await conn.execute(
            'UPDATE locations SET stock = stock + ? WHERE id = ?',
            [quantity, locationId]
        );
        
        return { success: true, totalCost };
    });
}

/**
 * 4. 扫码出入库 - 出库操作
 */
async function stockOut(productId, locationId, quantity, referenceNo, operator, remark) {
    return await transaction(async (conn) => {
        // 获取商品当前成本价和库存
        const [products] = await conn.execute(
            'SELECT cost_price, current_stock FROM products WHERE id = ?',
            [productId]
        );
        
        if (products.length === 0) {
            throw new Error('商品不存在');
        }
        
        if (products[0].current_stock < quantity) {
            throw new Error('库存不足');
        }
        
        const unitCost = products[0].cost_price;
        const totalCost = quantity * unitCost;
        
        // 1. 插入出入库流水
        await conn.execute(
            `INSERT INTO inventory_logs 
            (product_id, location_id, type, quantity, unit_cost, total_cost, reference_no, operator, remark)
            VALUES (?, ?, 'OUT', ?, ?, ?, ?, ?, ?)`,
            [productId, locationId, quantity, unitCost, totalCost, referenceNo, operator, remark]
        );
        
        // 2. 更新商品总库存
        await conn.execute(
            'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
            [quantity, productId]
        );
        
        // 3. 更新库位库存
        await conn.execute(
            'UPDATE locations SET stock = stock - ? WHERE id = ?',
            [quantity, locationId]
        );
        
        return { success: true, totalCost };
    });
}

/**
 * 5. 库存预警查询
 */
async function getStockAlerts() {
    const sql = 'SELECT * FROM v_stock_alert ORDER BY stock_difference ASC';
    return await query(sql);
}

/**
 * 6. 发货统计 - 按时间范围
 */
async function getDeliveryStats(startDate, endDate) {
    const sql = `
        SELECT 
            p.id AS product_id,
            p.sku_code,
            p.name,
            p.cost_price,
            SUM(il.quantity) AS total_out_quantity,
            SUM(il.total_cost) AS total_out_cost,
            COUNT(DISTINCT il.reference_no) AS delivery_count
        FROM products p
        INNER JOIN inventory_logs il ON p.id = il.product_id
        WHERE il.type = 'OUT' 
            AND il.created_at BETWEEN ? AND ?
        GROUP BY p.id, p.sku_code, p.name, p.cost_price
        ORDER BY total_out_quantity DESC
    `;
    
    return await query(sql, [startDate, endDate]);
}

/**
 * 7. 获取库位列表（含库存）
 */
async function getLocationsWithStock() {
    const sql = `
        SELECT 
            l.*,
            p.name AS product_name,
            p.sku_code
        FROM locations l
        LEFT JOIN products p ON l.product_id = p.id
        WHERE l.is_active = 1
        ORDER BY l.location_code
    `;
    
    return await query(sql);
}

/**
 * 8. 库位调拨
 */
async function transferStock(fromLocationId, toLocationId, quantity, operator, remark) {
    return await transaction(async (conn) => {
        // 检查源库位库存
        const [fromLoc] = await conn.execute(
            'SELECT stock, product_id FROM locations WHERE id = ?',
            [fromLocationId]
        );
        
        if (fromLoc.length === 0) {
            throw new Error('源库位不存在');
        }
        
        if (fromLoc[0].stock < quantity) {
            throw new Error('源库位库存不足');
        }
        
        // 1. 减少源库位库存
        await conn.execute(
            'UPDATE locations SET stock = stock - ? WHERE id = ?',
            [quantity, fromLocationId]
        );
        
        // 2. 增加目标库位库存
        await conn.execute(
            'UPDATE locations SET stock = stock + ? WHERE id = ?',
            [quantity, toLocationId]
        );
        
        // 3. 记录调拨流水
        await conn.execute(
            `INSERT INTO inventory_logs 
            (product_id, location_id, type, quantity, unit_cost, total_cost, reference_no, operator, remark)
            SELECT product_id, ?, 'TRANSFER', ?, cost_price, ? * cost_price, ?, ?, ?
            FROM locations WHERE id = ?`,
            [toLocationId, quantity, quantity, `TF-${Date.now()}`, operator, remark, fromLocationId]
        );
        
        return { success: true };
    });
}

// 导出模块
module.exports = {
    pool,
    testConnection,
    query,
    transaction,
    // 业务方法
    createProduct,
    stockIn,
    stockOut,
    getStockAlerts,
    getDeliveryStats,
    getLocationsWithStock,
    transferStock
};
