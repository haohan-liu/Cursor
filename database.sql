-- =====================================================
-- 汽车水晶档把库存管理系统 - MySQL 建表语句
-- 数据库名: gear_inventory
-- =====================================================


-- =====================================================
-- 1. 商品表 (products)
-- =====================================================
DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `sku_code` VARCHAR(50) NOT NULL COMMENT '系统唯一条码',
    `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
    `attributes` JSON NULL COMMENT '属性JSON，如：{螺纹型号, LOGO, 颜色}',
    `cost_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '单件成本价',
    `current_stock` INT NOT NULL DEFAULT 0 COMMENT '当前总库存',
    `safe_stock` INT NOT NULL DEFAULT 0 COMMENT '安全库存预警线',
    `image_url` VARCHAR(255) NULL COMMENT '商品图片URL',
    `remark` VARCHAR(500) NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_sku_code` (`sku_code`),
    KEY `idx_name` (`name`),
    KEY `idx_safe_stock` (`safe_stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='商品表';

-- =====================================================
-- 2. 库位表 (locations)
-- =====================================================
DROP TABLE IF EXISTS `locations`;

CREATE TABLE `locations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `location_code` VARCHAR(30) NOT NULL COMMENT '库位编码，如：A-01-01',
    `product_id` INT UNSIGNED NULL COMMENT '绑定的商品ID',
    `stock` INT NOT NULL DEFAULT 0 COMMENT '该库位当前库存数量',
    `max_capacity` INT NOT NULL DEFAULT 100 COMMENT '库位最大容量',
    `zone` VARCHAR(20) NULL COMMENT '库区，如：A区/B区',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用：1启用 0禁用',
    `remark` VARCHAR(255) NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_location_code` (`location_code`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_zone` (`zone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='库位表';

-- =====================================================
-- 3. 出入库流水表 (inventory_logs)
-- =====================================================
DROP TABLE IF EXISTS `inventory_logs`;

CREATE TABLE `inventory_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `product_id` INT UNSIGNED NOT NULL COMMENT '商品ID',
    `location_id` INT UNSIGNED NULL COMMENT '库位ID',
    `type` ENUM('IN', 'OUT', 'ADJUST', 'TRANSFER') NOT NULL COMMENT '类型：IN入库/OUT出库/ADJUST调整/TRANSFER调拨',
    `quantity` INT NOT NULL COMMENT '变动数量',
    `unit_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '变动时的单价',
    `total_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '总成本 = 数量 * 单价',
    `reference_no` VARCHAR(50) NULL COMMENT '关联单号',
    `operator` VARCHAR(50) NULL COMMENT '操作人',
    `remark` VARCHAR(500) NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_location_id` (`location_id`),
    KEY `idx_type` (`type`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_reference_no` (`reference_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='出入库流水表';

-- =====================================================
-- 4. 用户表 (users)
-- =====================================================
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    `real_name` VARCHAR(50) NULL COMMENT '真实姓名',
    `role` ENUM('ADMIN', 'WAREHOUSE', 'SALES') NOT NULL DEFAULT 'WAREHOUSE' COMMENT '角色',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    `last_login` DATETIME NULL COMMENT '最后登录时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='系统用户表';

-- =====================================================
-- 插入测试数据
-- =====================================================

-- 测试商品数据
INSERT INTO `products` (`sku_code`, `name`, `attributes`, `cost_price`, `current_stock`, `safe_stock`) VALUES
('SKU-A001', '路虎旋钮-黑钻', '{"螺纹型号":"M12x1.5","颜色":"黑色"}', 85.00, 15, 5),
('SKU-A002', '路虎旋钮-银钻', '{"螺纹型号":"M14x1.5","颜色":"银色"}', 92.00, 12, 5),
('SKU-A003', '手动挡-水晶标', '{"LOGO":"BMW","材质":"水晶"}', 45.00, 28, 10),
('SKU-B001', '手动挡-改装', '{"LOGO":"个性化","材质":"水晶"}', 68.00, 18, 8),
('SKU-B002', '奔驰旋钮-原厂', '{"颜色":"黑色","型号":"原厂"}', 120.00, 4, 8),
('SKU-B003', '奔驰AMG旋钮', '{"LOGO":"AMG","颜色":"黑红"}', 185.00, 10, 5),
('SKU-C001', '保时捷旋钮', '{"型号":"718","颜色":"红色"}', 280.00, 1, 5),
('SKU-C002', '奥迪RS旋钮', '{"LOGO":"RS","颜色":"黑色"}', 95.00, 8, 5),
('SKU-D001', '通用档把套', '{"材质":"水晶","规格":"通用"}', 35.00, 32, 10),
('SKU-E001', '路虎旋钮-白钻', '{"螺纹型号":"M12x1.5","颜色":"白色"}', 88.00, 20, 5);

-- 测试库位数据
INSERT INTO `locations` (`location_code`, `product_id`, `stock`, `max_capacity`, `zone`) VALUES
('A-01-01', 1, 15, 50, 'A区'),
('A-01-02', NULL, 0, 50, 'A区'),
('A-01-03', 3, 28, 50, 'A区'),
('A-02-01', NULL, 0, 50, 'A区'),
('A-02-02', 2, 12, 50, 'A区'),
('A-02-03', NULL, 0, 50, 'A区'),
('A-03-01', NULL, 0, 50, 'A区'),
('A-03-02', NULL, 0, 50, 'A区'),
('A-03-03', NULL, 0, 50, 'A区'),
('A-03-04', 5, 6, 50, 'A区'),
('A-04-01', NULL, 0, 50, 'A区'),
('A-04-02', NULL, 0, 50, 'A区'),
('A-04-03', NULL, 0, 50, 'A区'),
('A-04-04', NULL, 0, 50, 'A区'),
('A-04-05', NULL, 0, 50, 'A区'),
('B-01-01', NULL, 0, 50, 'B区'),
('B-01-02', NULL, 0, 50, 'B区'),
('B-01-03', NULL, 0, 50, 'B区'),
('B-01-04', NULL, 0, 50, 'B区'),
('B-01-05', 8, 8, 50, 'B区'),
('B-02-01', 10, 20, 50, 'B区'),
('B-02-02', NULL, 0, 50, 'B区'),
('B-02-03', 4, 18, 50, 'B区'),
('B-02-04', NULL, 0, 50, 'B区'),
('B-02-05', NULL, 0, 50, 'B区'),
('B-03-01', 7, 1, 50, 'B区'),
('B-03-02', NULL, 0, 50, 'B区'),
('B-03-03', NULL, 0, 50, 'B区'),
('B-03-04', 6, 10, 50, 'B区'),
('B-03-05', NULL, 0, 50, 'B区'),
('B-04-01', NULL, 0, 50, 'B区'),
('B-04-02', 9, 32, 50, 'B区'),
('B-04-03', NULL, 0, 50, 'B区'),
('B-04-04', NULL, 0, 50, 'B区'),
('B-04-05', NULL, 0, 50, 'B区');

-- 管理员账号 (密码: admin123)
INSERT INTO `users` (`username`, `password`, `real_name`, `role`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'ADMIN'),
('warehouse', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '仓管员', 'WAREHOUSE');
