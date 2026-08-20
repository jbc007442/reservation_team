import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import Holiday from '@/models/attendance/Holiday';

const ALLOWED_TYPES = ['National Holiday', 'Public Holiday', 'Festival'];

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET
 *
 * Get one holiday.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { id } = await params;

    const holiday = await Holiday.findById(id)
      .populate('createdBy', '_id name employeeId')
      .populate('updatedBy', '_id name employeeId')
      .lean();

    if (!holiday) {
      return NextResponse.json(
        {
          success: false,
          message: 'Holiday not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: holiday,
    });
  } catch (error) {
    console.error('Holiday GET by ID API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch holiday.',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT
 *
 * Update holiday.
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await req.json();

    const {
      title,
      date,
      description = '',
      holidayType,
      isOptional = false,
      isRecurring = true,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Holiday title is required.',
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message: 'Holiday date is required.',
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(holidayType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid holiday type.',
        },
        { status: 400 }
      );
    }

    const holidayDate = new Date(date);

    if (Number.isNaN(holidayDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid holiday date.',
        },
        { status: 400 }
      );
    }

    const existingHoliday = await Holiday.findOne({
      _id: {
        $ne: id,
      },
      date: holidayDate,
      status: 'active',
    });

    if (existingHoliday) {
      return NextResponse.json(
        {
          success: false,
          message: 'Another holiday already exists for this date.',
        },
        { status: 409 }
      );
    }

    const holiday = await Holiday.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title.trim(),
          date: holidayDate,
          description: description?.trim() || '',
          holidayType,
          isOptional: Boolean(isOptional),
          isRecurring: Boolean(isRecurring),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!holiday) {
      return NextResponse.json(
        {
          success: false,
          message: 'Holiday not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Holiday updated successfully.',
      data: holiday,
    });
  } catch (error) {
    console.error('Holiday PUT API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update holiday.',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 *
 * Soft delete holiday.
 */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { id } = await params;

    const holiday = await Holiday.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'inactive',
        },
      },
      {
        new: true,
      }
    ).lean();

    if (!holiday) {
      return NextResponse.json(
        {
          success: false,
          message: 'Holiday not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Holiday deleted successfully.',
    });
  } catch (error) {
    console.error('Holiday DELETE API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete holiday.',
      },
      { status: 500 }
    );
  }
}
