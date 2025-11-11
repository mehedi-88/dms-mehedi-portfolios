'use client';

import React from 'react';
import Robotic3DSystem from '@/components/Robotic3DSystem';

export default function Test3DPage() {
  return (
    <Robotic3DSystem>
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-[#00C4FF]">3D System Test</h1>
          <p className="text-xl mb-8">Testing the robotic 3D animation system</p>
          <div className="space-y-4">
            <p className="text-gray-400">If you can see a 3D robot animation in the background, the system is working!</p>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                Current page: <span className="text-[#00C4FF] font-bold">Test Page</span><br/>
                Expected model: <span className="text-[#00C4FF] font-bold">Robot Scanner</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Robotic3DSystem>
  );
}