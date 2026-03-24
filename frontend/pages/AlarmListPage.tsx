import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { API } from "../src/api";

type Alarm = {
  id: string;
  time: string;
  level: string;
  equipment: string;
  confidence: number;
  status: string;
  assignee: string;
};

export default function AlarmListPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // [关键] 从后端API获取告警列表数据
  // GET /api/alarms 返回所有告警信息
  useEffect(() => {
    fetch(API.GET_ALARMS)
      .then((res) => res.json())
      .then((data) => {
        setAlarms(data);
      })
      .catch((err) => {
        console.error("Failed to load alarms:", err);
      });
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h1>設備異常一覧</h1>

      <table border={1} cellPadding={10} style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>発生日時</th>
            <th>レベル</th>
            <th>設備名</th>
            <th>確信度</th>
            <th>ステータス</th>
            <th>担当者</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {alarms.map((alarm) => (
            <tr key={alarm.id}>
              <td>{alarm.time}</td>
              <td>{alarm.level}</td>
              <td>{alarm.equipment}</td>
              <td>{alarm.confidence}%</td>
              <td>{alarm.status}</td>
              <td>{alarm.assignee}</td>
              <td>
                <Link to={`/alarms/${alarm.id}`}>詳細</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}