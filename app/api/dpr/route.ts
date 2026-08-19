import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Dpr from '@/models/booking/Dpr';

// GET ALL DPR
export async function GET() {
  try {
    await connectDB();

    const dprs = await Dpr.find().sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: dprs,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch DPRs',
      },
      { status: 500 }
    );
  }
}

// CREATE DPR
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const dpr = await Dpr.create(body);

    return NextResponse.json(
      {
        success: true,
        message: 'DPR created successfully',
        data: dpr,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create DPR',
      },
      { status: 500 }
    );
  }
}
