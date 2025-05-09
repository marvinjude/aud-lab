"use client";

import type { Integration as IntegrationAppIntegration } from "@integration-app/sdk";
import { Button } from "@/components/ui/button";
import { useIntegrationConnection } from "@/hooks/use-integration-connection";
import { useIntegrationApp } from '@integration-app/react';

interface IntegrationListItemProps {
  integration: IntegrationAppIntegration;
  onRefresh: () => void;
}

export function IntegrationListItem({
  integration,
  onRefresh,
}: IntegrationListItemProps) {
  const client = useIntegrationApp();

  const { handleConnect, handleDisconnect, isConnected } = useIntegrationConnection({
    integration,
    onRefresh,
  });


  const configure = async (key: string | undefined) => {
    if (!key) return;
    
    await client
      .connection(key)
      .dataSource('audience')
      .openConfiguration()
  }

  return (
    <li className="group flex items-center space-x-4 p-4 bg-white rounded-lg border">
      <div className="flex-shrink-0">
        {integration.logoUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={integration.logoUri}
            alt={`${integration.name} logo`}
            className="w-10 h-10 rounded-lg"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-medium text-gray-600">
            {integration.name[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-gray-900 truncate">
          {integration.name}
        </h3>
      </div>
      <div className="flex space-x-2">
        <Button onClick={() => configure(integration.connection?.id)}>
          Configure
        </Button>
        <Button
          onClick={() => (isConnected ? handleDisconnect() : handleConnect())}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${isConnected
            ? "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
            : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
            }`}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </li>
  );
}
