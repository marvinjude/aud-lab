import { NextResponse } from "next/server";
import { AudienceMember } from "@/models/audience-member";
import { APIHandler } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";

async function getAudienceMembers(
  request: Request,
  auth: AuthCustomer,
  requestParams: { params: { id: string } }
) {
  const members = await AudienceMember.find({
    audienceId: requestParams.params.id,
  }).sort({ createdAt: -1 });

  return NextResponse.json(members);
}

export const GET = APIHandler(getAudienceMembers);
