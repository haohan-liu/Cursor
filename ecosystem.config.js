/**
 * PM2 进程管理配置
 * 用于生产环境部署
 * 
 * 使用方法：
 * 1. npm install -g pm2
 * 2. pm2 start ecosystem.config.js
 * 3. pm2 save  (保存进程列表)
 * 4. pm2 startup (设置开机自启)
 */

module.exports = {
  apps: [{
    // 进程名称
    name: 'gear-knob-server',
    
    // 启动脚本
    script: 'server/index.js',
    
    // 工作目录
    cwd: '/home/www/gear-knob-inventory',
    
    // 实例数量（建议生产环境保持为 1，避免 SQLite 并发问题）
    instances: 1,
    
    // 自动重启
    autorestart: true,
    
    // 监听文件变化（生产环境设为 false）
    watch: false,
    
    // 内存超过此值时自动重启
    max_memory_restart: '500M',
    
    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // 日志配置
    error_file: '/home/wwwlogs/gear-knob-error.log',
    out_file: '/home/wwwlogs/gear-knob-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    // 高级配置
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // 生产环境标志
    instance_var: 'INSTANCE_ID'
  }]
}
