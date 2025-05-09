"use client";

import { IAudienceMember } from "@/models/audience-member";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";
import { authenticatedFetcher } from "@/lib/fetch-utils";

interface AudienceMembersListProps {
  audienceId: string;
}

export function AudienceMembersList({
  audienceId,
}: AudienceMembersListProps) {
  const { data = [], error, isLoading } = useSWR<IAudienceMember[]>(
    `/api/audiences/${audienceId}/members`,
    authenticatedFetcher,
  );

  if (error) {
    return <div className="text-red-500">Error loading audience members</div>;
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Added</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((member: IAudienceMember) => (
              <TableRow key={member._id}>
                <TableCell className="font-medium">
                  {member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : "N/A"}
                </TableCell>
                <TableCell>{member.email}</TableCell>

                <TableCell>
                  {formatDistanceToNow(new Date(member.createdAt))} ago
                </TableCell>




              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 