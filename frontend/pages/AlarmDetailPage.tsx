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
  const [saving, setSaving] = useState(false); // 保存状态
  const [uploading, setUploading] = useState(false); // 上传状态
  
  // ==================== 表单状态 ====================
  const [formData, setFormData] = useState({
    status: "", // 编辑后的状态
    assignee: "", // 编辑后的负责人
  });

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
    setSaving(true);
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
    } finally {
      setSaving(false);
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
    <div style={{ padding: 20, maxWidth: 900 }}>
      <button onClick={() => navigate("/alarms")} style={{ marginBottom: 20 }}>
        ← 戻る
      </button>

      <h1>警報詳細</h1>

      {/* 基本情報 */}
      <div style={{ marginBottom: 30, padding: 15, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
        <h2 style={{ marginTop: 0 }}>基本情報</h2>
        <div style={{ marginBottom: 10, lineHeight: 2 }}>
          <div><strong>ID:</strong> {alarm.id}</div>
          <div><strong>発生日時:</strong> {alarm.time}</div>
          <div><strong>レベル:</strong> {alarm.level}</div>
          <div><strong>設備名:</strong> {alarm.equipment}</div>
          <div><strong>確信度:</strong> {alarm.confidence}%</div>
        </div>
      </div>

      {/* 編集フォーム */}
      <div style={{ marginBottom: 30, padding: 15, backgroundColor: "#fffacd", borderRadius: 4 }}>
        <h2 style={{ marginTop: 0 }}>編集</h2>
        <div style={{ marginBottom: 15 }}>
          <label>
            <div><strong>ステータス:</strong></div>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              style={{ padding: 8, width: 200, fontSize: 14 }}
            >
              <option value="未対応">未対応</option>
              <option value="対応中">対応中</option>
              <option value="完了">完了</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>
            <div><strong>担当者:</strong></div>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
              style={{ padding: 8, width: 200, fontSize: 14 }}
            />
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            borderRadius: 4,
            fontSize: 14,
          }}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* [关键] エビデンス（証拠/Evidence）セクション */}
      <div style={{ marginBottom: 30, padding: 15, backgroundColor: "#fff0f5", borderRadius: 4 }}>
        <h2 style={{ marginTop: 0 }}>🔍 エビデンス（証拠画像）</h2>
        
        {/* ファイルアップロード */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 10 }}>
            <strong>画像をアップロード:</strong>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadEvidence}
              disabled={uploading}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: "8px 16px",
                backgroundColor: uploading ? "#ccc" : "#2196F3",
                color: "white",
                border: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {uploading ? "アップロード中..." : "選択"}
            </button>
          </div>
        </div>

        {/* アップロード済みの画像表示 */}
        <div>
          <div style={{ marginBottom: 10 }}>
            <strong>アップロード済み画像: {alarm.evidence?.length || 0} 件</strong>
          </div>
          {alarm.evidence && alarm.evidence.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 15,
              }}
            >
              {alarm.evidence.map((imagePath, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <img
                    src={`http://localhost:3000${imagePath}`}
                    alt={`Evidence ${index + 1}`}
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div style={{ padding: 10, flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 8, wordBreak: "break-all" }}>
                      {imagePath.split("/").pop()}
                    </div>
                    <button
                      onClick={() => handleDeleteEvidence(imagePath)}
                      style={{
                        width: "100%",
                        padding: "6px 12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: 3,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#999", fontStyle: "italic" }}>
              アップロードされた画像はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}