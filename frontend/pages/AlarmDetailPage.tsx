import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { API } from "@/api"; // API 地址配置

/**
 * 告警数据类型定义
 */
type Alarm = {
  id: string;                // 告警ID
  time: string;              // 发生时间
  level: string;             // 异常等级
  equipment: string;         // 设备名称
  confidence: number;        // 异常确信度
  status: string;            // 处理状态
  assignee: string;          // 负责人
  evidence?: string[];       // 证拠图片路径数组
};

/**
 * 告警详情页面组件
 * 
 * 功能：
 * - 从后端 GET /api/alarms/:id 获取单个告警详情
 * - 显示告警的所有信息
 * - 提供编辑状态和负责人的表单
 * - 通过 PUT /api/alarms/:id 保存修改
 * - 上传証拠（证拠）图片到服务器
 * - 显示已上传的图片列表
 * - 返回按钮回到列表页
 */
export default function AlarmDetailPage() {
  // ==================== 路由参数 ====================
  const { id } = useParams(); // 从URL获取告警ID
  const navigate = useNavigate(); // 用于导航回列表页
  const fileInputRef = useRef<HTMLInputElement>(null); // 文件输入框引用
  
  // ==================== 数据状态 ====================
  const [alarm, setAlarm] = useState<Alarm | null>(null); // 告警数据
  const [loading, setLoading] = useState(true); // 加载状态
  const [uploading, setUploading] = useState(false); // 上传状态
  
  // ==================== 表单状态 ====================
  const [formData, setFormData] = useState({
    status: "", // 编辑后的状态
    assignee: "", // 编辑后的负责人
    content: "", // 处理内容
  });
  const [selectedFileName, setSelectedFileName] = useState(""); // 选中的文件名

  /**
   * 初始化：从后端加载单个告警数据
   * GET /api/alarms/:id 返回指定告警的完整信息
   */
  useEffect(() => {
    if (!id) return;
    fetch(API.GET_ALARM_DETAIL(id))
      .then((res) => res.json())
      .then((data) => {
        setAlarm(data);
        // 初始化表单数据为当前告警的状态和负责人
        setFormData({
          status: data.status,
          assignee: data.assignee,
          content: "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load alarm:", err);
        setLoading(false);
      });
  }, [id]);

  /**
   * 保存告警修改
   * PUT /api/alarms/:id 更新状态和负责人信息
   */
  const handleSave = async () => {
    if (!id) return;
    try {
      const res = await fetch(API.UPDATE_ALARM(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formData.status,
          assignee: formData.assignee,
        }),
      });
      const updatedAlarm = await res.json();
      setAlarm(updatedAlarm);
      alert("保存しました");
    } catch (err) {
      console.error("Failed to save alarm:", err);
      alert("保存に失敗しました");
    }
  };

  /**
   * [关键] 处理文件上传
   * POST /api/alarms/:id/upload 上传证拠图片
   * 
   * 流程：
   * 1. 用户选择图片文件
   * 2. 创建 FormData 对象
   * 3. 使用 fetch 上传到后端
   * 4. 后端保存文件，返回访问路径
   * 5. 更新前端显示的图片列表
   */
  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    // 更新文件名显示
    setSelectedFileName(file.name);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API.UPLOAD_EVIDENCE(id), {
        method: "POST",
        body: formData, // 注意：FormData 会自动设置合适的 Content-Type
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      // 更新国警数据，包含新上传的图片路径
      setAlarm(data.alarm);
      alert("画像をアップロードしました");
      // 清空文件名显示
      setSelectedFileName("");
    } catch (err) {
      console.error("Failed to upload evidence:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
      // 清除文件输入框，允许重复上传相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /**
   * [关键] 处理图片删除
   * DELETE /api/alarms/:id/evidence 删除证拠图片
   * 
   * 流程：
   * 1. 用户点击删除按钮
   * 2. 确认删除（可选）
   * 3. 发送 DELETE 请求到后端
   * 4. 后端删除硬盘文件和数据库记录
   * 5. 更新前端显示
   */
  const handleDeleteEvidence = async (imagePath: string) => {
    // 确认删除
    if (!window.confirm(`「${imagePath.split("/").pop()}」を削除しますか？`)) {
      return;
    }

    if (!id) return;

    try {
      const res = await fetch(API.DELETE_EVIDENCE(id), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath }),
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      const updatedAlarm = await res.json();
      setAlarm(updatedAlarm);
      alert("画像を削除しました");
    } catch (err) {
      console.error("Failed to delete evidence:", err);
      alert("画像の削除に失敗しました");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>読み込み中...</div>;
  if (!alarm) return <div style={{ padding: 20 }}>警報が見つかりません</div>;

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 700 }}>
        <button 
          onClick={() => navigate("/alarms")} 
          style={{ 
            marginBottom: 20, 
            padding: "10px 15px",
            background: "#888888",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: "bold"
          }}
        >
          ← キャンセルして戻る
        </button>

      {/* 标题区域 */}
      <div style={{ marginBottom: 30, borderBottom: "3px solid #007bff", paddingBottom: 15 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>🚨 警報詳細</h1>
          <span
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: alarm.level === "高" ? "#c9302c" : alarm.level === "警告" ? "#d9534f" : "#f0ad4e",
              color: "white",
              borderRadius: 4,
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            {alarm.level === "高" ? "危険" : alarm.level === "警告" ? "警告" : "注意"}
          </span>
        </div>
      </div>

      {/* 基本情報 */}
      <div style={{ marginBottom: 30, padding: 15, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
        <h2 style={{ marginTop: 0 }}>基本情報</h2>
        <div style={{ marginBottom: 10, lineHeight: 2 }}>
          <div><strong>対象設備:</strong> {alarm.equipment}</div>
          <div><strong>発生日時:</strong> {alarm.time}</div>
          <div><strong>AI確信度:</strong> {alarm.confidence}%</div>
        </div>
      </div>

      {/* Liquid AI 推荐处理建议 */}
      <div style={{ 
        marginBottom: 30, 
        padding: 15, 
        backgroundColor: "#e7f3ff", 
        borderRadius: 4,
        borderLeft: "4px solid #007bff"
      }}>
        <div style={{ color: "#007bff", fontWeight: "bold", marginBottom: 8 }}>
          💡 Liquid AI推奨対処方法
        </div>
        <div style={{ color: "#333" }}>
          週末にベアリングのグリスアップを推奨
        </div>
      </div>

      {/* 統合フォーム（対応入力エリア + エビデンス）*/}
      <div style={{ marginBottom: 30, padding: 20, backgroundColor: "#f5f5f5", borderRadius: 4, border: "2px dashed #ddd" }}>
        {/* 対応入力エリア */}
        <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
          🖊️ 対応入力エリア
        </h2>
        <div style={{ marginBottom: 15, display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ width: 100, fontWeight: "bold" }}>対処状態:</div>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            style={{ padding: 8, flex: 1, fontSize: 14, border: "1px solid #ddd", borderRadius: 4 }}
          >
            <option value="未対応">未対応</option>
            <option value="対応中">対応中</option>
            <option value="完了">完了</option>
          </select>
        </div>

        <div style={{ marginBottom: 15, display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 100, fontWeight: "bold", paddingTop: 8 }}>担当者:</div>
          <input
            type="text"
            value={formData.assignee}
            onChange={(e) =>
              setFormData({ ...formData, assignee: e.target.value })
            }
            style={{ padding: 8, flex: 1, fontSize: 14, border: "1px solid #ddd", borderRadius: 4 }}
          />
        </div>

        <div style={{ marginBottom: 15, display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 100, fontWeight: "bold", paddingTop: 8 }}>対処内容:</div>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            style={{ 
              padding: 8, 
              flex: 1, 
              minHeight: 80,
              fontSize: 14,
              fontFamily: "Arial, sans-serif",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
            placeholder="対処内容を入力してください"
          />
        </div>

        {/* エビデンス セクション */}
        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid #ddd", display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ fontWeight: "bold", fontSize: 16, whiteSpace: "nowrap", marginTop: 5 }}>
            🔍 エビデンス：
          </div>
          
          <div style={{ flex: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadEvidence}
              disabled={uploading}
              style={{ display: "none" }}
            />
            
            {/* 第一行：選択ボタン + ファイル状態表示 */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#888888",
                  color: "white",
                  border: "none",
                  cursor: uploading ? "not-allowed" : "pointer",
                  borderRadius: 4,
                  fontWeight: "bold",
                  fontSize: 14,
                  whiteSpace: "nowrap"
                }}
              >
                {uploading ? "アップロード中..." : "選択"}
              </button>
              <div style={{ 
                color: selectedFileName ? "#333" : "#999",
                fontStyle: selectedFileName ? "normal" : "italic",
                fontSize: 14
              }}>
                {selectedFileName ? selectedFileName : "ファイルが選択されていません"}
              </div>
            </div>
            
            {/* 第二行：ファイル入力表示 + 削除ボタン */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ 
                flex: 1,
                padding: 8, 
                border: "1px solid #ddd", 
                borderRadius: 4,
                backgroundColor: "#f9f9f9",
                minHeight: "20px",
                color: "#999",
                fontSize: 14
              }}>
                &nbsp;
              </div>
              <button
                onClick={() => {
                  if (alarm.evidence && alarm.evidence.length > 0) {
                    const imagePath = alarm.evidence[0];
                    handleDeleteEvidence(imagePath);
                  }
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 4,
                  fontWeight: "bold",
                  fontSize: 14,
                  whiteSpace: "nowrap"
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>

        {/* 文件名显示已在输入框内，无需图片网格显示 */}
      </div>

      {/* 最后的保存返回按钮 */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={() => {
            handleSave();
            setTimeout(() => navigate("/alarms"), 500);
          }}
          style={{
            padding: "15px 40px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 4,
            fontSize: 16,
            fontWeight: "bold",
            width: "100%"
          }}
        >
          💾 内容を保存して戻る
        </button>
      </div>
      </div>
    </div>
  );
}