import React from 'react';

export default function AdminPanelSkeleton() {
  return (
    <div className="min-h-screen p-6">
      <div className="animate-pulse bg-gray-800/60 rounded-2xl h-12 w-64 mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-20 bg-gray-800/50 rounded-lg"></div>
          <div className="h-64 bg-gray-800/50 rounded-lg"></div>
        </div>
        <div className="lg:col-span-3">
          <div className="h-[700px] bg-gray-800/50 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
