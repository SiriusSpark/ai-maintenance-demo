# 文件上传功能使用指南

## ✅ 已完成的实现

### 后端修改 (backend/index.js)
- ✅ 安装 multer 中间件用于处理文件上传
- ✅ 配置 uploads/ 文件夹自动创建
- ✅ 设置 express.static 服务静态文件
- ✅ 添加 POST /api/alarms/:id/upload 端点
- ✅ 生成唯一文件名（timestamp + random + original name）
- ✅ 更新告警数据的 evidence 数组
- ✅ 10MB 文件大小限制

### 前端修改

#### 1. api.ts 
- ✅ 添加 UPLOAD_EVIDENCE(id) 端点配置

#### 2. AlarmDetailPage.tsx
- ✅ 添加"エビデンス（証拠画像）"部分
- ✅ 文件输入框（accept="image/*"）
- ✅ 上传加载状态显示
- ✅ 已上传图片网格展示
- ✅ 图片访问路径：http://localhost:3000/uploads/filename.png

## 🧪 如何测试

### 1. 确保后端运行
```powershell
cd backend
node index.js
# 应该看到输出：
# 🚀 Backend server is running on http://localhost:3000
# Available endpoints:
#   GET  /api/alarms              - Get all alarms
#   GET  /api/alarms/:id          - Get alarm by id
#   PUT  /api/alarms/:id          - Update alarm status/assignee
#   POST /api/alarms/:id/upload   - Upload evidence image
```

### 2. 前端访问详情页
- 打开浏览器：http://localhost:5174
- 点击列表中的一条警报进入详情页
- 向下滚动看到"エビデンス（証拠画像）"部分

### 3. 上传测试图片
1. 点击"選択"按钮
2. 选择一张图片文件（.jpg, .png, .gif 等）
3. 会自动上传，显示"アップロード中..."
4. 成功后显示：画像をアップロードしました
5. 图片会出现在下方的网格中

### 4. 验证文件保存
```powershell
# 上传后，文件保存在：
ls backend/uploads/
# 会看到类似的文件名：
# 1711270400000-abc123-photo.jpg
```

## 📁 数据流程

### 上传流程
```
用户选择图片
    ↓
React 组件捕获 file input change 事件
    ↓
创建 FormData 并 append 文件
    ↓
POST http://localhost:3000/api/alarms/:id/upload
    ↓
Multer 中间件接收和保存文件
    ↓
Express 处理器生成文件路径
    ↓
更新内存数组中的 alarm.evidence[]
    ↓
返回 { imagePath, alarm }
    ↓
前端更新显示刷新

显示已上传的图片列表
```

## 📝 数据结构

### 告警对象（Alarm）
```json
{
  "id": "A001",
  "time": "2026-03-05 10:12",
  "level": "警告",
  "equipment": "冷却ポンプ1号",
  "confidence": 92,
  "status": "未対応",
  "assignee": "未設定",
  "evidence": [
    "/uploads/1711270400000-abc123-photo.jpg",
    "/uploads/1711270500000-def456-photo.jpg"
  ]
}
```

## ⚠️ 注意事项

1. **数据持久化**：当前使用内存数组，应用重启后数据会丢失
   - 生产环境应该改为数据库存储
   - 文件会保留在 uploads/ 文件夹中

2. **文件大小限制**：最大 10MB
   - 可在 backend/index.js 的 multer 配置中修改

3. **文件访问**：
   - 前端直接访问：http://localhost:3000/uploads/filename.jpg
   - 确保 CORS 已启用（已在后端配置）

4. **文件名处理**：
   - 使用 timestamp + random ID + 原始名称的组合
   - 避免文件名冲突

## 🔄 未来改进

- [ ] 添加删除已上传图片的功能
- [ ] 实现上传进度条
- [ ] 支持多文件上传（上传多张图片）
- [ ] 数据库存储告警信息
- [ ] 图片缩略图生成
- [ ] 文件类型和大小验证
- [ ] 错误消息更详细的反馈
