import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  try {
    const body = await req.json();

    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      const userId = session.client_reference_id;

      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_vip: true, free_analyses_left: 999 })
          .eq('id', userId);

        if (error) {
          console.error("Erreur VIP Supabase:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Erreur Webhook:", err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}
