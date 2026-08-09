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

    const { bookingId, tickets } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking ID is required.',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No E-Ticket data provided.',
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

    /* ---------------- Update All Passengers ---------------- */

    const usedTicketNumbers = new Set<string>();

    for (const item of tickets) {
      const passengerIndex = Number(item.passengerIndex);
      const eTicketNo = String(item.ticketNo || '').trim();

      if (passengerIndex < 0 || passengerIndex >= authForm.passengers.length) {
        return NextResponse.json(
          {
            success: false,
            message: `Passenger ${passengerIndex + 1} not found.`,
          },
          { status: 404 }
        );
      }

      if (!eTicketNo) {
        return NextResponse.json(
          {
            success: false,
            message: `E-Ticket Number is required for passenger ${passengerIndex + 1}.`,
          },
          { status: 400 }
        );
      }

      if (usedTicketNumbers.has(eTicketNo)) {
        return NextResponse.json(
          {
            success: false,
            message: `Duplicate E-Ticket Number: ${eTicketNo}`,
          },
          { status: 409 }
        );
      }

      usedTicketNumbers.add(eTicketNo);

      const passenger: any = authForm.passengers[passengerIndex];

      passenger.eTicketNo = eTicketNo;
      passenger.eTicketSentAt = new Date();
    }

    authForm.markModified('passengers');

    /* ---------------- Timeline ---------------- */

    authForm.timeline.push({
      action: 'E-Tickets Generated',
      description: `${tickets.length} passenger(s) ticketed successfully.`,
      performedBy: user?.id || null,
      source: 'staff',
      createdAt: new Date(),
    });

    /* ---------------- Booking Status ---------------- */

    booking.status = 'ticketed';

    /* ---------------- Save ---------------- */

    await authForm.save();
    await booking.save();

    /* ---------------- Send Email ---------------- */

    if (booking.customer?.email) {
      const emailHtml = await sendEticketEmail({
        to: booking.customer.email,
        booking,
        authForm,
      });

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
          ? 'E-Tickets saved and emailed successfully.'
          : 'E-Tickets saved successfully. Customer email not available.',
        data: {
          bookingId,
          passengers: authForm.passengers,
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
