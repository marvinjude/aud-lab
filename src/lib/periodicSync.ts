import { Audience } from "@/models/audience";
import { syncAudienceMembersToFbAudienceInBatch } from "./sync-utils";
import { generateIntegrationTokenForUser } from "./integration-token";
import type { AuthCustomer } from "./auth";
import { User } from "@/models/user";

export async function periodicSyncForAllUsers() {
  try {
    // Find all audiences that have a Facebook audience ID
    const audiences = await Audience.find({
      fbAudienceId: { $exists: true, $ne: null },
    });

    console.log(`Found ${audiences.length} audiences to sync`);

    for (const audience of audiences) {
      try {
        const user = await User.findOne({ id: audience.userId });

        if (!user) {
          console.error(`User not found for audience ${audience._id}`);
          continue;
        }

        const auth: AuthCustomer = {
          customerId: user.id,
          customerName: user.name,
        };

        // Generate integration token for the user
        const userIntegrationAppToken = await generateIntegrationTokenForUser(
          auth
        );

        // Sync audience members to Facebook
        await syncAudienceMembersToFbAudienceInBatch(
          audience._id.toString(),
          audience.fbAudienceId!,
          userIntegrationAppToken
        );

        // Update last synced timestamp
        await Audience.findByIdAndUpdate(audience._id, {
          lastSyncedAt: new Date(),
        });

        console.log(`Successfully synced audience ${audience._id}`);
      } catch (error) {
        console.error(`Failed to sync audience ${audience._id}:`, error);
        // Continue with next audience even if one fails
        continue;
      }
    }

    return { success: true, syncedAudiences: audiences.length };
  } catch (error) {
    console.error("Error in periodic sync:", error);
    throw error;
  }
}
