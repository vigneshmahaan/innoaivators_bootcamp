import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, bootcamp_id, education, experience_level } = body;

    // Validate inputs
    if (!name || !email || !phone || !bootcamp_id || !education || !experience_level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert user (or just insert)
    let { data: user, error: userError } = await supabase
      .from('users')
      .upsert([{ email, name, phone }], { onConflict: 'email' })
      .select()
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([{ user_id: user.id, bootcamp_id, education, experience_level, payment_status: 'pending' }])
      .select()
      .single();

    if (regError) {
      return NextResponse.json({ error: regError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registrationId: registration.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
