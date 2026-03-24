/**
 * ==================== API 配置文件 ====================
 * 
 * 目的：
 * - 集中管理所有后端API的地址和端点
 * - 统一修改 API 地址只需改一个地方
 * - 避免在各个页面硬编码 URL
 * - 便于后续切换开发/生产环境的 API 地址
 * 
 * 使用方式：
 * import { API } from '@/api'
 * 
 * fetch(API.GET_ALARMS)  // 获取所有告警
 * fetch(API.GET_ALARM_DETAIL('A001'))  // 获取告警详情
 * fetch(API.UPDATE_ALARM('A001'), { method: 'PUT', ... })  // 更新告警
 */

/**
 * API 服务器地址
 * 
 * 开发环境: http://localhost:3000
 * 生产环境: 可改为真实服务器地址（如 https://api.example.com）
 */
const API_BASE_URL = "http://localhost:3000";

/**
 * API 端点常量
 * 
 * 前端所有 fetch 请求都通过这些常量构造 URL
 * 保持单一数据源，便于维护和修改
 */
export const API = {
  /**
   * GET /api/alarms
   * 获取所有告警列表
   * 
   * 返回: Alarm[]
   */
  GET_ALARMS: `${API_BASE_URL}/api/alarms`,
  
  /**
   * GET /api/alarms/:id
   * 获取单个告警的详细信息
   * 
   * 参数: id - 告警ID（如 "A001"）
   * 返回: Alarm
   * 
   * 使用: API.GET_ALARM_DETAIL('A001')
   */
  GET_ALARM_DETAIL: (id: string) => `${API_BASE_URL}/api/alarms/${id}`,
  
  /**
   * PUT /api/alarms/:id
   * 更新告警信息（状态、负责人等）
   * 
   * 参数: id - 告警ID（如 "A001"）
   * 请求体: { status?: string, assignee?: string }
   * 返回: Alarm (更新后的数据)
   * 
   * 使用: 
   * fetch(API.UPDATE_ALARM('A001'), {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ status: '対応中' })
   * })
   */
  UPDATE_ALARM: (id: string) => `${API_BASE_URL}/api/alarms/${id}`,
  
  /**
   * POST /api/alarms/:id/upload
   * 上传证拠（証拠）图片到指定告警
   * 
   * [关键] 文件上传端点：
   * - 使用 multipart/form-data 发送文件
   * - 后端保存到本地 uploads/ 文件夹
   * - 返回图片访问路径
   * 
   * 参数: id - 告警ID（如 "A001"）
   * 请求体: FormData with 'file' field
   * 返回: { imagePath: string, alarm: Alarm }
   * 
   * 使用:
   * const formData = new FormData();
   * formData.append('file', fileInput.files[0]);
   * fetch(API.UPLOAD_EVIDENCE('A001'), {
   *   method: 'POST',
   *   body: formData  // 注意：不要设置 Content-Type，浏览器会自动设置
   * })
   */
  UPLOAD_EVIDENCE: (id: string) => `${API_BASE_URL}/api/alarms/${id}/upload`,
  
  /**
   * DELETE /api/alarms/:id/evidence
   * 删除指定告警的证拠（証拠）图片
   * 
   * [关键] 文件删除端点：
   * - 删除硬盘上的图片文件
   * - 从告警的 evidence 数组中移除路径
   * - 返回更新后的告警数据
   * 
   * 参数: id - 告警ID（如 "A001"）
   * 请求体: { imagePath: string } - 要删除的图片路径
   * 返回: Alarm (更新后的数据)
   * 
   * 使用:
   * fetch(API.DELETE_EVIDENCE('A001'), {
   *   method: 'DELETE',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     imagePath: '/uploads/1711270400000-abc123-photo.jpg'
   *   })
   * })
   */
  DELETE_EVIDENCE: (id: string) => `${API_BASE_URL}/api/alarms/${id}/evidence`,
};
