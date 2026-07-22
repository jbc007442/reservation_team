import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const authFormId = searchParams.get('authFormId');

    if (!authFormId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Auth Form ID is required.',
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(authFormId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Auth Form ID.',
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findById(authFormId)
      .select('notes')
      .populate('notes.addedBy', 'name email');

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization Form not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notes fetched successfully.',
        data: authForm.notes || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const { bookingId, title, note, type, visibility, attachments, addedBy, isPinned, isResolved } =
      body;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking ID is required.',
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Booking ID.',
        },
        { status: 400 }
      );
    }

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

    authForm.notes.push({
      title,
      note,
      type,
      visibility,
      attachments: attachments || [],
      addedBy,
      isPinned: isPinned || false,
      isResolved: isResolved || false,
      createdAt: new Date(),
    });

    await authForm.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Note created successfully.',
        data: authForm.notes[authForm.notes.length - 1],
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
