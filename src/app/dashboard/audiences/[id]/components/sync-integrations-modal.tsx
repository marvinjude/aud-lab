"use client";

import { useState } from "react";
import { useIntegrationApp } from "@integration-app/react";
import { Icons } from "@/components/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import useSWR from "swr";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { useParams } from "next/navigation";

interface AudienceRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAudiencesOptions {
  enabled?: boolean;
}

function useAudiences({ enabled = true }: UseAudiencesOptions = {}) {
  const integrationApp = useIntegrationApp();

  const fetchAudiences = async () => {
    const audiencesResponse = await integrationApp
      .connection("facebook-ads")
      .action("list-custom-audiences")
      .run();

    return audiencesResponse.output.records as AudienceRecord[];
  };

  const {
    data: audiences,
    isLoading,
    error,
    mutate,
  } = useSWR(enabled ? "facebook-audiences" : null, fetchAudiences, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    audiences,
    isLoading,
    error,
    mutate,
  };
}

interface SyncResponse {
  success: boolean;
  error?: string;
}

interface SyncIntegrationsModalProps {
  trigger?: React.ReactNode;
  externalId?: string;
}

export function SyncIntegrationsModal({
  trigger,
  externalId,
}: SyncIntegrationsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>(
    externalId || ""
  );
  const [isChanging, setIsChanging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id: audienceId } = useParams();

  const { audiences, isLoading, error: audiencesError } = useAudiences({
    enabled: isOpen,
  });

  const syncToAudience = async (fbAudienceId: string) => {
    const response = await authenticatedFetcher<SyncResponse>(
      `/api/audiences/${audienceId}/sync`,
      {
        method: "POST",
        body: JSON.stringify({
          fbAudienceId,
        }),
      }
    );

    if (!response.success) {
      throw new Error(response.error);
    }

    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudience) return;

    setError(null);
    try {
      setIsSyncing(true);
      await syncToAudience(selectedAudience);
      setIsOpen(false);
      setIsChanging(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sync audience. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Icons.upload className="h-4 w-4" />
            Sync to Facebook
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="end">
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {externalId && !isChanging ? (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium">Current Audience</div>
                  <div className="text-sm text-muted-foreground font-bold">
                    {isLoading
                      ? "Loading..."
                      : audiences?.find((a) => a.id === externalId)?.name ||
                      externalId}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChanging(true)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="audience">Select Facebook Audience</Label>
                <Select
                  value={selectedAudience}
                  onValueChange={setSelectedAudience}
                  disabled={isLoading || isSyncing}
                >
                  <SelectTrigger id="audience" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoading
                          ? "Loading Facebook audiences..."
                          : "Select a Facebook audience"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {audiencesError ? (
                      <SelectItem value="error" disabled>
                        Error loading Facebook audiences
                      </SelectItem>
                    ) : (
                      audiences?.map((audience) => (
                        <SelectItem key={audience.id} value={audience.id}>
                          {audience.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-500 p-3 text-sm text-white">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!selectedAudience || isLoading || isSyncing}
            >
              {isSyncing ? "Syncing..." : selectedAudience !== externalId ? "Save and Sync Now" : "Sync now"}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
