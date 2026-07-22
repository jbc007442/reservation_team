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
        bookingReferenceNo: authForm.bookingReferenceNo,
        customer: authForm.passengers?.[0],
        charges: authForm.charges,
        cards: authForm.cards,
        billing: authForm.billing,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB();

    const { bookingId } = await params;
    const body = await req.json();
    console.log(JSON.stringify(body, null, 2));

    const authForm = await AuthForm.findOne({ bookingId });

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form not found.',
        },
        { status: 404 }
      );
    }

    const updatedCards = body.cards || [];

    authForm.cards = authForm.cards.map((card: any, index: number) => {
      const updated = updatedCards.find((item: any) => Number(item.key) === index);

      if (!updated) return card;

      return {
        ...(card.toObject?.() ?? card),

        transactionId: updated.transactionId || '',

        paymentStatus: updated.status,

        paymentDate: updated.status === 'Approved' ? new Date() : null,

        verifiedAt: updated.status === 'Approved' ? new Date() : null,

        // Replace this with logged-in user's _id
        verifiedBy: body.userId || null,
      };
    });

    const total = authForm.cards.reduce(
      (sum: number, card: any) => sum + Number(card.amount || 0),
      0
    );

    const approved = authForm.cards
      .filter((card: any) => card.paymentStatus === 'Approved')
      .reduce((sum: number, card: any) => sum + Number(card.amount || 0), 0);

    authForm.billing.paymentStatus =
      approved === 0 ? 'pending' : approved === total ? 'paid' : 'partial';

    authForm.timeline.push({
      action: 'Payment Verification',
      description: 'Payment verification updated by staff.',
      performedBy: body.userId || undefined,
      source: 'staff',
      createdAt: new Date(),
    });


    await authForm.save();

    const verify = await AuthForm.findOne({ bookingId }).lean();

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully.',
      data: authForm.cards,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}