class ClientSideWatermarkApp {
    constructor() {
        this.uploadedFiles = [];
        this.watermarkImage = null;
        this.processedResults = [];
        this.fileUrls = []; // 存储文件URL的数组
        this.initializeElements();
        this.bindEvents();
        this.updateProcessButton();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadedFilesContainer = document.getElementById('uploadedFiles');
        this.processBtn = document.getElementById('processBtn');
        this.processStatus = document.getElementById('processStatus');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        
        // 水印设置元素
        this.watermarkText = document.getElementById('watermarkText');
        this.fontSize = document.getElementById('fontSize');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        this.opacity = document.getElementById('opacity');
        this.opacityValue = document.getElementById('opacityValue');
        this.textColor = document.getElementById('textColor');
        this.position = document.getElementById('position');
        
        // 标签页元素
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // 水印图片上传
        this.watermarkInput = document.getElementById('watermarkInput');
        this.watermarkPreview = document.getElementById('watermarkPreview');
        
        // 全覆盖模式配置元素
        this.fullCoverSettings = document.getElementById('fullCoverSettings');
        this.coverPattern = document.getElementById('coverPattern');
        this.coverDensity = document.getElementById('coverDensity');
        this.coverDensityValue = document.getElementById('coverDensityValue');
    }

    bindEvents() {
        // 文件上传
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        
        // 水印图片上传
        this.watermarkInput.addEventListener('change', (e) => this.handleWatermarkUpload(e));
        
        // 处理按钮
        this.processBtn.addEventListener('click', () => this.processImages());
        
        // 下载所有按钮
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
        
        // 标签页切换
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });
        
        // 位置选择变化
        this.position.addEventListener('change', (e) => {
            if (e.target.value === 'full-cover') {
                this.fullCoverSettings.style.display = 'block';
            } else {
                this.fullCoverSettings.style.display = 'none';
            }
        });
        
        // 范围滑块
        this.fontSize.addEventListener('input', (e) => {
            this.fontSizeValue.textContent = e.target.value;
        });
        
        this.opacity.addEventListener('input', (e) => {
            this.opacityValue.textContent = e.target.value;
        });
        
        // 全覆盖模式滑块
        this.coverDensity.addEventListener('input', (e) => {
            this.coverDensityValue.textContent = e.target.value;
        });
        
        // 范围滑块初始值
        this.fontSizeValue.textContent = this.fontSize.value;
        this.opacityValue.textContent = this.opacity.value;
        this.coverDensityValue.textContent = this.coverDensity.value;
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.addFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(event.dataTransfer.files);
        this.addFiles(files);
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    addFiles(files) {
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            return validTypes.includes(file.type);
        });

        if (validFiles.length === 0) {
            this.showMessage('请选择有效的图片文件', 'error');
            return;
        }

        // 直接添加所有有效文件，不检查重复
        this.uploadedFiles.push(...validFiles);
        this.renderUploadedFiles();
        this.updateProcessButton();
        this.showMessage(`成功添加 ${validFiles.length} 个文件`, 'success');
        
        // 清空文件输入框，确保下次选择相同文件时也能触发事件
        this.fileInput.value = '';
    }

    handleWatermarkUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showMessage('请选择图片文件', 'error');
            return;
        }

        this.watermarkImage = file;
        this.renderWatermarkPreview(file);
        this.showMessage('水印图片上传成功', 'success');
        
        // 清空文件输入框，确保下次选择相同文件时也能触发事件
        this.watermarkInput.value = '';
    }

    renderWatermarkPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.watermarkPreview.innerHTML = `
                <img src="${e.target.result}" alt="水印预览">
            `;
        };
        reader.readAsDataURL(file);
    }

    renderUploadedFiles() {
        // 清理之前的URL对象
        if (this.fileUrls) {
            this.fileUrls.forEach(url => URL.revokeObjectURL(url));
        }
        
        // 创建新的URL对象并保存引用
        this.fileUrls = this.uploadedFiles.map(file => URL.createObjectURL(file));
        
        this.uploadedFilesContainer.innerHTML = this.uploadedFiles.map((file, index) => `
            <div class="file-item fade-in">
                <img src="${this.fileUrls[index]}" alt="${file.name}">
                <div class="file-name">${file.name}</div>
                <button class="remove-btn" onclick="app.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    removeFile(index) {
        // 释放被删除文件的URL
        if (this.fileUrls && this.fileUrls[index]) {
            URL.revokeObjectURL(this.fileUrls[index]);
        }
        
        this.uploadedFiles.splice(index, 1);
        this.renderUploadedFiles();
        this.updateProcessButton();
    }

    updateProcessButton() {
        this.processBtn.disabled = this.uploadedFiles.length === 0;
    }

    switchTab(event) {
        const targetTab = event.target.dataset.tab;
        
        // 更新按钮状态
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // 更新内容显示
        this.tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(targetTab + 'Tab').classList.add('active');
    }

    async processImages() {
        if (this.uploadedFiles.length === 0) {
            this.showMessage('请先选择图片', 'error');
            return;
        }

        const watermarkText = this.watermarkText.value.trim();
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        
        if (activeTab === 'text' && !watermarkText) {
            this.showMessage('请输入水印文字', 'error');
            return;
        }
        
        if (activeTab === 'image' && !this.watermarkImage) {
            this.showMessage('请上传水印图片', 'error');
            return;
        }

        const options = {
            position: this.position.value,
            opacity: parseFloat(this.opacity.value),
            fontSize: parseInt(this.fontSize.value),
            color: this.textColor.value
        };

        // 如果是全覆盖模式，添加额外的配置参数
        if (options.position === 'full-cover') {
            options.coverPattern = this.coverPattern.value;
            options.coverDensity = parseInt(this.coverDensity.value);
        }

        try {
            this.showLoading('正在处理图片...');
            this.processStatus.textContent = '处理中...';
            
            this.processedResults = [];
            
            for (let i = 0; i < this.uploadedFiles.length; i++) {
                const file = this.uploadedFiles[i];
                this.processStatus.textContent = `处理中... (${i + 1}/${this.uploadedFiles.length})`;
                
                let processedBlob;
                if (activeTab === 'text') {
                    processedBlob = await this.addTextWatermark(file, watermarkText, options);
                } else {
                    processedBlob = await this.addImageWatermark(file, this.watermarkImage, options);
                }
                
                this.processedResults.push({
                    originalName: file.name,
                    processedBlob: processedBlob,
                    success: true
                });
            }
            
            this.renderResults();
            this.showMessage(`成功处理 ${this.processedResults.length} 个文件`, 'success');
            
        } catch (error) {
            this.showMessage('处理失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
            this.processStatus.textContent = '';
        }
    }

    async addTextWatermark(imageFile, text, options) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // 设置画布大小
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 绘制原图
                ctx.drawImage(img, 0, 0);
                
                // 设置文字样式
                ctx.font = `${options.fontSize}px Arial, sans-serif`;
                ctx.fillStyle = options.color;
                ctx.globalAlpha = options.opacity;
                
                // 计算文字尺寸
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = options.fontSize;
                
                if (options.position === 'full-cover') {
                    // 全覆盖模式
                    this.drawFullCoverText(ctx, text, textWidth, textHeight, canvas.width, canvas.height, options);
                } else {
                    // 单点位置模式
                    const position = this.calculatePosition(
                        options.position,
                        canvas.width,
                        canvas.height,
                        textWidth,
                        textHeight
                    );
                    
                    // 绘制文字
                    ctx.fillText(text, position.x, position.y + textHeight);
                }
                
                // 转换为Blob
                canvas.toBlob(resolve, 'image/jpeg', 0.9);
            };
            
            img.src = URL.createObjectURL(imageFile);
        });
    }

    async addImageWatermark(imageFile, watermarkFile, options) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            const watermarkImg = new Image();
            
            let imagesLoaded = 0;
            const totalImages = 2;
            
            const processImages = () => {
                if (imagesLoaded === totalImages) {
                    // 设置画布大小
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // 绘制原图
                    ctx.drawImage(img, 0, 0);
                    
                    // 调整水印大小，使用字体大小作为基准
                    const watermarkWidth = options.fontSize * 2.5; // 字体大小的2.5倍作为图片水印宽度
                    const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;
                    
                    if (options.position === 'full-cover') {
                        // 全覆盖模式
                        this.drawFullCoverImage(ctx, watermarkImg, watermarkWidth, watermarkHeight, canvas.width, canvas.height, options);
                    } else {
                        // 单点位置模式
                        const position = this.calculatePosition(
                            options.position,
                            canvas.width,
                            canvas.height,
                            watermarkWidth,
                            watermarkHeight
                        );
                        
                        // 设置透明度
                        ctx.globalAlpha = options.opacity;
                        
                        // 绘制水印
                        ctx.drawImage(watermarkImg, position.x, position.y, watermarkWidth, watermarkHeight);
                    }
                    
                    // 转换为Blob
                    canvas.toBlob(resolve, 'image/jpeg', 0.9);
                }
            };
            
            img.onload = () => {
                imagesLoaded++;
                processImages();
            };
            
            watermarkImg.onload = () => {
                imagesLoaded++;
                processImages();
            };
            
            img.src = URL.createObjectURL(imageFile);
            watermarkImg.src = URL.createObjectURL(watermarkFile);
        });
    }

    calculatePosition(position, imageWidth, imageHeight, watermarkWidth, watermarkHeight) {
        let x, y;
        
        switch (position) {
            case 'top-left':
                x = 20;
                y = 20;
                break;
            case 'top-right':
                x = imageWidth - watermarkWidth - 20;
                y = 20;
                break;
            case 'bottom-left':
                x = 20;
                y = imageHeight - watermarkHeight - 20;
                break;
            case 'bottom-right':
                x = imageWidth - watermarkWidth - 20;
                y = imageHeight - watermarkHeight - 20;
                break;
            case 'center':
                x = (imageWidth - watermarkWidth) / 2;
                y = (imageHeight - watermarkHeight) / 2;
                break;
            default:
                x = imageWidth - watermarkWidth - 20;
                y = imageHeight - watermarkHeight - 20;
        }
        
        return { x: Math.max(0, x), y: Math.max(0, y) };
    }

    // 全覆盖模式 - 文字水印
    drawFullCoverText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, options) {
        const pattern = options.coverPattern || 'grid';
        const density = options.coverDensity || 5;
        const opacity = options.opacity || 0.7;
        
        // 设置透明度
        ctx.globalAlpha = opacity;
        
        // 保存当前状态
        ctx.save();
        
        // 根据模式绘制水印
        switch (pattern) {
            case 'diagonal':
                this.drawDiagonalText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density);
                break;
            case 'random':
                this.drawRandomText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density);
                break;
            case 'spiral':
                this.drawSpiralText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density);
                break;
            default: // grid
                this.drawGridText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density);
        }
        
        // 恢复状态
        ctx.restore();
    }

    // 全覆盖模式 - 图片水印
    drawFullCoverImage(ctx, watermarkImg, watermarkWidth, watermarkHeight, imageWidth, imageHeight, options) {
        const pattern = options.coverPattern || 'grid';
        const density = options.coverDensity || 5;
        const opacity = options.opacity || 0.7;
        const fontSize = options.fontSize || 24;
        
        // 调整水印大小，使用字体大小作为基准
        const newWidth = fontSize * 2.5; // 字体大小的2.5倍作为图片水印宽度
        const newHeight = (watermarkImg.height / watermarkImg.width) * newWidth;
        
        // 设置透明度
        ctx.globalAlpha = opacity;
        
        // 保存当前状态
        ctx.save();
        
        // 根据模式绘制水印
        switch (pattern) {
            case 'diagonal':
                this.drawDiagonalImage(ctx, watermarkImg, newWidth, newHeight, imageWidth, imageHeight, density);
                break;
            case 'random':
                this.drawRandomImage(ctx, watermarkImg, newWidth, newHeight, imageWidth, imageHeight, density);
                break;
            case 'spiral':
                this.drawSpiralImage(ctx, watermarkImg, newWidth, newHeight, imageWidth, imageHeight, density);
                break;
            default: // grid
                this.drawGridImage(ctx, watermarkImg, newWidth, newHeight, imageWidth, imageHeight, density);
        }
        
        // 恢复状态
        ctx.restore();
    }

    // 网格模式 - 文字
    drawGridText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density) {
        // 根据字体大小动态调整间距
        const fontSize = parseInt(ctx.font.match(/\d+/)[0]);
        const baseSpacing = fontSize * 3; // 基础间距为字体大小的3倍
        const stepX = baseSpacing * (11 - density) / 10; // 密集度1最稀疏，10最密集
        const stepY = baseSpacing * (11 - density) / 10;
        
        for (let y = 20; y < imageHeight; y += stepY) {
            for (let x = 20; x < imageWidth; x += stepX) {
                ctx.fillText(text, x, y + textHeight);
            }
        }
    }

    // 网格模式 - 图片
    drawGridImage(ctx, watermarkImg, width, height, imageWidth, imageHeight, density) {
        // 根据图片水印大小动态调整间距
        const baseSpacing = Math.max(width, height) * 2; // 基础间距为图片最大边长的2倍
        const stepX = baseSpacing * (11 - density) / 10; // 密集度1最稀疏，10最密集
        const stepY = baseSpacing * (11 - density) / 10;
        
        for (let y = 20; y < imageHeight; y += stepY) {
            for (let x = 20; x < imageWidth; x += stepX) {
                ctx.drawImage(watermarkImg, x, y, width, height);
            }
        }
    }

    // 斜向模式 - 文字
    drawDiagonalText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density) {
        // 固定-30度角
        const angle = -30;
        // 旋转画布
        ctx.translate(imageWidth / 2, imageHeight / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-imageWidth / 2, -imageHeight / 2);
        
        // 根据字体大小动态调整间距
        const fontSize = parseInt(ctx.font.match(/\d+/)[0]);
        const baseSpacing = fontSize * 3; // 基础间距为字体大小的3倍
        const stepX = baseSpacing * (11 - density) / 10; // 密集度1最稀疏，10最密集
        const stepY = baseSpacing * (11 - density) / 10;
        
        for (let y = -imageHeight; y < imageHeight * 2; y += stepY) {
            for (let x = -imageWidth; x < imageWidth * 2; x += stepX) {
                ctx.fillText(text, x, y + textHeight);
            }
        }
    }

    // 斜向模式 - 图片
    drawDiagonalImage(ctx, watermarkImg, width, height, imageWidth, imageHeight, density) {
        // 固定-30度角
        const angle = -30;
        // 旋转画布
        ctx.translate(imageWidth / 2, imageHeight / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-imageWidth / 2, -imageHeight / 2);
        
        // 根据图片水印大小动态调整间距
        const baseSpacing = Math.max(width, height) * 2; // 基础间距为图片最大边长的2倍
        const stepX = baseSpacing * (11 - density) / 10; // 密集度1最稀疏，10最密集
        const stepY = baseSpacing * (11 - density) / 10;
        
        for (let y = -imageHeight; y < imageHeight * 2; y += stepY) {
            for (let x = -imageWidth; x < imageWidth * 2; x += stepX) {
                ctx.drawImage(watermarkImg, x, y, width, height);
            }
        }
    }

    // 随机模式 - 文字
    drawRandomText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density) {
        // 根据字体大小和图片面积计算水印数量
        const fontSize = parseInt(ctx.font.match(/\d+/)[0]);
        const imageArea = imageWidth * imageHeight;
        const textArea = textWidth * textHeight;
        const baseCount = Math.floor(imageArea / (textArea * 20)); // 每20个文字面积放置一个水印
        const count = Math.floor(baseCount * density / 10); // 根据密集度调整
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (imageWidth - textWidth);
            const y = Math.random() * (imageHeight - textHeight);
            ctx.fillText(text, x, y + textHeight);
        }
    }

    // 随机模式 - 图片
    drawRandomImage(ctx, watermarkImg, width, height, imageWidth, imageHeight, density) {
        // 根据图片水印大小和图片面积计算水印数量
        const imageArea = imageWidth * imageHeight;
        const watermarkArea = width * height;
        const baseCount = Math.floor(imageArea / (watermarkArea * 15)); // 每15个水印面积放置一个水印
        const count = Math.floor(baseCount * density / 10); // 根据密集度调整
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (imageWidth - width);
            const y = Math.random() * (imageHeight - height);
            ctx.drawImage(watermarkImg, x, y, width, height);
        }
    }

    // 螺旋模式 - 文字
    drawSpiralText(ctx, text, textWidth, textHeight, imageWidth, imageHeight, density) {
        const centerX = imageWidth / 2;
        const centerY = imageHeight / 2;
        const maxRadius = Math.max(imageWidth, imageHeight) / 2;
        
        // 根据字体大小动态调整步长
        const fontSize = parseInt(ctx.font.match(/\d+/)[0]);
        const baseStep = fontSize * 0.1; // 基础步长为字体大小的10%
        const step = baseStep * (11 - density) / 10; // 根据密集度调整
        
        for (let angle = 0; angle < 8 * Math.PI; angle += step) {
            const radius = (angle / (8 * Math.PI)) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (x >= 0 && x <= imageWidth - textWidth && y >= 0 && y <= imageHeight - textHeight) {
                ctx.fillText(text, x, y + textHeight);
            }
        }
    }

    // 螺旋模式 - 图片
    drawSpiralImage(ctx, watermarkImg, width, height, imageWidth, imageHeight, density) {
        const centerX = imageWidth / 2;
        const centerY = imageHeight / 2;
        const maxRadius = Math.max(imageWidth, imageHeight) / 2;
        
        // 根据图片水印大小动态调整步长
        const watermarkSize = Math.max(width, height);
        const baseStep = watermarkSize * 0.2; // 基础步长为水印最大边长的20%
        const step = baseStep * (11 - density) / 10; // 根据密集度调整
        
        for (let angle = 0; angle < 6 * Math.PI; angle += step) {
            const radius = (angle / (6 * Math.PI)) * maxRadius;
            const x = centerX + radius * Math.cos(angle) - width / 2;
            const y = centerY + radius * Math.sin(angle) - height / 2;
            
            if (x >= 0 && x <= imageWidth - width && y >= 0 && y <= imageHeight - height) {
                ctx.drawImage(watermarkImg, x, y, width, height);
            }
        }
    }

    renderResults() {
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        this.resultsGrid.innerHTML = this.processedResults.map((result, index) => `
            <div class="result-item fade-in">
                <img src="${URL.createObjectURL(result.processedBlob)}" alt="处理结果">
                <div class="file-name">${result.originalName}</div>
                <button class="download-btn" onclick="app.downloadFile(${index})">
                    <i class="fas fa-download"></i> 下载
                </button>
            </div>
        `).join('');
    }

    downloadFile(index) {
        const result = this.processedResults[index];
        const url = URL.createObjectURL(result.processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `watermarked_${result.originalName}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    downloadAll() {
        this.processedResults.forEach((result, index) => {
            setTimeout(() => {
                this.downloadFile(index);
            }, index * 500);
        });
    }

    showLoading(message = '处理中...') {
        this.loadingOverlay.querySelector('p').textContent = message;
        this.loadingOverlay.classList.add('show');
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('show');
    }

    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        `;
        
        document.body.appendChild(messageEl);
        
        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 初始化应用
const app = new ClientSideWatermarkApp();
