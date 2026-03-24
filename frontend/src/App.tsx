import { Routes, Route, Navigate } from "react-router-dom";
import AlarmListPage from "../pages/AlarmListPage";
import AlarmDetailPage from "../pages/AlarmDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/alarms" replace />} />
      <Route path="/alarms" element={<AlarmListPage />} />
      <Route path="/alarms/:id" element={<AlarmDetailPage />} />
    </Routes>
  );
}

export default App;
