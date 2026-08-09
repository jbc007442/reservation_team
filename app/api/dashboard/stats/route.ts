import { connectDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/jwt';
import Booking from '@/models/booking/Booking';
import AuthForm from '@/models/booking/AuthForm';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token =
      req.headers.get('authorization')?.split(' ')[1] || req.cookies.get('token')?.value || '';

    const user = verifyToken(token);

    if (!user || typeof user === 'string' || !(user as any).role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const payload = user as any;

    // --------------------------------
    // Get bookings according to role
    // --------------------------------

    let bookingIds;

    if (payload.role === 'admin') {
      bookingIds = await Booking.find({}).select('_id').lean();
    } else {
      bookingIds = await Booking.find({
        createdBy: payload._id,
      })
        .select('_id')
        .lean();
    }

    const bookingIdList = bookingIds.map((booking) => booking._id);

    // --------------------------------
    // Total Bookings
    // --------------------------------

    const totalBookings = bookingIdList.length;

    // --------------------------------
    // Revenue
    // --------------------------------

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

    // --------------------------------
    // Revenue calculations
    // --------------------------------

    const totalCharges = Number(revenue.totalCharges || 0);

    const totalTaxesAndFee = Number(revenue.totalTaxesAndFee || 0);

    // Gross = Charges + Taxes & Fee
    const netGross = totalCharges + totalTaxesAndFee;

    // Profit = Taxes & Fee
    const netProfit = totalTaxesAndFee;

    // --------------------------------
    // Response
    // --------------------------------

    return NextResponse.json({
      success: true,

      data: {
        totalBookings,

        revenue: {
          totalCharges,
          taxesAndFee: totalTaxesAndFee,
          netGross,
          netProfit,
        },
      },
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to load dashboard statistics.',
      },
      { status: 500 }
    );
  }
}
