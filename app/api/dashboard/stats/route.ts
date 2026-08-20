import { connectDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import Booking from '@/models/booking/Booking';
import AuthForm from '@/models/booking/AuthForm';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const token =
      req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('token')?.value || '';

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

    if (!payload?.userId || !payload?.role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const userId = payload.userId;
    const role = payload.role;

    /*
    |--------------------------------------------------------------------------
    | Get Bookings
    |--------------------------------------------------------------------------
    */

    const bookings =
      role === 'admin'
        ? await Booking.find({}).select('_id status').lean()
        : await Booking.find({
            createdBy: userId,
          })
            .select('_id status')
            .lean();

    const bookingIdList = bookings.map((booking) => booking._id);

    /*
    |--------------------------------------------------------------------------
    | Booking Status Statistics
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Revenue
    |--------------------------------------------------------------------------
    */

    const revenueResult = await AuthForm.aggregate([
      {
        $match: {
          bookingId: {
            $in: bookingIdList,
          },
        },
      },

      {
        $project: {
          chargesTotal: {
            $sum: {
              $map: {
                input: {
                  $ifNull: ['$charges', []],
                },

                as: 'charge',

                in: {
                  $ifNull: ['$$charge.amount', 0],
                },
              },
            },
          },

          taxesAndFee: {
            $ifNull: ['$taxesAndFee', 0],
          },
        },
      },

      {
        $group: {
          _id: null,

          totalCharges: {
            $sum: '$chargesTotal',
          },

          totalTaxesAndFee: {
            $sum: '$taxesAndFee',
          },
        },
      },
    ]);

    const revenue = revenueResult[0] || {
      totalCharges: 0,
      totalTaxesAndFee: 0,
    };

    const totalCharges = Number(revenue.totalCharges || 0);

    const totalTaxesAndFee = Number(revenue.totalTaxesAndFee || 0);

    const netGross = totalCharges + totalTaxesAndFee;

    const netProfit = totalTaxesAndFee;

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      data: {
        ...stats,

        revenue: {
          totalCharges,

          taxesAndFee: totalTaxesAndFee,

          netGross,

          netProfit,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);

    return NextResponse.json(
      {
        success: false,

        message: error instanceof Error ? error.message : 'Failed to load dashboard statistics.',
      },
      { status: 500 }
    );
  }
}
