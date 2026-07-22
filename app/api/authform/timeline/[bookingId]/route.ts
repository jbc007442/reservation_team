// app/api/authform/timeline/[bookingId]/route.ts

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';

export async function GET(req: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  await connectDB();

  const { bookingId } = await params;

  const authForm = await AuthForm.findOne({ bookingId })
    .populate('timeline.performedBy', 'name')
    .lean();

  if (!authForm) {
    return NextResponse.json({
      success: true,
      data: [],
    });
  }

  return NextResponse.json({
    success: true,
    data: authForm.timeline ?? [],
  });
}
