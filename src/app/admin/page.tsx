import { AdminPanel } from '@/components/AdminPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | DMS Mehedi',
  description: 'Simulated Admin Dashboard for managing portfolio content and real-time chat status.',
};

export default function AdminPage() {
  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-100 dark:bg-gray-950">
      <AdminPanel />
    </div>
  );
}

