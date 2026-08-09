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
      return NextResponse.json({
        success: true,
        data: null,
      });
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

    const chargeIndex = Number(body.chargeIndex);

    if (Number.isNaN(chargeIndex) || chargeIndex < 0 || chargeIndex >= authForm.charges.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid charge index.',
        },
        { status: 400 }
      );
    }

    const transactionId = body.transactionId?.trim() || '';

    // --------------------------------
    // Validate duplicate Transaction ID
    // --------------------------------

    if (transactionId) {
      const duplicateTransaction = authForm.charges.some(
        (charge: any, index: number) =>
          index !== chargeIndex &&
          charge.transactionId?.trim().toLowerCase() === transactionId.toLowerCase()
      );

      if (duplicateTransaction) {
        return NextResponse.json(
          {
            success: false,
            message: 'Transaction ID already exists for another charge.',
          },
          { status: 409 }
        );
      }
    }

    // --------------------------------
    // Update Charge
    // --------------------------------

    const charge: any = authForm.charges[chargeIndex];
    charge.transactionId = transactionId;
    charge.paymentStatus = transactionId ? 'Approved' : 'Pending';
    charge.paymentDate = transactionId ? new Date() : null;
    charge.verifiedAt = transactionId ? new Date() : null;
    charge.verifiedBy = transactionId ? body.userId || null : null;
    authForm.markModified('charges');

    // --------------------------------
    // Calculate totals
    // --------------------------------

    const total = authForm.charges.reduce(
      (sum: number, charge: any) => sum + Number(charge.amount || 0),
      0
    );

    const approved = authForm.charges
      .filter((charge: any) => charge.paymentStatus === 'Approved')
      .reduce((sum: number, charge: any) => sum + Number(charge.amount || 0), 0);

    // --------------------------------
    // Billing Status
    // --------------------------------

    authForm.billing.paymentStatus = approved === 0 ? 'pending' : approved === total ? 'paid' : 'partial';

    // --------------------------------
    // Timeline
    // --------------------------------

    authForm.timeline.push({
      action: 'Payment Verification',
      description: transactionId
        ? `${charge.description} verified (${transactionId})`
        : `${charge.description} payment reset to pending`,
      performedBy: body.userId || undefined,
      source: 'staff',
      createdAt: new Date(),
    });

    await authForm.save();

    return NextResponse.json({
      success: true,
      message: transactionId ? 'Payment updated successfully.' : 'Payment reset successfully.',
      data: authForm.charges,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Something went wrong.',
      },
      { status: 500 }
    );
  }
}
