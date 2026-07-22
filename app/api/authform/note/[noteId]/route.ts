import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';

interface Params {
  params: Promise<{
    noteId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { noteId } = await params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Note ID.',
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findOne({
      'notes._id': noteId,
    }).populate('notes.addedBy', 'name email');

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Note not found.',
        },
        { status: 404 }
      );
    }

    const note = (authForm.notes as any).id(noteId);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: 'Note not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Note fetched successfully.',
        data: note,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { noteId } = await params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Note ID.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const authForm = await AuthForm.findOne({
      'notes._id': noteId,
    });

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Note not found.',
        },
        { status: 404 }
      );
    }

    const note: any = (authForm.notes as any).id(noteId);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: 'Note not found.',
        },
        { status: 404 }
      );
    }

    note.title = body.title ?? note.title;
    note.note = body.note ?? note.note;
    note.type = body.type ?? note.type;
    note.visibility = body.visibility ?? note.visibility;
    note.isPinned = body.isPinned ?? note.isPinned;
    note.isResolved = body.isResolved ?? note.isResolved;
    note.attachments = body.attachments ?? note.attachments;
    note.updatedAt = new Date();

    await authForm.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Note updated successfully.',
        data: note,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { noteId } = await params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Note ID.',
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findOne({
      'notes._id': noteId,
    });

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: 'Note not found.',
        },
        { status: 404 }
      );
    }

    const note: any = (authForm.notes as any).id(noteId);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: 'Note not found.',
        },
        { status: 404 }
      );
    }

    note.deleteOne();

    await authForm.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Note deleted successfully.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
