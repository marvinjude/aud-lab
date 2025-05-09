import { AudienceMember } from "@/models/audience-member";
import crypto from "crypto";
import { IntegrationAppClient } from "@integration-app/sdk";

function simpleRandomUint64() {
  return BigInt.asUintN(
    64,
    BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
  );
}

function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  return crypto
    .createHash("sha256")
    .update(data.toLowerCase().trim())
    .digest("hex");
}

export async function syncAudienceMembersToFbAudienceInBatch(
  audienceId: string,
  fbAudienceId: string,
  userIntegrationAppToken: string
) {
  const integrationApp = new IntegrationAppClient({
    token: userIntegrationAppToken,
  });

  const sessionId = simpleRandomUint64();
  const BATCH_SIZE = 100;
  let batchNumber = 1;
  let hasMoreMembers = true;

  while (hasMoreMembers) {
    const audienceMembers = await AudienceMember.find({
      audienceId: audienceId,
    })
      .skip((batchNumber - 1) * BATCH_SIZE)
      .limit(BATCH_SIZE);

    if (audienceMembers.length === 0) {
      hasMoreMembers = false;
      continue;
    }

    const audienceMembersData = audienceMembers.map(
      (member) =>
        [
          hashData(member.firstName),
          hashData(member.lastName),
          hashData(member.email),
        ] as [string | undefined, string | undefined, string | undefined]
    );

    const isLastBatch = audienceMembers.length < BATCH_SIZE;

    const payload = {
      audienceId: fbAudienceId,
      data: audienceMembersData,
      session: {
        id: sessionId.toString(),
        batchSeq: batchNumber,
        lastBatchFlag: isLastBatch,
      },
    };

    await integrationApp
      .connection("facebook-ads")
      .action("replace-user-in-audience")
      .run(payload);

    batchNumber++;
  }

  return { success: true };
}
