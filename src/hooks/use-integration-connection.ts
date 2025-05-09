import { useIntegrationApp } from "@integration-app/react";
import type { Integration as IntegrationAppIntegration } from "@integration-app/sdk";
import { toast } from "sonner";

interface UseIntegrationConnectionProps {
  integration: IntegrationAppIntegration;
  onRefresh: () => void;
}

export function useIntegrationConnection({
  integration,
  onRefresh,
}: UseIntegrationConnectionProps) {
  const integrationApp = useIntegrationApp();

  const handleConnect = async () => {
    console.log("handleConnect", integration.key);
    try {
      const connection = await integrationApp
        .integration(integration.key)
        .openNewConnection();

      if (!connection.id) {
        toast.error("Please select a connection first");
        return;
      }

      onRefresh();
    } catch (error) {
      console.error("Failed to connect:", error);
      toast.error("Failed to connect integration");
    }
  };

  const handleDisconnect = async () => {
    if (!integration.connection?.id) return;
    try {
      await integrationApp.connection(integration.connection.id).archive();
      onRefresh();
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Failed to disconnect integration");
    }
  };

  return {
    handleConnect,
    handleDisconnect,
    isConnected: !!integration.connection,
  };
}
