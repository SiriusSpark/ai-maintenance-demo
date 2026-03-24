# 设备异常管理系统（Demo）

一个用于工业设备异常告警管理的小型演示项目，用于练习全栈开发工作流。

## 项目概述

**核心功能**：显示设备异常告警的列表和详情，允许用户筛选告警、分页查看、更新处理状态和负责人。

**使用场景**：工厂/工业设备监控系统，实时显示各设备的异常告警（故障、异常波动等）。

---

## 技术栈

**前端**：
- React + TypeScript
- Vite

**后端**：
- Node.js + Express
- 内存数组存储

---

## 已实现功能 ✅

### 列表页（AlarmListPage）
- ✅ 页面路由 `/alarms`
- ✅ 从后端API获取告警数据
- ✅ **筛选功能**：按设备名、日期范围筛选
- ✅ **分页功能**：每页5条，支持前后翻页和页码跳转
- ✅ **彩色标签**：等级和状态带颜色显示
- ✅ 点击「詳細・編集」跳转到详情页

### 详情页（AlarmDetailPage）
- ✅ 页面路由 `/alarms/:id`
- ✅ 显示告警详细信息
- ✅ 编辑状态和负责人
- ✅ 保存更改到后端
- ✅ **上传证拠图片**：支持上传多张图片作为证拠
- ✅ **删除证拠图片**：可删除已上传的图片，同时清理硬盘文件
- ✅ 返回列表页

### 后端 API
- ✅ `GET /api/alarms` - 获取所有告警
- ✅ `GET /api/alarms/:id` - 获取单个告警
- ✅ `PUT /api/alarms/:id` - 更新告警信息
- ✅ `POST /api/alarms/:id/upload` - 上传证拠图片
- ✅ `DELETE /api/alarms/:id/evidence` - 删除证拠图片

---

## 项目结构

```
ai-maintenance-demo/
├── frontend/                      # React前端（Vite + TypeScript）
│   ├── src/
│   │   ├── App.tsx               # 路由配置
│   │   ├── api.ts                # API地址常量（集中管理）
│   │   ├── index.css
│   │   └── main.tsx
│   ├── pages/
│   │   ├── AlarmListPage.tsx     # 告警列表（筛选、分页）
│   │   └── AlarmDetailPage.tsx   # 告警详情（编辑、证拠管理）
│   ├── tsconfig.app.json         # 路径别名配置
│   ├── vite.config.ts            # Vite 别名解析
│   └── package.json
│
├── backend/                      # Node.js后端（Express）
│   ├── index.js                  # 所有API和数据
│   ├── uploads/                  # 证拠图片存储文件夹
│   └── package.json
│
├── README.md                     # 项目文档
├── TODO.md                       # 任务清单
└── UPLOAD_GUIDE.md               # 文件上传功能指南
```

---

## 快速启动

### 前端

```bash
cd frontend
npm install
npm run dev
```

访问：http://localhost:5174

### 后端

```bash
cd backend
npm install
node index.js
```

运行在：http://localhost:3000

---

## API 文档

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/api/alarms` | 获取所有告警列表 |
| GET | `/api/alarms/:id` | 获取单个告警详情 |
| PUT | `/api/alarms/:id` | 更新告警状态和/或负责人 |
| POST | `/api/alarms/:id/upload` | 上传证拠图片（multipart/form-data） |
| DELETE | `/api/alarms/:id/evidence` | 删除证拠图片 |

**数据格式**：
```typescript
type Alarm = {
  id: string;              // "A001"
  time: string;            // "2026-03-05 10:12"
  level: string;           // "警告" / "注意" / "高"
  equipment: string;       // "冷却ポンプ1号"
  confidence: number;      // 0-100
  status: string;          // "未対応" / "対応中" / "解決済"
  assignee: string;        // 人名
  evidence: string[];      // 证拠图片路径数组（如 ["/uploads/xxx.jpg"]）
};
```

**上传证拠** (POST /api/alarms/:id/upload)：
```typescript
// 请求：multipart/form-data
// 字段：file: File（图片文件）

// 响应：
{
  imagePath: string;       // "/uploads/1711270400000-abc123-photo.jpg"
  alarm: Alarm             // 更新后的完整告警数据
}
```

**删除证拠** (DELETE /api/alarms/:id/evidence)：
```typescript
// 请求体：
{ imagePath: "/uploads/1711270400000-abc123-photo.jpg" }

// 响应：更新后的 Alarm 对象
```

---

## 下一步计划 🚀

### 核心功能拓展
- [ ] 告警历史记录和操作日志
- [ ] 邮件/短信通知
- [ ] 高级筛选（多条件、全文搜索）
- [ ] 批量操作（批量更新状态）
- [ ] 数据导出（Excel、PDF）

### 技术升级
- [ ] 数据库集成（MongoDB / PostgreSQL）
- [ ] 用户认证和权限管理
- [ ] 权限控制（不同用户不同操作权限）
- [ ] 错误处理和日志记录
- [ ] 参数验证（前后端）

### 基础设施
- [ ] Docker 容器化
- [ ] CI/CD 流程（GitHub Actions）
- [ ] 单元测试和集成测试
- [ ] API 文档自动生成（Swagger）
- [ ] 性能优化（缓存、CDN）

### 用户体验
- [ ] 加载动画和骨架屏
- [ ] 实时通知（WebSocket）
- [ ] 图表和数据可视化
- [ ] 响应式设计优化
- [ ] 深色模式支持

---

## 文件说明

- **README.md** - 项目文档（当前文件）
- **TODO.md** - MVP 任务清单
- **UPLOAD_GUIDE.md** - 文件上传功能详细指南
