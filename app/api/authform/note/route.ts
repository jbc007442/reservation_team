import fs from 'fs/promises';
import path from 'path';
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

    const formData = await request.formData();

    const bookingId = formData.get('bookingId') as string;
    const title = (formData.get('title') as string) || '';
    const note = (formData.get('note') as string) || '';
    const type = (formData.get('type') as string) || 'note';
    const visibility = (formData.get('visibility') as string) || 'internal';
    const addedBy = formData.get('addedBy') as string;

    const isPinned = formData.get('isPinned') === 'true';
    const isResolved = formData.get('isResolved') === 'true';

    const file = formData.get('attachment') as File | null;

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

    const attachments: any[] = [];

    if (file) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'authform', 'notes');

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const ext = path.extname(file.name);

      const fileName = `${Date.now()}${ext}`;

      const bytes = await file.arrayBuffer();

      await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

      attachments.push({
        fileName: file.name,
        fileUrl: `/uploads/authform/notes/${fileName}`,
        mimeType: file.type,
        fileSize: file.size,
      });
    }

    authForm.notes.push({
      title,
      note,
      type,
      visibility,
      attachments,
      addedBy,
      isPinned,
      isResolved,
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
