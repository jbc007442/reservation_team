import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/booking/Booking';


export async function GET(request: NextRequest) {
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

    const payload = verifyToken(token);

    if (
      typeof payload === 'string' ||
      !payload ||
      typeof payload !== 'object' ||
      !('id' in payload) ||
      !('role' in payload)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { id: userId, role } = payload as {
      id: string;
      role: 'admin' | 'employee';
    };

    // ============================
    // Customer Lookup
    // ============================

    const { searchParams } = new URL(request.url);

    const mobile = searchParams.get('mobile');
    const email = searchParams.get('email');

    // here add now filter
    const bookingNo = searchParams.get('bookingNo')?.trim();

    if (mobile || email) {
      const lookupFilter =
        role === 'admin'
          ? {
              $or: [
                ...(mobile ? [{ 'customer.mobile': mobile }] : []),
                ...(email ? [{ 'customer.email': email }] : []),
              ],
            }
          : {
              createdBy: userId,
              $or: [
                ...(mobile ? [{ 'customer.mobile': mobile }] : []),
                ...(email ? [{ 'customer.email': email }] : []),
              ],
            };

      const booking = await Booking.findOne(lookupFilter).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
        success: true,
        exists: !!booking,
        customer: booking?.customer ?? null,
        passengerType: booking?.saleType ?? null,
      });
    }

    // ============================
    // Booking List
    // ============================

    // const filter = role === 'admin' ? {} : { createdBy: userId };

    // here 
    let filter: any = {};

    if (role === 'admin') {
      filter = {};
    } else if (bookingNo) {
      // Employee searching by Booking No
      filter = { bookingNo };
    } else {
      // Default: show only own bookings
      filter = { createdBy: userId };
    }

    const bookings = await Booking.find(filter)
      .populate('assignedTo', 'name employeeId')
      .populate('createdBy', 'name employeeId')
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: bookings.length,
      bookingCreated: 0,
      authPending: 0,
      authCompleted: 0,
      ticketed: 0,
      cancelled: 0,
      refunded: 0,
      chargeBack: 0,
      followUp: 0,
      cardCharged: 0,
      cardDecline: 0,
    };

    for (const booking of bookings) {
      switch (booking.status) {
        case 'booking_created':
          stats.bookingCreated++;
          break;

        case 'auth_pending':
          stats.authPending++;
          break;

        case 'auth_completed':
          stats.authCompleted++;
          break;

        case 'ticketed':
          stats.ticketed++;
          break;

        case 'cancelled':
          stats.cancelled++;
          break;

        case 'refunded':
          stats.refunded++;
          break;

        case 'charge_back':
          stats.chargeBack++;
          break;

        case 'follow_up':
          stats.followUp++;
          break;

        case 'card_charged':
          stats.cardCharged++;
          break;

        case 'card_decline':
          stats.cardDecline++;
          break;

        default:
          break;
      }
    }

    return NextResponse.json({
      success: true,
      data: bookings,
      stats,
    });
  } catch (error) {
    console.error('GET /api/booking error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch bookings',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    console.log('BODY:', body);

    const booking = await Booking.create(body);

    console.log('BOOKING:', booking);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create booking',
      },
      { status: 500 }
    );
  }
}
