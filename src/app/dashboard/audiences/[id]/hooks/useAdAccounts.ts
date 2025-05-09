import { useIntegrationApp } from "@integration-app/react";
import useSWR from "swr";

interface AdAccountRecord {
  id: string;
  name: string;
  accountId: string;
}

interface UseAdAccountsOptions {
  enabled?: boolean;
}

export function useAdAccounts({ enabled = true }: UseAdAccountsOptions = {}) {
  const integrationApp = useIntegrationApp();

  const fetchAdAccounts = async () => {
    const adAccountsResponse = await integrationApp
      .connection("facebook-ads")
      .action("list-ad-accounts")
      .run();

    return adAccountsResponse.output.records as AdAccountRecord[];
  };

  const {
    data: adAccounts,
    isLoading,
    error,
    mutate,
  } = useSWR(enabled ? "facebook-ad-accounts" : null, fetchAdAccounts, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    adAccounts,
    isLoading,
    error,
    mutate,
  };
}
