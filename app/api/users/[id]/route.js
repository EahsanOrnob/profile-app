import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/lib/auth";

export async function GET(request, { params }) {
  await connectDB();

  // Authenticate user
  const authUser = await authenticate(request);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;  
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    // Fetch the user by ID and exclude the password field
    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
