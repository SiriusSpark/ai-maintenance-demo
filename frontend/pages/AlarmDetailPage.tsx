import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

type Alarm = {
  id: string;
  time: string;
  level: string;
  equipment: string;
  confidence: number;
  status: string;
  assignee: string;
};

export default function AlarmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    assignee: "",
  });

  // Load alarm data from backend
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3000/api/alarms/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAlarm(data);
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

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/alarms/${id}`, {
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

  if (loading) return <div style={{ padding: 20 }}>読み込み中...</div>;
  if (!alarm) return <div style={{ padding: 20 }}>警報が見つかりません</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate("/alarms")} style={{ marginBottom: 20 }}>
        ← 戻る
      </button>

      <h1>警報詳細</h1>

      <div style={{ marginBottom: 20, lineHeight: 2 }}>
        <div><strong>ID:</strong> {alarm.id}</div>
        <div><strong>発生日時:</strong> {alarm.time}</div>
        <div><strong>レベル:</strong> {alarm.level}</div>
        <div><strong>設備名:</strong> {alarm.equipment}</div>
        <div><strong>確信度:</strong> {alarm.confidence}%</div>
      </div>

      <h2>編集</h2>
      <div style={{ marginBottom: 15 }}>
        <label>
          <div>ステータス:</div>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            style={{ padding: 5, width: 200 }}
          >
            <option value="未対応">未対応</option>
            <option value="対応中">対応中</option>
            <option value="完了">完了</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>
          <div>担当者:</div>
          <input
            type="text"
            value={formData.assignee}
            onChange={(e) =>
              setFormData({ ...formData, assignee: e.target.value })
            }
            style={{ padding: 5, width: 200 }}
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
          cursor: "pointer",
        }}
      >
        {saving ? "保存中..." : "保存"}
      </button>
    </div>
  );
}