import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';

import AuthForm from '@/models/booking/AuthForm';
import Booking from '@/models/booking/Booking';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';

    const status = searchParams.get('status')?.trim() || '';

    /*
    |--------------------------------------------------------------------------
    | Filter
    |--------------------------------------------------------------------------
    */

    const filter: Record<string, unknown> = {};

    /*
    |--------------------------------------------------------------------------
    | Search Filter
    |--------------------------------------------------------------------------
    */

    if (search) {
      filter.$or = [
        {
          bookingReferenceNo: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          merchant: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          bookingType: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          serviceType: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          'passengers.firstName': {
            $regex: search,
            $options: 'i',
          },
        },

        {
          'passengers.lastName': {
            $regex: search,
            $options: 'i',
          },
        },

        {
          'passengers.email': {
            $regex: search,
            $options: 'i',
          },
        },

        {
          'passengers.phone': {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | Booking Status Filter
    |--------------------------------------------------------------------------
    |
    | AuthForm contains bookingId.
    | Status belongs to Booking.
    |
    */

    if (status && status !== 'All') {
      const bookings = await Booking.find({
        status: {
          $regex: `^${status}$`,
          $options: 'i',
        },
      })
        .select('_id')
        .lean();

      const bookingIds: mongoose.Types.ObjectId[] = bookings.map((booking) => booking._id);

      /*
       * No bookings found for this status.
       */

      if (bookingIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
        });
      }

      /*
       * Add Booking IDs to AuthForm filter.
       */

      filter.bookingId = {
        $in: bookingIds,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Auth Forms
    |--------------------------------------------------------------------------
    |
    | Populate Booking to get the actual Booking status.
    |
    */

    const authForms = await AuthForm.find(filter)
      .select(
        `
        bookingId
        bookingReferenceNo
        passengers
        bookingType
        serviceType
        merchant
        charges
        cards
        billing
        createdAt
        updatedAt
      `
      )
      .populate({
        path: 'bookingId',
        select: 'status bookingNo createdBy',
        model: Booking,
        populate: {
          path: 'createdBy',
          select: 'name',
        },
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Format Report
    |--------------------------------------------------------------------------
    */

    const data = authForms.map((authForm: any) => {
      const customer = authForm.passengers?.[0];

      /*
      |--------------------------------------------------------------------------
      | Customer Name
      |--------------------------------------------------------------------------
      */

      const customerName = [customer?.firstName, customer?.middleName, customer?.lastName]
        .filter(Boolean)
        .join(' ');

      /*
      |--------------------------------------------------------------------------
      | Total Amount
      |--------------------------------------------------------------------------
      */

      const totalAmount = (authForm.charges || []).reduce(
        (sum: number, charge: any) => sum + Number(charge.amount || 0),
        0
      );

      /*
      |--------------------------------------------------------------------------
      | Approved Amount
      |--------------------------------------------------------------------------
      */

      const approvedAmount = (authForm.charges || [])
        .filter((charge: any) => charge.paymentStatus === 'Approved')
        .reduce((sum: number, charge: any) => sum + Number(charge.amount || 0), 0);

      /*
      |--------------------------------------------------------------------------
      | Pending Amount
      |--------------------------------------------------------------------------
      */

      const pendingAmount = totalAmount - approvedAmount;

      /*
      |--------------------------------------------------------------------------
      | Booking Status
      |--------------------------------------------------------------------------
      */

      const bookingStatus = authForm.bookingId?.status || 'Pending';

      /*
|--------------------------------------------------------------------------
| Booking Created By
|--------------------------------------------------------------------------
*/
      const createdBy = authForm.bookingId?.createdBy?.name || '--';

      /*
      |--------------------------------------------------------------------------
      | Return Report Record
      |--------------------------------------------------------------------------
      */

      return {
        key: authForm._id.toString(),

        bookingNo: authForm.bookingReferenceNo || '--',

        customerName: customerName || '--',

        service: authForm.bookingType || '--',

        serviceType: authForm.serviceType || '--',

        merchant: authForm.merchant || '--',

        amount: totalAmount,

        approvedAmount,

        pendingAmount,

        paymentStatus: authForm.billing?.paymentStatus || 'pending',

        /*
         * IMPORTANT:
         * This is Booking.status
         */

        status: bookingStatus,

        createdBy,

        createdAt: authForm.createdAt,

        updatedAt: authForm.updatedAt,
      };
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      data,

      total: data.length,
    });
  } catch (error) {
    console.error('Reports API Error:', error);

    return NextResponse.json(
      {
        success: false,

        message: error instanceof Error ? error.message : 'Failed to fetch reports.',
      },
      {
        status: 500,
      }
    );
  }
}
