"use client";

import { AudienceListItem } from "./audience-list-item";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateAudienceDialog } from "./create-audience-dialog";
import { useState } from "react";
import useSWR from "swr";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { IAudience } from "@/models/audience";

export function AudienceLists() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const {
    data: audiences = [],
    error,
    isLoading,
    mutate,
  } = useSWR<IAudience[]>("/api/audiences", authenticatedFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (error) {
    return (
      <div className="text-red-500">
        Failed to load audiences: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading audiences...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Your Audience Lists
        </h2>
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Audience
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audiences.map((audienceList) => (
          <AudienceListItem key={audienceList._id} audienceList={audienceList} />
        ))}
      </div>

      <CreateAudienceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          mutate();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
