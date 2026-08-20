import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';

import Leave from '@/models/attendance/Leave';
import User from '@/models/user/User';

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const VALID_LEAVE_TYPES = ['CL', 'SL', 'PL', 'LOP'] as const;

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'] as const;

type LeaveType = (typeof VALID_LEAVE_TYPES)[number];

type LeaveStatus = (typeof VALID_STATUSES)[number];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function isValidLeaveType(value: string): value is LeaveType {
  return VALID_LEAVE_TYPES.includes(value as LeaveType);
}

function isValidStatus(value: string): value is LeaveStatus {
  return VALID_STATUSES.includes(value as LeaveStatus);
}

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Unauthorized.');
  }

  const payload = verifyToken(token);

  const user = await User.findById(payload.userId)
    .select('_id employeeId name email role status')
    .lean();

  if (!user) {
    throw new Error('User not found.');
  }

  if (user.status !== 'active') {
    throw new Error('User account is inactive.');
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| ADMIN:
|   Gets all employee leaves
|
| EMPLOYEE:
|   Gets only own leaves
|
| Supports:
|
| ?search=tarun
| ?status=Pending
| ?leaveType=CL
| ?page=1
| ?limit=10
|--------------------------------------------------------------------------
*/

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';

    const status = searchParams.get('status') || '';

    const leaveType = searchParams.get('leaveType') || '';

    const pageParam = Number(searchParams.get('page') || 1);

    const limitParam = Number(searchParams.get('limit') || 10);

    const page = Math.max(pageParam, 1);

    const limit = Math.min(Math.max(limitParam, 1), 100);

    const skip = (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | Validate status
    |--------------------------------------------------------------------------
    */

    if (status && status !== 'All' && !isValidStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid leave status.',
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate leave type
    |--------------------------------------------------------------------------
    */

    if (leaveType && leaveType !== 'All' && !isValidLeaveType(leaveType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid leave type.',
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Base filter
    |--------------------------------------------------------------------------
    */

    const filter: Record<string, unknown> = {};

    /*
    |--------------------------------------------------------------------------
    | EMPLOYEE
    |--------------------------------------------------------------------------
    |
    | Employee can ONLY see their own leaves.
    |
    */

    if (user.role !== 'admin') {
      filter.employee = user._id;
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN SEARCH
    |--------------------------------------------------------------------------
    |
    | Search employee name / employee ID / email.
    |
    */

    if (user.role === 'admin' && search) {
      const employees = await User.find({
        role: {
          $ne: 'admin',
        },

        $or: [
          {
            name: {
              $regex: search,
              $options: 'i',
            },
          },

          {
            employeeId: {
              $regex: search,
              $options: 'i',
            },
          },

          {
            email: {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      })
        .select('_id')
        .lean();

      const employeeIds = employees.map((employee) => employee._id);

      /*
       * No employee matched
       */

      if (employeeIds.length === 0) {
        return NextResponse.json({
          success: true,
          count: 0,
          total: 0,
          page,
          limit,
          totalPages: 0,
          data: [],
        });
      }

      filter.employee = {
        $in: employeeIds,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    if (status && status !== 'All') {
      filter.status = status;
    }

    /*
    |--------------------------------------------------------------------------
    | Leave Type
    |--------------------------------------------------------------------------
    */

    if (leaveType && leaveType !== 'All') {
      filter.leaveType = leaveType;
    }

    /*
    |--------------------------------------------------------------------------
    | Count
    |--------------------------------------------------------------------------
    */

    const total = await Leave.countDocuments(filter);

    /*
    |--------------------------------------------------------------------------
    | Fetch
    |--------------------------------------------------------------------------
    */

    const leaves = await Leave.find(filter)
      .populate({
        path: 'employee',
        select: '_id employeeId name email phone department designation avatar role status',
      })
      .populate({
        path: 'approvedBy',
        select: '_id name email employeeId',
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      count: leaves.length,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),

      data: leaves,
    });
  } catch (error) {
    console.error('Leave GET API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave requests.';

    const statusCode =
      errorMessage === 'Unauthorized.' || errorMessage === 'User not found.'
        ? 401
        : errorMessage === 'User account is inactive.'
          ? 403
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
|
| EMPLOYEE ONLY
|
| Apply for leave
|--------------------------------------------------------------------------
*/

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    /*
     * Admin cannot apply leave for himself
     * through this employee endpoint.
     */

    if (user.role === 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin cannot apply leave through this endpoint.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { leaveType, fromDate, toDate, reason, attachment = '' } = body;

    /*
     * Leave type
     */

    if (!leaveType || !isValidLeaveType(leaveType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid leave type.',
        },
        { status: 400 }
      );
    }

    /*
     * Dates
     */

    if (!fromDate || !toDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'From date and to date are required.',
        },
        { status: 400 }
      );
    }

    const start = dayjs(fromDate).startOf('day');

    const end = dayjs(toDate).startOf('day');

    if (!start.isValid() || !end.isValid()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid leave dates.',
        },
        { status: 400 }
      );
    }

    if (end.isBefore(start)) {
      return NextResponse.json(
        {
          success: false,
          message: 'To date cannot be before from date.',
        },
        { status: 400 }
      );
    }

    /*
     * Reason
     */

    if (!reason?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Reason is required.',
        },
        { status: 400 }
      );
    }

    /*
     * Calculate days
     */

    const totalDays = end.diff(start, 'day') + 1;

    /*
     * Check overlapping leave
     */

    const overlappingLeave = await Leave.findOne({
      employee: user._id,

      status: {
        $in: ['Pending', 'Approved'],
      },

      fromDate: {
        $lte: end.toDate(),
      },

      toDate: {
        $gte: start.toDate(),
      },
    }).lean();

    if (overlappingLeave) {
      return NextResponse.json(
        {
          success: false,
          message: 'You already have a leave request for these dates.',
        },
        { status: 409 }
      );
    }

    /*
     * Create
     */

    const leave = await Leave.create({
      employee: user._id,

      leaveType,

      fromDate: start.toDate(),

      toDate: end.toDate(),

      totalDays,

      reason: reason.trim(),

      status: 'Pending',

      attachment,

      createdBy: user._id,

      updatedBy: user._id,
    });

    /*
     * Populate
     */

    const createdLeave = await Leave.findById(leave._id)
      .populate({
        path: 'approvedBy',
        select: '_id name email employeeId',
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: 'Leave request submitted successfully.',
        data: createdLeave,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Leave POST API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit leave request.',
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
|
| ADMIN:
|   Approve / Reject / Cancel
|
| EMPLOYEE:
|   Edit own Pending leave
|--------------------------------------------------------------------------
*/

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    const body = await req.json();

    const {
      leaveId,
      leaveType,
      fromDate,
      toDate,
      reason,
      attachment,
      status,
      rejectionReason = '',
      remarks = '',
    } = body;

    /*
    |--------------------------------------------------------------------------
    | Common validation
    |--------------------------------------------------------------------------
    */

    if (!leaveId) {
      return NextResponse.json(
        {
          success: false,
          message: 'leaveId is required.',
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Leave
    |--------------------------------------------------------------------------
    */

    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return NextResponse.json(
        {
          success: false,
          message: 'Leave request not found.',
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    if (user.role === 'admin') {
      /*
       * Admin must provide status
       */

      if (!status || !isValidStatus(status)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Valid leave status is required.',
          },
          { status: 400 }
        );
      }

      /*
       * Admin cannot set Pending
       */

      if (status === 'Pending') {
        return NextResponse.json(
          {
            success: false,
            message: 'Admin cannot change leave status to Pending.',
          },
          { status: 400 }
        );
      }

      /*
       * Cancelled cannot be modified
       */

      if (leave.status === 'Cancelled') {
        return NextResponse.json(
          {
            success: false,
            message: 'Cancelled leave cannot be modified.',
          },
          { status: 400 }
        );
      }

      /*
       * Rejection reason
       */

      if (status === 'Rejected' && !rejectionReason.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: 'Rejection reason is required.',
          },
          { status: 400 }
        );
      }

      /*
       * Update
       */

      leave.status = status;

      leave.updatedBy = user._id;

      leave.remarks = typeof remarks === 'string' ? remarks.trim() : '';

      /*
       * Approved
       */

      if (status === 'Approved') {
        leave.approvedBy = user._id;

        leave.approvedAt = new Date();

        leave.rejectionReason = '';
      }

      /*
       * Rejected
       */

      if (status === 'Rejected') {
        leave.approvedBy = null;

        leave.approvedAt = null;

        leave.rejectionReason = rejectionReason.trim();
      }

      /*
       * Cancelled
       */

      if (status === 'Cancelled') {
        leave.approvedBy = null;

        leave.approvedAt = null;
      }

      await leave.save();

      const updatedLeave = await Leave.findById(leave._id)
        .populate({
          path: 'employee',
          select: '_id employeeId name email phone department designation avatar role status',
        })
        .populate({
          path: 'approvedBy',
          select: '_id name email employeeId',
        })
        .lean();

      return NextResponse.json({
        success: true,
        message: `Leave ${status.toLowerCase()} successfully.`,
        data: updatedLeave,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EMPLOYEE
    |--------------------------------------------------------------------------
    */

    /*
     * Employee can ONLY edit own leave
     */

    if (leave.employee.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: 'You cannot modify this leave request.',
        },
        { status: 403 }
      );
    }

    /*
     * Only Pending leave can be edited
     */

    if (leave.status !== 'Pending') {
      return NextResponse.json(
        {
          success: false,
          message: 'Only pending leave requests can be edited.',
        },
        { status: 400 }
      );
    }

    /*
     * Validate leave type
     */

    if (!leaveType || !isValidLeaveType(leaveType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid leave type.',
        },
        { status: 400 }
      );
    }

    /*
     * Validate dates
     */

    if (!fromDate || !toDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'From date and to date are required.',
        },
        { status: 400 }
      );
    }

    const start = dayjs(fromDate).startOf('day');

    const end = dayjs(toDate).startOf('day');

    if (!start.isValid() || !end.isValid()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid leave dates.',
        },
        { status: 400 }
      );
    }

    if (end.isBefore(start)) {
      return NextResponse.json(
        {
          success: false,
          message: 'To date cannot be before from date.',
        },
        { status: 400 }
      );
    }

    /*
     * Check overlapping leave
     */

    const overlappingLeave = await Leave.findOne({
      _id: {
        $ne: leave._id,
      },

      employee: user._id,

      status: {
        $in: ['Pending', 'Approved'],
      },

      fromDate: {
        $lte: end.toDate(),
      },

      toDate: {
        $gte: start.toDate(),
      },
    }).lean();

    if (overlappingLeave) {
      return NextResponse.json(
        {
          success: false,
          message: 'You already have a leave request for these dates.',
        },
        { status: 409 }
      );
    }

    /*
     * Update employee leave
     */

    leave.leaveType = leaveType;

    leave.fromDate = start.toDate();

    leave.toDate = end.toDate();

    leave.totalDays = end.diff(start, 'day') + 1;

    if (reason?.trim()) {
      leave.reason = reason.trim();
    }

    if (attachment !== undefined) {
      leave.attachment = attachment;
    }

    leave.updatedBy = user._id;

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'approvedBy',
        select: '_id name email employeeId',
      })
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Leave request updated successfully.',
      data: updatedLeave,
    });
  } catch (error) {
    console.error('Leave PUT API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update leave request.',
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
|
| EMPLOYEE:
|   Cancel own pending leave
|
| ADMIN:
|   Cancel any leave
|--------------------------------------------------------------------------
*/

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(req.url);

    const leaveId = searchParams.get('leaveId');

    if (!leaveId) {
      return NextResponse.json(
        {
          success: false,
          message: 'leaveId is required.',
        },
        { status: 400 }
      );
    }

    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return NextResponse.json(
        {
          success: false,
          message: 'Leave request not found.',
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    if (user.role === 'admin') {
      if (leave.status === 'Cancelled') {
        return NextResponse.json(
          {
            success: false,
            message: 'Leave is already cancelled.',
          },
          { status: 400 }
        );
      }

      leave.status = 'Cancelled';

      leave.approvedBy = null;

      leave.approvedAt = null;

      leave.updatedBy = user._id;

      await leave.save();

      return NextResponse.json({
        success: true,
        message: 'Leave cancelled successfully.',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EMPLOYEE
    |--------------------------------------------------------------------------
    */

    if (leave.employee.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: 'You cannot cancel this leave request.',
        },
        { status: 403 }
      );
    }

    if (leave.status !== 'Pending') {
      return NextResponse.json(
        {
          success: false,
          message: 'Only pending leave requests can be cancelled.',
        },
        { status: 400 }
      );
    }

    leave.status = 'Cancelled';

    leave.updatedBy = user._id;

    await leave.save();

    return NextResponse.json({
      success: true,
      message: 'Leave request cancelled successfully.',
    });
  } catch (error) {
    console.error('Leave DELETE API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel leave request.',
      },
      { status: 500 }
    );
  }
}
