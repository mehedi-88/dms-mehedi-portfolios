import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminPanel = dynamic(() => import('@/components/AdminPanel').then(mod => ({ default: mod.AdminPanel })), {
  loading: () => <AdminPanelSkeleton />,
  ssr: false, // Disable SSR for better performance with real-time features
});

const AdminPanelSkeleton = dynamic(() => import('@/components/AdminPanelSkeleton'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Admin Dashboard | DMS Mehedi',
  description: 'Simulated Admin Dashboard for managing portfolio content and real-time chat status.',
};

export default function AdminPage() {
  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-100 dark:bg-gray-950">
      <Suspense fallback={<AdminPanelSkeleton />}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}

