import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB();

    const { bookingId } = await params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Booking ID',
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findOne({ bookingId }).lean();

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        approval: authForm.approval,
        email: authForm.email,
        bookingStatus: authForm.approval.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
