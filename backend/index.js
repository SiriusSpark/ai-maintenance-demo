import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 uploads 文件夹（如果不存在）
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * 中间件配置
 * - CORS: 允许跨域请求（前端从localhost:5174访问）
 * - express.json: 自动解析JSON请求体
 * - express.static: 服务静态文件（上传的图片）
 */
app.use(cors());
app.use(express.json());

/**
 * [关键] 静态文件服务配置
 * - 将 /uploads 路径映射到本地 uploads/ 文件夹
 * - 前端可以通过 http://localhost:3000/uploads/filename.jpg 访问图片
 */
app.use('/uploads', express.static(uploadsDir));

/**
 * Multer 配置：处理文件上传
 * - destination: 指定上传文件保存的文件夹
 * - filename: 自定义保存的文件名
 */
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // 生成唯一文件名：timestamp-randomid-originalname
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      cb(null, `${timestamp}-${random}-${name}${ext}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 文件大小限制
  }
});

/**
 * ==================== 数据存储 ====================
 * 
 * [关键] 当前使用内存数组 mockAlarms 存储数据
 * 注意: 应用重启后数据会复原到初始状态
 * 
 * 生产环境应该：
 * - 替换为真实数据库（MongoDB / PostgreSQL / MySQL 等）
 * - 添加数据持久化机制
 * - 实现数据加载/保存逻辑
 */
const mockAlarms = [
  {
    id: "A001",
    time: "2026-03-05 10:12",
    level: "警告",
    equipment: "冷却ポンプ1号",
    confidence: 92,
    status: "未対応",
    assignee: "未定",
    evidence: [], // [关键] 証拠画像パス配列（初期は空）
  },
  {
    id: "A002",
    time: "2026-03-04 18:33",
    level: "注意",
    equipment: "搬送ラインB",
    confidence: 71,
    status: "対応中",
    assignee: "田中",
    evidence: [], // [关键] 証拠画像パス配列（初期は空）
  },
  {
    id: "A003",
    time: "2026-03-04 14:22",
    level: "注意",
    equipment: "加熱炉A",
    confidence: 89,
    status: "完了",
    assignee: "佐藤",
    evidence: [], // [关键] 証拠画像パス配列（初期は空）
  },
  {
    id: "A004",
    time: "2026-03-03 09:45",
    level: "警告",
    equipment: "プレス機械1号",
    confidence: 85,
    status: "未対応",
    assignee: "未定",
    evidence: [], // [关键] 証拠画像パス配列（初期は空）
  },
  {
    id: "A005",
    time: "2026-03-02 16:20",
    level: "注意",
    equipment: "溶接ロボット",
    confidence: 76,
    status: "対応中",
    assignee: "鈴木",
    evidence: [], // [关键] 証拠画像パス配列（初期は空）
  },
  {
    id: "A006",
    time: "2026-03-01 11:30",
    level: "高",
    equipment: "冷凍庫システムB",
    confidence: 95,
    status: "未対応",
    assignee: "未定",
    evidence: [], // [关键] 証拠画像パス配列（初期は空）
  },
  {
    id: "A007",
    time: "2026-02-28 13:15",
    level: "注意",
    equipment: "コンベアベルト",
    confidence: 68,
    status: "完了",
    assignee: "山田",
    evidence: [], // [关键] 証拠画像パス配列（初期は空）
  },
  
];

/**
 * ==================== API 端点 ====================
 */

/**
 * [API] GET /api/alarms
 * 获取所有告警列表
 * 
 * 前端调用：
 * fetch("http://localhost:3000/api/alarms")
 *   .then(res => res.json())
 *   .then(alarms => { ... })
 * 
 * 返回值: Alarm[]
 */
app.get('/api/alarms', (req, res) => {
  res.json(mockAlarms);
});

/**
 * [API] GET /api/alarms/:id
 * 获取单个告警的详细信息
 * 
 * 前端调用：
 * fetch("http://localhost:3000/api/alarms/A001")
 *   .then(res => res.json())
 *   .then(alarm => { ... })
 * 
 * 参数:
 * - id: 告警ID（如 "A001"）
 * 
 * 返回值: 
 * - 成功: Alarm 对象
 * - 失败: { error: 'Alarm not found' } (304)
 */
app.get('/api/alarms/:id', (req, res) => {
  const alarm = mockAlarms.find(a => a.id === req.params.id);
  if (!alarm) {
    return res.status(404).json({ error: 'Alarm not found' });
  }
  res.json(alarm);
});

/**
 * [API] PUT /api/alarms/:id
 * 更新告警信息（状态和/或负责人）
 * 
 * 前端调用：
 * fetch("http://localhost:3000/api/alarms/A001", {
 *   method: "PUT",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({
 *     status: "対応中",
 *     assignee: "田中"
 *   })
 * })
 * 
 * 参数:
 * - id: 告警ID（URL路径参数）
 * - status: 新的处理状态（可选）
 * - assignee: 新的负责人（可选）
 * 
 * 返回值:
 * - 成功: 更新后的 Alarm 对象
 * - 失败: { error: 'Alarm not found' } (404)
 */
app.put('/api/alarms/:id', (req, res) => {
  const alarm = mockAlarms.find(a => a.id === req.params.id);
  if (!alarm) {
    return res.status(404).json({ error: 'Alarm not found' });
  }
  
  // 只更新提供的字段
  if (req.body.status) {
    alarm.status = req.body.status;
  }
  if (req.body.assignee) {
    alarm.assignee = req.body.assignee;
  }
  
  res.json(alarm);
});

/**
 * [API] POST /api/alarms/:id/upload
 * 上传证拠（証拠）图片到指定告警
 * 
 * [关键] 文件上传处理：
 * - 接收 multipart/form-data 格式的请求
 * - 文件保存到 uploads/ 文件夹
 * - 返回相对路径 /uploads/filename.jpg
 * - 将路径保存到 alarm.evidence 数组
 * 
 * 前端调用：
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * fetch("http://localhost:3000/api/alarms/A001/upload", {
 *   method: "POST",
 *   body: formData
 * })
 * 
 * 参数:
 * - id: 告警ID（URL路径参数）
 * - file: 上传的文件（FormData 中的 body）
 * 
 * 返回值:
 * - 成功: { imagePath: '/uploads/filename.jpg', alarm: {...} }
 * - 失败: { error: '错误信息' } (400/404)
 */
app.post('/api/alarms/:id/upload', upload.single('file'), (req, res) => {
  const alarm = mockAlarms.find(a => a.id === req.params.id);
  if (!alarm) {
    return res.status(404).json({ error: 'Alarm not found' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // [关键] 构造相对路径，前端可以直接使用
  const imagePath = `/uploads/${req.file.filename}`;
  
  // 保存图片路径到告警数据的 evidence 数组
  if (!alarm.evidence) {
    alarm.evidence = [];
  }
  alarm.evidence.push(imagePath);
  
  res.json({
    imagePath,
    alarm
  });
});

/**
 * [API] DELETE /api/alarms/:id/evidence
 * 删除指定告警的证拠（证拠）图片
 * 
 * [关键] 文件删除处理：
 * - 接收要删除的图片路径
 * - 从硬盘删除文件
 * - 从 alarm.evidence 数组中移除
 * - 返回更新后的告警数据
 * 
 * 前端调用：
 * fetch("http://localhost:3000/api/alarms/A001/evidence", {
 *   method: "DELETE",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({
 *     imagePath: "/uploads/1711270400000-abc123-photo.jpg"
 *   })
 * })
 * 
 * 参数:
 * - id: 告警ID（URL路径参数）
 * - imagePath: 要删除的图片路径（请求体）
 * 
 * 返回值:
 * - 成功: 更新后的 Alarm 对象
 * - 失败: { error: '错误信息' } (400/404)
 */
app.delete('/api/alarms/:id/evidence', (req, res) => {
  const alarm = mockAlarms.find(a => a.id === req.params.id);
  if (!alarm) {
    return res.status(404).json({ error: 'Alarm not found' });
  }
  
  const { imagePath } = req.body;
  if (!imagePath) {
    return res.status(400).json({ error: 'Image path is required' });
  }
  
  // 从文件系统删除图片文件
  // imagePath 格式: /uploads/filename.jpg
  // 实际文件路径: uploadsDir/filename.jpg
  const fileName = imagePath.split('/').pop();
  const filePath = path.join(uploadsDir, fileName);
  
  try {
    // 检查文件是否存在并删除
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to delete file ${filePath}:`, err);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
  
  // 从告警的 evidence 数组中移除该路径
  if (alarm.evidence && Array.isArray(alarm.evidence)) {
    alarm.evidence = alarm.evidence.filter(p => p !== imagePath);
  }
  
  res.json(alarm);
});

/**
 * 启动服务器并输出信息
 */
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Available endpoints:\n`);
  console.log(`  GET  /api/alarms              - Get all alarms`);
  console.log(`  GET  /api/alarms/:id          - Get alarm by id`);
  console.log(`  PUT  /api/alarms/:id          - Update alarm status/assignee`);
  console.log(`  POST /api/alarms/:id/upload   - Upload evidence image`);
  console.log(`  DELETE /api/alarms/:id/evidence - Delete evidence image`);
  console.log(`\n📁 Uploaded images stored in: ${uploadsDir}`);
  console.log(`🖼️  Access images at: http://localhost:${PORT}/uploads/filename.jpg`);
  console.log(`\n💡 Remember: Data is stored in memory, will reset on restart\n`);
  console.log(`${'='.repeat(50)}\n`);
});
