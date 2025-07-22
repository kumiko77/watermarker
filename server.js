const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 创建必要的目录
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');

[uploadsDir, processedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 静态文件服务
app.use('/uploads', express.static(uploadsDir));
app.use('/processed', express.static(processedDir));

// 主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: '客户端图像处理模式 - 服务器压力已降至最低',
        timestamp: new Date().toISOString()
    });
});

// 获取服务器信息
app.get('/api/info', (req, res) => {
    res.json({
        mode: 'client-side-processing',
        description: '所有图像处理都在客户端完成，服务器只提供静态文件服务',
        benefits: [
            '零服务器图像处理压力',
            '更好的隐私保护',
            '实时预览效果',
            '无需上传原始图片'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 模式: 客户端图像处理 - 服务器压力已降至最低`);
    console.log(`💡 所有图像处理都在浏览器中完成`);
});
