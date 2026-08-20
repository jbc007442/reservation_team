import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Roster from '@/models/attendance/Roster';
import User from '@/models/user/User';

const ALLOWED_ROSTER_STATUSES = ['P', 'WO', 'L', 'H', 'HD', 'A', 'OD', 'WFH'];

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'startDate and endDate are required.',
        },
        { status: 400 }
      );
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const roster = await Roster.find({
      date: {
        $gte: start,
        $lte: end,
      },
      status: 'active',
    })
      .populate({
        path: 'employee',
        match: {
          role: {
            $ne: 'admin',
          },
        },
        select: '_id employeeId name email phone department designation avatar role status',
      })
      .sort({
        date: 1,
      })
      .lean();

    /*
     * Because populate + match returns null for admin employees,
     * remove those records from the response.
     */
    const filteredRoster = roster.filter((record) => record.employee !== null);

    return NextResponse.json({
      success: true,
      count: filteredRoster.length,
      data: filteredRoster,
    });
  } catch (error) {
    console.error('Attendance Roster GET API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch roster.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const { employee, date, rosterStatus } = body;

    /*
     * Required fields
     */
    if (!employee || !date || !rosterStatus) {
      return NextResponse.json(
        {
          success: false,
          message: 'employee, date and rosterStatus are required.',
        },
        { status: 400 }
      );
    }

    /*
     * Validate roster status
     */
    if (!ALLOWED_ROSTER_STATUSES.includes(rosterStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid roster status.',
        },
        { status: 400 }
      );
    }

    /*
     * Make sure employee exists
     * and is NOT an admin.
     */
    const employeeUser = await User.findOne({
      _id: employee,
      role: {
        $ne: 'admin',
      },
    }).select('_id');

    if (!employeeUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid employee or admin users cannot have a roster.',
        },
        { status: 403 }
      );
    }

    /*
     * Convert date to UTC start of day.
     */
    const rosterDate = new Date(`${date}T00:00:00.000Z`);

    /*
     * Create or update roster.
     *
     * One employee + one date = one roster.
     */
    const roster = await Roster.findOneAndUpdate(
      {
        employee,
        date: rosterDate,
      },
      {
        $set: {
          employee,
          date: rosterDate,
          rosterStatus,
          status: 'active',
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .populate({
        path: 'employee',
        select: '_id employeeId name email phone department designation avatar role status',
      })
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Roster updated successfully.',
      data: roster,
    });
  } catch (error) {
    console.error('Attendance Roster PUT API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update roster.',
      },
      { status: 500 }
    );
  }
}
