import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { authenticate } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  await connectDB();
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await User.find().select('-password');
  return NextResponse.json(users);
}

export async function POST(request) {
    await connectDB();
    const { name, email, password } = await request.json();
  
    try {
      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(password, 10); // The '10' is the salt rounds (higher is more secure)
  
      // Create a new user with the hashed password
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });
  
      // Save the user to the database
      await user.save();
  
      // Return user data (excluding the password)
      return NextResponse.json({
        _id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }