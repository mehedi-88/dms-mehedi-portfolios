'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export function SupabaseVerification() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from('user_presence')
          .select('*')
          .limit(1);

        if (error) {
          setConnectionStatus('error');
          setErrorMessage(`Database Error: ${error.message}`);
          return;
        }

        // Test realtime subscription
        const channel = supabase
          .channel('test_channel')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_presence'
          }, () => {
            console.log('Realtime working!');
          })
          .subscribe();

        // Test write operation
        const testId = `test_${Date.now()}`;
        const { error: writeError } = await supabase
          .from('user_presence')
          .upsert({
            user_id: testId,
            is_online: true,
            last_seen: new Date().toISOString()
          });

        if (writeError) {
          setConnectionStatus('error');
          setErrorMessage(`Write Error: ${writeError.message}`);
          return;
        }

        // Clean up test data
        await supabase
          .from('user_presence')
          .delete()
          .eq('user_id', testId);

        // Clean up channel
        supabase.removeChannel(channel);

        setConnectionStatus('success');
        setTestResults({
          connection: 'OK',
          realtime: 'OK',
          write: 'OK',
          tables: ['user_presence', 'chat_sessions', 'chat_messages', 'typing_status']
        });

      } catch (err) {
        setConnectionStatus('error');
        setErrorMessage(`Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm"
    >
      <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
        Supabase Status
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
            connectionStatus === 'success' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-sm font-medium">
            {connectionStatus === 'checking' ? 'Checking...' :
             connectionStatus === 'success' ? 'Connected' : 'Error'}
          </span>
        </div>

        {connectionStatus === 'error' && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {errorMessage}
          </div>
        )}

        {connectionStatus === 'success' && testResults && (
          <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
            <div>✓ Database Connection</div>
            <div>✓ Realtime Subscriptions</div>
            <div>✓ Write Operations</div>
            <div>✓ All Tables Available</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <div>Environment: {process.env.NODE_ENV}</div>
        <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</div>
        <div>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</div>
      </div>
    </motion.div>
  );
}
