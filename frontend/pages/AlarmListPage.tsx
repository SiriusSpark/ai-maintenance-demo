import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { API } from "@/api"; // API 地址配置

/**
 * 告警数据类型定义
 */
type Alarm = {
  id: string;                // 告警ID
  time: string;              // 发生时间（日期时间格式）
  level: string;             // 异常等级（警告/注意/高）
  equipment: string;         // 设备名称
  confidence: number;        // 异常确信度（0-100%）
  status: string;            // 处理状态（未対応/対応中/解決済）
  assignee: string;          // 负责人
};

/**
 * 告警列表页面组件
 * 
 * 功能：
 * - 从后端 GET /api/alarms 获取告警数据
 * - 按设备名和日期范围筛选告警
 * - 实现分页功能（每页5条）
 * - 使用彩色标签显示等级和状态
 * - 点击「詳細・編集」跳转到详情页
 */
export default function AlarmListPage() {
  // ==================== 数据状态 ====================
  const [allAlarms, setAllAlarms] = useState<Alarm[]>([]); // 原始告警数据
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]); // 筛选后的数据
  
  // ==================== 筛选条件状态 ====================
  const [equipmentFilter, setEquipmentFilter] = useState(""); // 设备名筛选
  const [startDate, setStartDate] = useState(""); // 开始日期
  const [endDate, setEndDate] = useState(""); // 结束日期
  
  // ==================== 分页状态 ====================
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const ITEMS_PER_PAGE = 5; // 每页显示条数

  /**
   * 初始化：从后端获取所有告警数据
   * GET /api/alarms 返回所有告警信息
   */
  useEffect(() => {
    fetch(API.GET_ALARMS)
      .then((res) => res.json())
      .then((data) => {
        setAllAlarms(data);
        setFilteredAlarms(data);
      })
      .catch((err) => {
        console.error("Failed to load alarms:", err);
      });
  }, []);

  /**
   * 筛选逻辑：根据设备名和日期范围过滤告警
   */
  const handleFilter = () => {
    let filtered = allAlarms;

    // 按设备名筛选
    if (equipmentFilter) {
      filtered = filtered.filter((alarm) =>
        alarm.equipment.includes(equipmentFilter)
      );
    }

    // 按开始日期筛选
    if (startDate) {
      filtered = filtered.filter((alarm) => alarm.time >= startDate);
    }
    
    // 按结束日期筛选
    if (endDate) {
      filtered = filtered.filter((alarm) => alarm.time <= endDate);
    }

    setFilteredAlarms(filtered);
    setCurrentPage(1); // 重置到第一页
  };

  /**
   * 清空所有筛选条件
   */
  const handleClear = () => {
    setEquipmentFilter("");
    setStartDate("");
    setEndDate("");
    setFilteredAlarms(allAlarms);
    setCurrentPage(1);
  };

  /**
   * 分页计算
   */
  const totalPages = Math.ceil(filteredAlarms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredAlarms.slice(startIndex, endIndex);

  /**
   * 获取等级（level）的样式颜色
   * 警告 = 红色, 注意 = 橙色, 高 = 深红
   */
  const getLevelStyle = (level: string) => {
    const styles: Record<string, { background: string; color: string }> = {
      警告: { background: "#d9534f", color: "white" },
      高: { background: "#c9302c", color: "white" },
      注意: { background: "#f0ad4e", color: "white" },
    };
    return styles[level] || { background: "#ccc", color: "black" };
  };

  /**
   * 获取状态（status）的样式颜色
   * 完了/解決済 = 绿色, 対応中 = 橙色, 未対応 = 红色
   */
  const getStatusStyle = (status: string) => {
    const styles: Record<string, { background: string; color: string }> = {
      完了: { background: "#5cb85c", color: "white" },
      解決済: { background: "#5cb85c", color: "white" },
      対応中: { background: "#f0ad4e", color: "white" },
      未対応: { background: "#d9534f", color: "white" },
    };
    return styles[status] || { background: "#ccc", color: "black" };
  };

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#f5f5f5" }}>
      <h1 style={{ marginBottom: 20 }}>🔧 設備異常一覧</h1>

      {/* 筛选区域 */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          marginBottom: 20,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            設備名:
          </label>
          <input
            type="text"
            placeholder="例: 冷却ポンプ"
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            style={{
              padding: 8,
              width: "300px",
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />
        </div>

        <div style={{ marginBottom: 10, display: "flex", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              期間:
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
              <span>〜</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <button
              onClick={handleFilter}
              style={{
                padding: "8px 16px",
                background: "#5a7c8e",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              絞り込む
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: "8px 16px",
                background: "#999",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              クリア
            </button>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div
        style={{
          background: "white",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: 20,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>
                発生日時
              </th>
              <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>
                レベル
              </th>
              <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>
                設備名
              </th>
              <th style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>
                確信度
              </th>
              <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>
                ステータス
              </th>
              <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>
                担当者
              </th>
              <th style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((alarm) => (
              <tr
                key={alarm.id}
                style={{
                  borderBottom: "1px solid #eee",
                }}
              >
                <td style={{ padding: 12 }}>{alarm.time}</td>
                <td style={{ padding: 12 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: 4,
                      ...getLevelStyle(alarm.level),
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {alarm.level}
                  </span>
                </td>
                <td style={{ padding: 12 }}>{alarm.equipment}</td>
                <td style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>
                  <span style={{ color: "#ff9800" }}>{alarm.confidence}%</span>
                </td>
                <td style={{ padding: 12 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: 4,
                      ...getStatusStyle(alarm.status),
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {alarm.status}
                  </span>
                </td>
                <td style={{ padding: 12 }}>{alarm.assignee}</td>
                <td style={{ padding: 12, textAlign: "center" }}>
                  <Link
                    to={`/alarms/${alarm.id}`}
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      background: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    詳細・編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentData.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            データがありません
          </div>
        )}
      </div>

      {/* 分页 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "white",
          padding: 15,
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ color: "#666", fontSize: 14 }}>
          全 {filteredAlarms.length} 件中 {startIndex + 1}-
          {Math.min(endIndex, filteredAlarms.length)}
          件を表示
        </div>

        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{
              padding: "8px 12px",
              background: currentPage === 1 ? "#ddd" : "#fff",
              border: "1px solid #ddd",
              borderRadius: 4,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              color: currentPage === 1 ? "#999" : "#333",
            }}
          >
            前へ
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: "8px 10px",
                background: currentPage === page ? "#007bff" : "#fff",
                color: currentPage === page ? "white" : "#333",
                border: "1px solid #ddd",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: currentPage === page ? "bold" : "normal",
              }}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              padding: "8px 12px",
              background: currentPage === totalPages ? "#ddd" : "#fff",
              border: "1px solid #ddd",
              borderRadius: 4,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              color: currentPage === totalPages ? "#999" : "#333",
            }}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}