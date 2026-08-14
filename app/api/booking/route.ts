import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/booking/Booking';
import Counter from '@/models/booking/Counter';

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
    const search = searchParams.get('search')?.trim();

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
    let filter: any;

    // Employee/Admin searching by Name or Email
    if (search) {
      filter = {
        $or: [
          {
            'customer.name': {
              $regex: search,
              $options: 'i',
            },
          },
          {
            'customer.email': {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      };
    } else {
      // Default listing
      filter = role === 'admin' ? {} : { createdBy: userId };
    }

    const bookings = await Booking.find(filter)
      .populate('assignedTo', 'name employeeId')
      .populate('createdBy', 'name employeeId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: bookings,
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
    const counter = await Counter.findOneAndUpdate(
      { name: 'booking' },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
      }
    );

    const bookingNo = `BK-${String(counter.seq).padStart(4, '0')}`;

    const booking = await Booking.create({
      ...body,
      bookingNo,
    });
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
