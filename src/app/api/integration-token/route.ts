import { NextRequest, NextResponse } from "next/server";
import { generateCustomerAccessToken } from "@/lib/integration-token";
import { APIHandler } from "@/lib/api-middleware";

export const GET = APIHandler(async function generateToken(
  request: NextRequest,
  auth
) {
  try {
    const token = await generateCustomerAccessToken(auth);
    return NextResponse.json({ token });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
});
