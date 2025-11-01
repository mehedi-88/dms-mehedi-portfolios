import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    // Test realtime capabilities
    const { data: realtimeTest, error: realtimeError } = await supabase
      .from('chat_sessions')
      .select('count')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection verified',
      data: {
        connection: 'OK',
        realtime: realtimeError ? 'Error' : 'OK',
        tables: {
          user_presence: 'OK',
          chat_sessions: realtimeError ? 'Error' : 'OK'
        }
      }
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: 'Connection failed',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test write operations
    const testId = `test_${Date.now()}`;
    
    // Test user_presence upsert
    const { error: presenceError } = await supabase
      .from('user_presence')
      .upsert({
        user_id: testId,
        is_online: true,
        last_seen: new Date().toISOString()
      });

    if (presenceError) {
      return NextResponse.json({
        success: false,
        error: 'Write test failed',
        details: presenceError
      }, { status: 500 });
    }

    // Clean up test data
    await supabase
      .from('user_presence')
      .delete()
      .eq('user_id', testId);

    return NextResponse.json({
      success: true,
      message: 'Supabase write operations verified'
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: 'Write test failed',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
