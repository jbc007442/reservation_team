import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const bookingId = formData.get('bookingId') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file uploaded.',
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    // Delete previous booking image if it exists
    if (bookingId && folder === 'authform/booking-detail') {
      const authForm = await AuthForm.findOne({ bookingId });

      if (authForm?.bookingDetails) {
        const oldImagePath = path.join(
          process.cwd(),
          'public',
          authForm.bookingDetails.replace(/^\/+/, '')
        );

        try {
          await fs.access(oldImagePath);
          await fs.unlink(oldImagePath);

          console.log('Old booking image deleted:', oldImagePath);
        } catch (err) {
          // Ignore if file doesn't exist
          console.log('Old booking image not found.');
        }
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const fileName = `${Date.now()}${ext}`;

    const savePath = path.join(uploadDir, fileName);

    await fs.writeFile(savePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${folder}/${fileName}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Upload failed.',
      },
      { status: 500 }
    );
  }
}