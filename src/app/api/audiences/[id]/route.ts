import { NextResponse } from "next/server";
import { Audience } from "@/models/audience";
import { APIHandler } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";

async function getAudienceById(
  request: Request,
  auth: AuthCustomer,
  requestParams: { params: { id: string } }
) {
  const audience = await Audience.findById(requestParams.params.id);
  
  if (!audience) {
    return NextResponse.json(
      { error: "Audience not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(audience);
}

export const GET = APIHandler(getAudienceById); 