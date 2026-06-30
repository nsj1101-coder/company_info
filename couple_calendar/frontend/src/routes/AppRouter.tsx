import { Navigate, Route, Routes } from 'react-router-dom';
import CalendarPage from '@/pages/CalendarPage';
import SchedulesPage from '@/pages/SchedulesPage';
import PlansPage from '@/pages/PlansPage';
import RemindersPage from '@/pages/RemindersPage';
import UsPage from '@/pages/UsPage';
import SignupPage from '@/pages/SignupPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/schedules" element={<SchedulesPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/reminders" element={<RemindersPage />} />
      <Route path="/us" element={<UsPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
