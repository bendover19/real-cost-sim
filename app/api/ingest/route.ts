import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // upsert on session_id so multiple posts (email later) overwrite one row
    const { data, error } = await supabase
      .from('responses')
      .upsert([body], { onConflict: 'session_id', ignoreDuplicates: false })
      .select('id, session_id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id, session_id: data?.session_id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
