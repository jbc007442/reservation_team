import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import Holiday from '@/models/attendance/Holiday';

const ALLOWED_TYPES = ['National Holiday', 'Public Holiday', 'Festival'] as const;

type HolidayType = (typeof ALLOWED_TYPES)[number];

/**
 * GET
 *
 * Fetch holidays.
 *
 * Optional query parameters:
 * ?search=
 * ?holidayType=
 * ?status=
 * ?startDate=
 * ?endDate=
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const holidayType = searchParams.get('holidayType')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'active';
    const startDate = searchParams.get('startDate')?.trim() || '';
    const endDate = searchParams.get('endDate')?.trim() || '';

    const filter: Record<string, unknown> = {};

    /*
     * Status
     */
    if (status) {
      filter.status = status;
    }

    /*
     * Holiday type
     */
    if (holidayType) {
      if (!ALLOWED_TYPES.includes(holidayType as HolidayType)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid holiday type.',
          },
          { status: 400 }
        );
      }

      filter.holidayType = holidayType;
    }

    /*
     * Search by title or description
     */
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    /*
     * Date range
     */
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};

      if (startDate) {
        dateFilter.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        dateFilter.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }

      filter.date = dateFilter;
    }

    const holidays = await Holiday.find(filter)
      .populate('createdBy', '_id name employeeId')
      .populate('updatedBy', '_id name employeeId')
      .sort({
        date: 1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      count: holidays.length,
      data: holidays,
    });
  } catch (error) {
    console.error('Holiday GET API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch holidays.',
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 *
 * Create holiday.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      title,
      date,
      description = '',
      holidayType = 'Public Holiday',
      isOptional = false,
      isRecurring = true,
    } = body;

    /*
     * Required fields
     */
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

    /*
     * Validate holiday type
     */
    if (!ALLOWED_TYPES.includes(holidayType as HolidayType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid holiday type.',
        },
        { status: 400 }
      );
    }

    /*
     * Validate date
     */
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

    /*
     * Prevent duplicate holiday
     */
    const existingHoliday = await Holiday.findOne({
      date: holidayDate,
      status: 'active',
    });

    if (existingHoliday) {
      return NextResponse.json(
        {
          success: false,
          message: 'A holiday already exists for this date.',
        },
        { status: 409 }
      );
    }

    const holiday = await Holiday.create({
      title: title.trim(),
      date: holidayDate,
      description: description?.trim() || '',
      holidayType,
      isOptional: Boolean(isOptional),
      isRecurring: Boolean(isRecurring),
      status: 'active',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Holiday created successfully.',
        data: holiday,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error('Holiday POST API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create holiday.',
      },
      {
        status: 500,
      }
    );
  }
}
