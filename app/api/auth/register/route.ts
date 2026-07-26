import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import User from '@/models/user/User';

function generateEmployeeId(name: string) {
  const prefix = name
    .replace(/[^A-Za-z]/g, '')
    .substring(0, 3)
    .toUpperCase();

  const now = new Date();

  const date =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  const random = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `EMP-${prefix}-${date}-${random}`;
}


export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, password } = await req.json();

    // Validation
    if (!name || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name and password are required.',
        },
        { status: 400 }
      );
    }

    // Check Name
    const existingUser = await User.findOne({
      name: name.trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username already exists.',
        },
        { status: 409 }
      );
    }

    // Generate unique Employee ID
    let employeeId = generateEmployeeId(name);

    while (await User.findOne({ employeeId })) {
      employeeId = generateEmployeeId(name);
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      employeeId,
      name: name.trim(),
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully.',
        user: {
          id: user._id,
          employeeId: user.employeeId,
          name: user.name,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error.',
      },
      { status: 500 }
    );
  }
}
