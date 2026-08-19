import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Dpr from '@/models/booking/Dpr';

// GET SINGLE DPR
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    const dpr = await Dpr.findById(id);

    if (!dpr) {
      return NextResponse.json(
        {
          success: false,
          message: 'DPR not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dpr,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch DPR',
      },
      { status: 500 }
    );
  }
}

// UPDATE DPR
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const dpr = await Dpr.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!dpr) {
      return NextResponse.json(
        {
          success: false,
          message: 'DPR not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'DPR updated successfully',
      data: dpr,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update DPR',
      },
      { status: 500 }
    );
  }
}

// DELETE DPR
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    const dpr = await Dpr.findByIdAndDelete(id);

    if (!dpr) {
      return NextResponse.json(
        {
          success: false,
          message: 'DPR not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'DPR deleted successfully',
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete DPR',
      },
      { status: 500 }
    );
  }
}
