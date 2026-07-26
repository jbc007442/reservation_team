// import { NextResponse } from 'next/server';
// import { connectDB } from '@/lib/mongodb';
// import AuthForm from '@/models/booking/AuthForm';

// export async function GET(req: Request, { params }: { params: Promise<{ bookingId: string }> }) {
//   await connectDB();

//   const { bookingId } = await params;

//   const authForm = await AuthForm.findOne({ bookingId })
//     .populate('timeline.performedBy', 'name')
//     .lean();

//   if (!authForm) {
//     return NextResponse.json({
//       success: true,
//       data: [],
//     });
//   }

//   return NextResponse.json({
//     success: true,
//     data: authForm.timeline ?? [],
//   });
// }

import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';

export async function GET(req: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    await connectDB();

    const { bookingId } = await params;

    const authForm = await AuthForm.findOne({ bookingId })
      .populate('timeline.performedBy', 'name email')
      .lean();

    if (!authForm) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: authForm.timeline || [],
    });
  } catch (error: any) {
    console.error('Timeline API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch timeline.',
      },
      { status: 500 }
    );
  }
}