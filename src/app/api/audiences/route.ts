import { NextResponse } from "next/server";
import { Audience } from "@/models/audience";
import { APIHandler } from "@/lib/api-middleware";
import { seedAudiencesAndMembers } from "@/lib/seed";

export const GET = APIHandler(async function getAudiences(request, auth) {
  const audiences = await Audience.find({}).sort({
    createdAt: -1,
  });

  if (audiences.length > 0) {
    return NextResponse.json(audiences);
  } else {
    // Just for demo purposes
    await seedAudiencesAndMembers(auth.customerId);

    const audiences = await Audience.find({}).sort({
      createdAt: -1,
    });

    return NextResponse.json(audiences);
  }
});

export interface CreateParams {
  query?: Record<string, string>;
  body?: {
    name: string;
    description: string;
  };
  params?: Record<string, string>;
}

export const POST = APIHandler<CreateParams>(async function createAudience(
  request,
  auth,
  requestParams
) {
  const audience = await Audience.create({
    ...requestParams.body,
    userId: auth.customerId,
  });

  return NextResponse.json(audience, { status: 201 });
});
