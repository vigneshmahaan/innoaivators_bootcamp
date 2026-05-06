import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/services/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, receipt } = body;

    if (!amount || !receipt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order using Razorpay service
    const order = await createRazorpayOrder(amount * 100, 'INR', receipt); // Amount in paise

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
