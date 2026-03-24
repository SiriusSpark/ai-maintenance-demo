/**
 * API 配置文件
 * 集中管理所有后端API的地址，便于后续修改和维护
 */

const API_BASE_URL = "http://localhost:3000";

export const API = {
  // 获取所有告警列表
  GET_ALARMS: `${API_BASE_URL}/api/alarms`,
  
  // 获取单个告警详情
  GET_ALARM_DETAIL: (id: string) => `${API_BASE_URL}/api/alarms/${id}`,
  
  // 更新告警信息
  UPDATE_ALARM: (id: string) => `${API_BASE_URL}/api/alarms/${id}`,
};
