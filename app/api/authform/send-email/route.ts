import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import { transporter } from '@/lib/email/transporter';

import AuthForm from '@/models/booking/AuthForm';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { bookingId, performedBy, to, cc = [], bcc = [], subject, html } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking ID is required.',
        },
        { status: 400 }
      );
    }

    if (!to || !subject || !html) {
      return NextResponse.json(
        {
          success: false,
          message: 'Recipient, subject and message are required.',
        },
        { status: 400 }
      );
    }

    // ✅ Find AuthForm using bookingId
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

    const sentAt = new Date();

    const info = await transporter.sendMail({
      from: `"Reservation Team" <${process.env.SMTP_USER}>`,
      to,
      cc: cc.length ? cc : undefined,
      bcc: bcc.length ? bcc : undefined,
      subject,
      html,
    });

    authForm.email = {
      subject,
      to,
      cc,
      bcc,
      html,
      lastSentAt: sentAt,
      sendCount: (authForm.email?.sendCount || 0) + 1,
    };

    authForm.mailHistory.push({
      to,
      subject,
      html,
      provider: 'Nodemailer',
      messageId: info.messageId,
      status: 'sent',
      sentAt,
      deliveredAt: sentAt,
    });

    authForm.timeline.push({
      action: 'Email Sent',
      description: `Email sent to ${to}`,
      source: 'staff',
      performedBy,
      createdAt: sentAt,
    });

    await authForm.save();

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully.',
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to send email.',
      },
      { status: 500 }
    );
  }
}
