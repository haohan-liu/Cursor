/**
 * 数据库迁移脚本
 * 运行方式: node server/migrate.js
 * 或在 server/index.js 启动时自动执行
 */

const sqlite3 = require('sqlite3').verbose()

const dbPath = process.argv[2] || './inventory.db'

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message)
    process.exit(1)
  }
  
  console.log('🔄 开始数据库迁移...')
  
  try {
    await runMigrations()
    console.log('✅ 迁移完成!')
    process.exit(0)
  } catch (error) {
    console.error('❌ 迁移失败:', error.message)
    process.exit(1)
  }
})

function runMigrations() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 迁移 001: 添加 version 字段
      db.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) { reject(err); return }
        
        // 检查并执行迁移
        const migrations = [
          {
            name: '001_add_version_to_products',
            sql: 'ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 0'
          },
          {
            name: '001_add_version_to_products_init',
            // 对于已有数据，初始化 version = 0
            sql: `UPDATE products SET version = 0 WHERE version IS NULL`
          }
        ]
        
        let completed = 0
        migrations.forEach(migration => {
          // 检查是否已执行
          db.get('SELECT id FROM migrations WHERE name = ?', [migration.name], (err, row) => {
            if (err) { reject(err); return }
            
            if (!row) {
              // 执行迁移
              db.run(migration.sql, (err) => {
                if (err && !err.message.includes('duplicate column')) {
                  // 忽略 "duplicate column name" 错误
                  console.log(`⚠️  迁移 ${migration.name}: ${err.message}`)
                } else {
                  console.log(`✅ 执行迁移: ${migration.name}`)
                  
                  // 记录迁移
                  db.run('INSERT INTO migrations (name) VALUES (?)', [migration.name])
                }
                
                completed++
                if (completed === migrations.length) {
                  // 添加索引以优化并发性能
                  db.run('CREATE INDEX IF NOT EXISTS idx_products_version ON products(version)', () => {
                    db.run('CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku_code)', () => {
                      resolve()
                    })
                  })
                }
              })
            } else {
              console.log(`⏭️  跳过已执行: ${migration.name}`)
              completed++
              if (completed === migrations.length) {
                resolve()
              }
            }
          })
        })
      })
    })
  })
}
