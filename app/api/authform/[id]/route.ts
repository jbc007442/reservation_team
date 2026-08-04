import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';
import Booking from '@/models/booking/Booking';
import mongoose from 'mongoose';

import { sendAuthorizationEmail } from '@/lib/email/sendAuthorizationEmail';

/* ---------------- GET : Single Auth Form ---------------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    verifyToken(token);

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Authorization Form ID.",
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findById(id).populate({
      path: "bookingId",
    });

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization Form not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: authForm,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET AuthForm Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/* ---------------- PATCH : Update Auth Form ---------------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Authorization Form ID.',
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Get existing AuthForm
    const existingAuthForm = await AuthForm.findById(id).populate('bookingId');

    if (!existingAuthForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form not found.',
        },
        { status: 404 }
      );
    }

    // Lock if ALL cards have transaction IDs
    const paymentLocked =
      existingAuthForm.cards.length > 0 &&
      existingAuthForm.cards.every(
        (card: any) => card.transactionId && card.transactionId.trim() !== ''
      );

    if (paymentLocked) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form is locked because all payments have been verified.',
        },
        { status: 403 }
      );
    }

    const authForm = await AuthForm.findByIdAndUpdate(
      id,
      {
        $set: body,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('bookingId');

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form not found.',
        },
        { status: 404 }
      );
    }

    const bookingData = authForm.bookingId as any;

    const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL}/approve?token=${authForm.approval.token}`;

    await sendAuthorizationEmail({
      to: bookingData.customer.email || '',
      subject: authForm.email?.subject || 'Booking Authorization Required',
      approvalLink,
      authForm,
    });

    authForm.mailHistory.push({
      to: bookingData.customer.email,
      subject: authForm.email?.subject || 'Booking Authorization Required',
      status: 'sent',
      provider: 'Nodemailer',
      sentAt: new Date(),
    });

    await authForm.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Authorization Form updated and email sent successfully.',
        data: authForm,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH AuthForm Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE : Delete Auth Form ---------------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    verifyToken(token);

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Authorization Form ID.",
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findByIdAndDelete(id);

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization Form not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Authorization Form deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE AuthForm Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}


