import { connectDB } from '@/lib/mongodb';
import User from '@/models/user/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get Users Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}
