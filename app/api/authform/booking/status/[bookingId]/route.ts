import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/booking/Booking';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB();

    const { bookingId } = await params;

    const { status } = await req.json();

    const allowedStatuses = ['cancelled', 'refunded', 'charge_back', 'card_decline'];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid booking status.',
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking not found.',
        },
        { status: 404 }
      );
    }

    booking.status = status;
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully.',
      data: booking,
    });
  } catch (error) {
    console.error('PATCH /api/booking/status error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update booking status.',
      },
      { status: 500 }
    );
  }
}
