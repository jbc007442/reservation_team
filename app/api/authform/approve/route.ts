import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';

import AuthForm from '@/models/booking/AuthForm';
import Booking from '@/models/booking/Booking';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Approval token is required.',
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findOne({
      'approval.token': token,
    });

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid approval link.',
        },
        { status: 404 }
      );
    }

    if (authForm.approval.tokenExpiresAt && authForm.approval.tokenExpiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Approval link has expired.',
        },
        { status: 400 }
      );
    }

    if (authForm.approval.status === 'approved') {
      return NextResponse.json({
        success: true,
        message: 'Booking already approved.',
      });
    }

    /* ---------------- Client Information ---------------- */

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '';

    const userAgent = req.headers.get('user-agent') || '';

    /* ---------------- Update AuthForm ---------------- */

    authForm.approval.status = 'approved';

    authForm.approval.approvedAt = new Date();

    authForm.approval.approvedBy = {
      ...authForm.approval.approvedBy,
      ipAddress,
      userAgent,
    };

    authForm.timeline.push({
      action: 'Booking Approved',
      description: 'Customer approved the authorization form.',
      source: 'customer',
      createdAt: new Date(),
    });

    await authForm.save();

    /* ---------------- Update Booking ---------------- */

    await Booking.findByIdAndUpdate(authForm.bookingId, {
      status: 'auth_completed',
    });

    return NextResponse.json({
      success: true,
      message: 'Booking approved successfully.',
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
