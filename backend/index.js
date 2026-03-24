import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// [关键] 数据存储：当前使用内存数组，应用重启后数据丢失
// 生产环境应替换为真实数据库（MongoDB / PostgreSQL 等）
const mockAlarms = [
  {
    id: "A001",
    time: "2026-03-05 10:12",
    level: "警告",
    equipment: "冷却ポンプ1号",
    confidence: 92,
    status: "未対応",
    assignee: "未設定",
  },
  {
    id: "A002",
    time: "2026-03-04 18:33",
    level: "注意",
    equipment: "搬送ラインB",
    confidence: 71,
    status: "対応中",
    assignee: "王",
  },
  {
    id: "A003",
    time: "2026-03-04 14:22",
    level: "高",
    equipment: "加熱炉A",
    confidence: 88,
    status: "解決済",
    assignee: "李",
  },
];

// [API] GET /api/alarms - 获取所有告警列表
app.get('/api/alarms', (req, res) => {
  res.json(mockAlarms);
});

// [API] GET /api/alarms/:id - 获取单个告警详情
app.get('/api/alarms/:id', (req, res) => {
  const alarm = mockAlarms.find(a => a.id === req.params.id);
  if (!alarm) {
    return res.status(404).json({ error: 'Alarm not found' });
  }
  res.json(alarm);
});

// [API] PUT /api/alarms/:id - 更新告警信息（状态、负责人）
app.put('/api/alarms/:id', (req, res) => {
  const alarm = mockAlarms.find(a => a.id === req.params.id);
  if (!alarm) {
    return res.status(404).json({ error: 'Alarm not found' });
  }
  
  // Update fields if provided
  if (req.body.status) {
    alarm.status = req.body.status;
  }
  if (req.body.assignee) {
    alarm.assignee = req.body.assignee;
  }
  
  res.json(alarm);
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`GET  /api/alarms       - Get all alarms`);
  console.log(`GET  /api/alarms/:id   - Get alarm by id`);
  console.log(`PUT  /api/alarms/:id   - Update alarm`);
});
