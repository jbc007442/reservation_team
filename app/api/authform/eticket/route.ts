import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { connectDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

import Booking from '@/models/booking/Booking';
import AuthForm from '@/models/booking/AuthForm';

import { sendEticketEmail } from '@/lib/email/sendEticketEmail';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    /* ---------------- Authentication ---------------- */

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

    const user = verifyToken(token) as any;

    /* ---------------- Request Body ---------------- */

    const { bookingId, passengerIndex, ticketNo } = await req.json();

    const eTicketNo = String(ticketNo || '').trim();

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking ID is required.',
        },
        { status: 400 }
      );
    }

    if (passengerIndex === undefined || passengerIndex === null) {
      return NextResponse.json(
        {
          success: false,
          message: 'Passenger Index is required.',
        },
        { status: 400 }
      );
    }

    if (!eTicketNo) {
      return NextResponse.json(
        {
          success: false,
          message: 'E-Ticket Number is required.',
        },
        { status: 400 }
      );
    }

    /* ---------------- Auth Form ---------------- */

    const authForm = await AuthForm.findOne({
      bookingId,
    }).populate('bookingId');

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form not found.',
        },
        { status: 404 }
      );
    }

    const booking = authForm.bookingId as any;

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking not found.',
        },
        { status: 404 }
      );
    }
    /* ---------------- Passenger Validation ---------------- */

    if (passengerIndex < 0 || passengerIndex >= authForm.passengers.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Passenger not found.',
        },
        { status: 404 }
      );
    }

    /* ---------------- Duplicate E-Ticket Check ---------------- */

    const duplicate = authForm.passengers.some(
      (p: any, index: number) =>
        index !== passengerIndex && p.eTicketNo && p.eTicketNo.trim() === eTicketNo
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'This E-Ticket Number already exists for another passenger.',
        },
        { status: 409 }
      );
    }

    /* ---------------- Update Passenger ---------------- */

    const passenger = authForm.passengers[passengerIndex] as any;

    passenger.eTicketNo = eTicketNo;
    passenger.eTicketSentAt = new Date();

    authForm.markModified('passengers');

    /* ---------------- Timeline ---------------- */

    authForm.timeline.push({
      action: 'E-Ticket Generated',
      description: `${passenger.title} ${passenger.firstName} ${passenger.lastName} - ${eTicketNo}`,
      performedBy: user?.id || null,
      source: 'staff',
      createdAt: new Date(),
    });

    /* ---------------- Booking Status ---------------- */

    booking.status = 'ticketed';

    /* ---------------- Save Changes First ---------------- */

    await authForm.save();
    await booking.save();
    /* ---------------- Send E-Ticket Email ---------------- */

    if (booking.customer?.email) {
      const emailHtml = await sendEticketEmail({
        to: booking.customer.email,
        booking,
        authForm,
        passenger,
      });

      /* ---------------- Mail History ---------------- */

      await AuthForm.findByIdAndUpdate(authForm._id, {
        $push: {
          mailHistory: {
            to: booking.customer.email,
            subject: `E-Ticket Confirmation | ${authForm.bookingReferenceNo}`,
            html: emailHtml,
            status: 'sent',
            provider: 'Nodemailer',
            sentAt: new Date(),
          },
        },
        $set: {
          'email.lastSentAt': new Date(),
        },
        $inc: {
          'email.sendCount': 1,
        },
      });
    }
    /* ---------------- Response ---------------- */

    return NextResponse.json(
      {
        success: true,
        message: booking.customer?.email
          ? 'E-Ticket saved and emailed successfully.'
          : 'E-Ticket saved successfully. Customer email not available.',
        data: {
          bookingId,
          passengerIndex,
          passenger,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('E-Ticket API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error.',
      },
      { status: 500 }
    );
  }
}