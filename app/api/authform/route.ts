import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

import Booking from '@/models/booking/Booking';
import AuthForm from '@/models/booking/AuthForm';

import { sendAuthorizationEmail } from '@/lib/email/sendAuthorizationEmail';

/* ---------------- POST : Create Auth Form ---------------- */

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    verifyToken(token);

    const body = await req.json();

    /* ---------------- Already Exists ---------------- */

    const existing = await AuthForm.findOne({
      bookingId: body.bookingId,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form already exists for this booking.',
        },
        { status: 409 }
      );
    }

    /* ---------------- Booking ---------------- */

    const booking = await Booking.findById(body.bookingId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking not found.',
        },
        { status: 404 }
      );
    }

    /* ---------------- Approval Token ---------------- */

    const approvalToken = crypto.randomUUID();

    const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL}/approve?token=${approvalToken}`;

    /* ---------------- Create Auth Form ---------------- */

    const authForm = await AuthForm.create({
      ...body,

      approval: {
        status: 'sent',
        token: approvalToken,
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sentAt: new Date(),
      },
    });

    /* ---------------- Get Saved Auth Form ---------------- */

    const savedAuthForm = await AuthForm.findById(authForm._id).populate('bookingId');

    if (!savedAuthForm) {
      throw new Error('Authorization Form not found after creation.');
    }

    // Tell TypeScript that bookingId has been populated
    const bookingData = savedAuthForm.bookingId as any;

    /* ---------------- Send Email ---------------- */

    await sendAuthorizationEmail({
      to: bookingData.customer.email || '',
      subject: savedAuthForm.email?.subject || 'Booking Authorization Required',
      approvalLink,
      authForm: savedAuthForm,
    });

    /* ---------------- Mail History ---------------- */

    authForm.mailHistory.push({
      to: bookingData.customer.email,
      subject: savedAuthForm.email?.subject || 'Booking Authorization Required',
      status: 'sent',
      provider: 'Nodemailer',
      sentAt: new Date(),
    });

    await authForm.save();

    /* ---------------- Response ---------------- */

    return NextResponse.json(
      {
        success: true,
        message: 'Authorization Form created and email sent successfully.',
        data: authForm,
      },
      { status: 201 }
    );
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

/* ---------------- GET : All Auth Forms ---------------- */

export async function GET() {
  try {
    await connectDB();

    const authForms = await AuthForm.find()
      .populate({
        path: 'bookingId',
        select: 'bookingNo customer',
      })
      .select(
        'bookingId email bookingType serviceType approval createdAt updatedAt'
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: authForms.length,
        data: authForms,
      },
      { status: 200 }
    );
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


