# 设备异常管理系统（Demo）

一个用于工业设备异常告警管理的小型演示项目，用于练习全栈开发工作流。

## 项目概述

**核心功能**：显示设备异常告警的列表和详情，允许用户更新告警的处理状态和负责人。

**使用场景**：工厂/工业环保监控系统，实时显示各设备的异常告警（故障、异常波动等）。

---

## 技术栈

**前端**：
- React + TypeScript（开发语言和框架）
- Vite（打包工具）

**后端**：
- Node.js + Express（Web服务器框架）
- 内存数组存储（当前版本，生产环境应替换为数据库）

---

## 已实现功能 ✅

### 列表页（AlarmListPage）
- ✅ 页面路由 `/alarms`
- ✅ 从后端API获取告警数据并在表格中显示
- ✅ 点击「詳細」按钮跳转到详情页（如 `/alarms/A001`）
- ✅ 无控制台错误

### 详情页（AlarmDetailPage）
- ✅ 页面路由 `/alarms/:id`
- ✅ 显示单个告警的完整信息（ID、发生时间、设备名、异常等级、确信度）
- ✅ 编辑状态（未対応 / 対応中 / 解決済）
- ✅ 编辑负责人（担当者）
- ✅ 保存后刷新数据到列表页
- ✅ 「戻る」按钮返回列表页

### 前后端集成
- ✅ 列表页数据来自 GET `/api/alarms` 
- ✅ 详情页数据来自 GET `/api/alarms/:id`
- ✅ 编辑保存通过 PUT `/api/alarms/:id`

---

## 项目结构

```
ai-maintenance-demo/
├── frontend/           # React + Vite 前端应用
│   ├── src/
│   │   ├── App.tsx    # 路由配置
│   │   ├── main.tsx   # 入口文件
│   │   └── ...
│   ├── pages/
│   │   ├── AlarmListPage.tsx  # 告警列表页
│   │   └── AlarmDetailPage.tsx # 告警详情页
│   ├── package.json
│   └── vite.config.ts
│
└── backend/           # Node.js + Express 后端
    ├── index.js       # 启动文件，包含所有API端点
    └── package.json
```

---

## 如何启动

### 前端启动

```bash
cd frontend
npm install          # 首次需要安装依赖
npm run dev          # 启动开发服务器
```

访问：http://localhost:5174

### 后端启动

```bash
cd backend
npm install          # 首次需要安装依赖
node index.js        # 启动服务器
```

服务运行在：http://localhost:3000

---

## API 端点

所有请求都需要和前端在同一主机。当前配置：

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/api/alarms` | 获取所有告警列表 |
| GET | `/api/alarms/:id` | 获取单个告警详情 |
| PUT | `/api/alarms/:id` | 更新告警状态或负责人 |

**当前数据存储**：后端使用内存数组 `mockAlarms`，应用重启后数据复原。生产环境应替换为 MongoDB / PostgreSQL 等真实数据库。

---

## 数据结构

```typescript
type Alarm = {
  id: string;              // 告警ID（如 "A001"）
  time: string;            // 发生时间（如 "2026-03-05 10:12"）
  level: string;           // 异常等级（"警告", "注意", "高"）
  equipment: string;       // 设备名称（如 "冷却ポンプ1号"）
  confidence: number;      // 异常确信度（0-100）
  status: string;          // 处理状态（"未対応", "対応中", "解決済"）
  assignee: string;        // 负责人（姓名）
};
```

---

## 下一步计划 🚀

### 可选功能（当前未实现）
- [ ] 告警列表筛选（按设备、日期筛选）
- [ ] 分页功能
- [ ] 上传证据文件/截图
- [ ] 告警历史记录
- [ ] 邮件通知
- [ ] 数据持久化（接入真实数据库）
- [ ] 权限管理（不同角色不同操作权限）

### 改进方向
- [ ] 前端：统一API调用、错误处理、加载动画
- [ ] 后端：参数校验、错误处理、日志记录、数据库集成
- [ ] 部署：Docker 容器化、CI/CD 流程

---

## 快速查看关键代码

**前端 API 请求的位置**：
- 列表页数据获取：[frontend/pages/AlarmListPage.tsx](frontend/pages/AlarmListPage.tsx#L16) (useEffect 中的 fetch)
- 详情页数据获取：[frontend/pages/AlarmDetailPage.tsx](frontend/pages/AlarmDetailPage.tsx#L24) (useEffect 中的 fetch)
- 保存接口：[frontend/pages/AlarmDetailPage.tsx](frontend/pages/AlarmDetailPage.tsx#L44) (handleSave 中的 PUT 请求)

**后端 API 实现**：
- 所有路由在 [backend/index.js](backend/index.js)
- 数据存储：[backend/index.js](backend/index.js#L11) (mockAlarms 数组)
