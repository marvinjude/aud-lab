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
import { useAdAccounts } from "../hooks/useAdAccounts";

interface AudienceRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAudiencesOptions {
  enabled?: boolean;
  fbAdAccountId?: string;
}

function useAudiences({
  enabled = true,
  fbAdAccountId,
}: UseAudiencesOptions = {}) {
  const integrationApp = useIntegrationApp();

  const fetchAudiences = async () => {
    if (!fbAdAccountId) {
      throw new Error("Ad Account ID is required to fetch audiences");
    }

    const audiencesResponse = await integrationApp
      .connection("facebook-ads")
      .action("list-custom-audiences")
      .run({
        fbAdAccountId,
      });

    return audiencesResponse.output.records as AudienceRecord[];
  };

  const {
    data: audiences,
    isLoading,
    error,
    mutate,
  } = useSWR(
    enabled && fbAdAccountId ? ["facebook-audiences", fbAdAccountId] : null,
    fetchAudiences,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

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
  fbAudienceId?: string;
  fbAdAccountId?: string;
}

export function SyncIntegrationsModal({
  trigger,
  ...props
}: SyncIntegrationsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedAdAccount, setSelectedAdAccount] = useState<
    string | undefined
  >(props.fbAdAccountId);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id: audienceId } = useParams();

  const { adAccounts, isLoading: isLoadingAdAccounts } = useAdAccounts({
    enabled: isOpen,
  });

  const [selectedAudience, setSelectedAudience] = useState<string | undefined>(
    props.fbAudienceId
  );

  const {
    audiences,
    isLoading: isLoadingAudiences,
    error: audiencesError,
  } = useAudiences({
    enabled: isOpen && !!selectedAdAccount,
    fbAdAccountId: selectedAdAccount,
  });

  const syncToAudience = async ({
    fbAudienceId,
    fbAdAccountId,
  }: {
    fbAudienceId: string;
    fbAdAccountId: string;
  }) => {
    if (!fbAudienceId) {
      throw new Error("Ad Account ID is required to sync audience");
    }

    if (!fbAudienceId) {
      throw new Error("Facebook Audience ID is required to sync audience");
    }

    const response = await authenticatedFetcher<SyncResponse>(
      `/api/audiences/${audienceId}/sync`,
      {
        method: "POST",
        body: JSON.stringify({
          fbAudienceId,
          fbAdAccountId,
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
    if (!selectedAdAccount) return;

    setError(null);

    try {
      setIsSyncing(true);

      await syncToAudience({
        fbAdAccountId: selectedAdAccount,
        fbAudienceId: selectedAudience,
      });

      setIsOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to sync audience. Please try again."
      );
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adAccount">Select Ad Account</Label>
                <Select
                  value={selectedAdAccount}
                  onValueChange={setSelectedAdAccount}
                  disabled={isLoadingAdAccounts}
                >
                  <SelectTrigger id="adAccount" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingAdAccounts
                          ? "Loading ad accounts..."
                          : "Select an ad account"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {adAccounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Select Facebook Audience</Label>
                <Select
                  value={selectedAudience}
                  onValueChange={setSelectedAudience}
                  disabled={
                    isLoadingAudiences || isSyncing || !selectedAdAccount
                  }
                >
                  <SelectTrigger id="audience" className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedAdAccount
                          ? "Select an ad account first"
                          : isLoadingAudiences
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
            </div>

            {error && (
              <div className="rounded-md bg-red-500 p-3 text-sm text-white">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={
                !selectedAudience ||
                !selectedAdAccount ||
                isLoadingAudiences ||
                isSyncing
              }
            >
              {isSyncing ? "Syncing..." : "Save and Sync"}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
