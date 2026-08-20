import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Booking from '@/models/booking/Booking';
import Counter from '@/models/booking/Counter';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    const userId = payload.userId;

    const role = payload.role;

    if (!userId || !role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Query Parameters
    |--------------------------------------------------------------------------
    */

    const { searchParams } = new URL(request.url);

    const mobile = searchParams.get('mobile')?.trim();

    const email = searchParams.get('email')?.trim();

    const search = searchParams.get('search')?.trim();

    /*
    |--------------------------------------------------------------------------
    | Customer Lookup
    |--------------------------------------------------------------------------
    */

    if (mobile || email) {
      const customerConditions = [
        ...(mobile ? [{ 'customer.mobile': mobile }] : []),

        ...(email ? [{ 'customer.email': email }] : []),
      ];

      const lookupFilter =
        role === 'admin'
          ? {
              $or: customerConditions,
            }
          : {
              createdBy: userId,

              $or: customerConditions,
            };

      const booking = await Booking.findOne(lookupFilter)
        .sort({
          createdAt: -1,
        })
        .lean();

      return NextResponse.json({
        success: true,

        exists: !!booking,

        customer: booking?.customer ?? null,

        passengerType: booking?.saleType ?? null,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Booking List
    |--------------------------------------------------------------------------
    */

    const filter: Record<string, unknown> =
      role === 'admin'
        ? {}
        : {
            createdBy: userId,
          };

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    |
    | Admin:
    |   Search all bookings.
    |
    | Employee:
    |   Search only their own bookings.
    |
    */

    if (search) {
      const searchConditions = [
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

        {
          bookingNo: {
            $regex: search,
            $options: 'i',
          },
        },
      ];

      if (role === 'admin') {
        filter.$or = searchConditions;
      } else {
        filter.$and = [
          {
            createdBy: userId,
          },
          {
            $or: searchConditions,
          },
        ];

        delete filter.createdBy;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Bookings
    |--------------------------------------------------------------------------
    */

    const bookings = await Booking.find(filter)
      .populate('assignedTo', 'name employeeId')
      .populate('createdBy', 'name employeeId')
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,

      count: bookings.length,

      data: bookings,
    });
  } catch (error) {
    console.error('GET /api/booking error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch bookings.',
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Create Booking
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    const userId = payload.userId;

    const role = payload.role;

    if (!userId || !role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Request Body
    |--------------------------------------------------------------------------
    */

    const body = await request.json();

    /*
    |--------------------------------------------------------------------------
    | Booking Number
    |--------------------------------------------------------------------------
    */

    const counter = await Counter.findOneAndUpdate(
      {
        name: 'booking',
      },
      {
        $inc: {
          seq: 1,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const bookingNo = `BK-${String(counter.seq).padStart(4, '0')}`;

    /*
    |--------------------------------------------------------------------------
    | Create Booking
    |--------------------------------------------------------------------------
    */

    const booking = await Booking.create({
      ...body,

      bookingNo,

      createdBy: userId,
    });

    return NextResponse.json(
      {
        success: true,

        message: 'Booking created successfully.',

        data: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/booking error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create booking.',
      },
      { status: 500 }
    );
  }
}
