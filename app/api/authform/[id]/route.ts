import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

import { connectDB } from '@/lib/mongodb';
import AuthForm from '@/models/booking/AuthForm';
import mongoose from 'mongoose';

/* ---------------- GET : Single Auth Form ---------------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    verifyToken(token);

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Authorization Form ID.",
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findById(id).populate({
      path: "bookingId",
    });

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization Form not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: authForm,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET AuthForm Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/* ---------------- PATCH : Update Auth Form ---------------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    verifyToken(token);

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Authorization Form ID.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    // If card information is updated, reset payment verification
    if (body.cards) {
      body.cards = body.cards.map((card: any) => ({
        ...card,
        transactionId: '',
        paymentStatus: 'Pending',
        paymentDate: null,
        verifiedAt: null,
        verifiedBy: null,
      }));

      body.billing = {
        ...(body.billing || {}),
        paymentStatus: 'pending',
      };

      body.timeline = [
        ...(body.timeline || []),
        {
          action: 'Payment Reset',
          description: 'Payment verification was reset because card details were modified.',
          source: 'staff',
          createdAt: new Date(),
        },
      ];
    }

    const authForm = await AuthForm.findByIdAndUpdate(
      id,
      {
        $set: body,
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization Form not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Authorization Form updated successfully.",
        data: authForm,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH AuthForm Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE : Delete Auth Form ---------------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    verifyToken(token);

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Authorization Form ID.",
        },
        { status: 400 }
      );
    }

    const authForm = await AuthForm.findByIdAndDelete(id);

    if (!authForm) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization Form not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Authorization Form deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE AuthForm Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}


