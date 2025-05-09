import { NextResponse } from "next/server";
import { Audience } from "@/models/audience";
import { APIHandler } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";
import { seedAudiencesAndMembers } from "@/seed";

async function getAudiences() {
  // seed db
  seedAudiencesAndMembers();

  const audiences = await Audience.find({}).sort({
    createdAt: -1,
  });
  return NextResponse.json(audiences);
}

export const GET = APIHandler(getAudiences);

export interface CreateParams {
  query?: Record<string, string>;
  body?: {
    name: string;
    description: string;
  };
  params?: Record<string, string>;
}

export const POST = APIHandler<CreateParams>(async function createAudience(
  request: Request,
  auth: AuthCustomer,
  requestParams
) {
  const audience = await Audience.create({
    ...requestParams.body,
    userId: auth.customerId,
  });

  return NextResponse.json(audience, { status: 201 });
});
