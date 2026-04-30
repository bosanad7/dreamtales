import { NextResponse } from "next/server";

// Stories are stored client-side in localStorage.
// This endpoint exists for future server-side persistence (Supabase etc.)
export async function GET() {
  return NextResponse.json({ message: "Stories are stored client-side in localStorage." });
}
