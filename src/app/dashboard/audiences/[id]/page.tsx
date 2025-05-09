"use client";

import { notFound, useParams } from "next/navigation";
import { AudienceMembersList } from "../../components/audience-members-list";
import { SyncIntegrationsModal } from "./components/sync-integrations-modal";
import { CreateAudienceModal } from "./components/create-audience-modal";
import useSWR from "swr";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { IAudience } from "@/models/audience";
import { IAudienceMember } from "@/models/audience-member";

interface AudienceWithMembers extends IAudience {
  members: IAudienceMember[];
}

export default function AudiencePage() {
  const { id } = useParams();

  const {
    data: audience,
    error,
    isLoading,
  } = useSWR<AudienceWithMembers>(`/api/audiences/${id}`, authenticatedFetcher);

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-red-500">Error loading audience data</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    );
  }

  if (!audience) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {audience.name}
            </h1>
            <p className="text-gray-600">{audience.description}</p>
          </div>
          <div className="flex gap-2">
            <CreateAudienceModal />
            <SyncIntegrationsModal
              fbAudienceId={audience.fbAdAccountId}
              fbAdAccountId={audience.fbAdAccountId}
            />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Audience Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Member Count
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {audience.memberCount?.toLocaleString() ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(audience.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Synced
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {audience.lastSyncedAt
                    ? new Date(audience.lastSyncedAt).toLocaleDateString()
                    : "Never"}
                </dd>
              </div>
              {audience.fbAudienceId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Facebook Audience ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono font-bold">
                    {audience.fbAudienceId}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded border p-6">
            <h2 className="text-xl font-semibold mb-4">Audience Members</h2>
            <AudienceMembersList audienceId={audience._id} />
          </div>
        </div>
      </div>
    </div>
  );
}
