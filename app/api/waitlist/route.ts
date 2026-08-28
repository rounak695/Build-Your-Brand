import { NextResponse } from "next/server";

// Simple in-memory store for demonstration (in production, use DB like Postgres/Redis)
const waitlistEmails: Array<{ email: string; timestamp: string; position: number }> = [];

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if already registered
    const existingIndex = waitlistEmails.findIndex((e) => e.email === normalizedEmail);
    if (existingIndex !== -1) {
      return NextResponse.json({
        success: true,
        message: "You are already registered on the waitlist!",
        position: waitlistEmails[existingIndex].position,
        alreadyRegistered: true,
      });
    }

    const position = 420 + waitlistEmails.length + Math.floor(Math.random() * 5);
    const entry = {
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
      position,
    };

    waitlistEmails.push(entry);

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist!",
      position,
      alreadyRegistered: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
