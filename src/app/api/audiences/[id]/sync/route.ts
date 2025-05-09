import { NextResponse } from "next/server";
import { APIHandler } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";
import { Audience } from "@/models/audience";
import { getIntegrationClient } from "@/lib/integration-app-client";
import { AudienceMember } from "@/models/audience-member";

interface SyncParams {
  params: {
    id: string;
  };
  body?: {
    fbAudienceId: string;
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

function simpleRandomUint64() {
  return BigInt.asUintN(
    64,
    BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
  );
}

async function syncAudience(
  request: Request,
  auth: AuthCustomer,
  requestParams: SyncParams
) {
  const { id } = requestParams.params;
  const { fbAudienceId } = requestParams.body || {};
  const integrationApp = await getIntegrationClient(auth);

  if (!fbAudienceId) {
    return NextResponse.json(
      { error: "Facebook audience ID is required" },
      { status: 400 }
    );
  }

  const audience = await Audience.findByIdAndUpdate(
    id,
    { externalId: fbAudienceId },
    { new: true }
  );

  if (!audience) {
    return NextResponse.json({ error: "Audience not found" }, { status: 404 });
  }

  const sessionId = simpleRandomUint64();

  const audienceMembers = await AudienceMember.find({
    audienceId: id,
  });

  const audienceMembersData = audienceMembers.map((member) => [
    member.firstName,
    member.lastName,
    member.email,
  ]);

  /**
   * See API docs on what session means: https://developers.facebook.com/docs/marketing-api/audiences/guides/custom-audiences/#payload-fields
   * You'll need to keep track of the session ID yourself if you're doing this in batches.
   */

  const payload = {
    audienceId: fbAudienceId,
    data: audienceMembersData,
    session: {
      id: sessionId.toString(), // Unique identifier for the session
      batchSeq: 1, // Sequence number of the batch
      lastBatchFlag: true, // Indicates if this is the last batch of data
    },
  };

  try {
    await integrationApp
      .connection("facebook-ads")
      .action("replace-user-in-audience")
      .run(payload);

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
