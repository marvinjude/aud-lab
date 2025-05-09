import { NextResponse } from "next/server";
import { APIHandler } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";
import { Audience } from "@/models/audience";
import { syncAudienceMembersToFbAudienceInBatch } from "@/lib/sync-utils";
import { generateIntegrationTokenForUser } from "@/lib/integration-token";

/////////////////
// Types
/////////////////

interface SyncParams {
  params: {
    id: string;
  };
  body?: {
    fbAudienceId: string;
    fbAdAccountId: string;
  };
}

interface FacebookErrorResponse {
  data?: {
    data?: {
      response?: {
        data?: {
          error?: {
            error_user_msg?: string;
          };
        };
      };
    };
  };
}

////////////////////////
// API Handler
////////////////////////

async function syncAudience(
  request: Request,
  auth: AuthCustomer,
  requestParams: SyncParams
) {
  const { id } = requestParams.params;
  const { fbAudienceId, fbAdAccountId } = requestParams.body || {};

  if (!fbAudienceId) {
    return NextResponse.json(
      { error: "Facebook audience ID is required" },
      { status: 400 }
    );
  }

  if (!fbAdAccountId) {
    return NextResponse.json(
      { error: "Facebook ad account ID is required" },
      { status: 400 }
    );
  }

  const audience = await Audience.findByIdAndUpdate(
    id,
    { fbAdAccountId, fbAudienceId, lastSyncedAt: new Date() },
    { new: true }
  );

  if (!audience) {
    throw new Error("Audience not found");
  }

  const userIntegrationAppToken = await generateIntegrationTokenForUser(auth);

  try {
    await syncAudienceMembersToFbAudienceInBatch(
      id,
      fbAudienceId,
      userIntegrationAppToken
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const fbError = error as FacebookErrorResponse;
    return NextResponse.json(
      {
        error:
          fbError?.data?.data?.response?.data?.error?.error_user_msg ||
          "Sync failed",
      },
      { status: 500 }
    );
  }
}

export const POST = APIHandler<SyncParams>(syncAudience);
