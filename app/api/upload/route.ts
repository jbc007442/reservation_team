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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const fileName = `${Date.now()}${ext}`;

    const savePath = path.join(uploadDir, fileName);

    await fs.writeFile(savePath, buffer);

    const fileUrl = `/uploads/${folder}/${fileName}`;

    /*
     * Multiple booking images
     *
     * Do NOT delete the previous images here.
     * Add the newly uploaded image to the existing array.
     */
    if (bookingId && folder === 'authform/booking-detail') {
      const authForm = await AuthForm.findOne({ bookingId });

      if (authForm) {
        const existingImages: string[] = Array.isArray(authForm.bookingDetails)
          ? authForm.bookingDetails
          : authForm.bookingDetails
            ? [authForm.bookingDetails]
            : [];

        authForm.bookingDetails = [...existingImages, fileUrl];

        authForm.bookingDetailsType = 'image';

        await authForm.save();

        console.log('Booking image added:', fileUrl);
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Upload Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Upload failed.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { url, bookingId } = await req.json();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: 'File URL is required.',
        },
        { status: 400 }
      );
    }

    console.log('Delete request:', url);

    const filePath = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''));

    console.log('Deleting file:', filePath);

    /*
     * Delete physical file
     */
    try {
      await fs.unlink(filePath);

      console.log('File deleted:', filePath);
    } catch (err) {
      console.log('File already deleted or not found.');
    }

    /*
     * Remove only this image from MongoDB
     */
    if (bookingId) {
      const authForm = await AuthForm.findOne({ bookingId });

      if (authForm) {
        const existingImages: string[] = Array.isArray(authForm.bookingDetails)
          ? authForm.bookingDetails
          : authForm.bookingDetails
            ? [authForm.bookingDetails]
            : [];

        authForm.bookingDetails = existingImages.filter((imageUrl: string) => imageUrl !== url);

        await authForm.save();

        console.log('Booking image removed from MongoDB:', url);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete file.',
      },
      { status: 500 }
    );
  }
}
