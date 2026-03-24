# MVP 任务清单

## 一、列表页（AlarmListPage）

- [x] 页面可以打开 /alarms
- [x] 表格能正常显示数据
- [x] 点击「詳細」能跳转到详情页
- [x]页面没有报错（控制台无红色错误）

## 二、详情页（AlarmDetailPage）

- [x] 页面可以打开 /alarms/:id
- [x] 能显示该告警的基本信息
- [x] 返回按钮可以回到列表页

## 三、后端

- [x] Node 服务可以启动（node index.js）
- [x] GET /api/alarms 能返回 JSON
- [x] GET /api/alarms/:id 能返回单个数据

## 四、前后端联通

- [x] 列表页数据来自 API（不是 mockData）
- [x] 详情页数据来自 API

## 五、（可选）加分项

- [ ] 筛选功能正常
- [ ] 分页（哪怕是假分页）
- [ ] 详情页有编辑 + 保存按钮