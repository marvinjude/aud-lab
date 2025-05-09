"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAudience } from "@/models/audience";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface AudienceListItemProps {
  audienceList: IAudience;
}

export function AudienceListItem({ audienceList }: AudienceListItemProps) {
  return (
    <Link href={`/dashboard/audiences/${audienceList._id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            {audienceList.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            {audienceList.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{audienceList.memberCount.toLocaleString()} members</span>
            <span>
              Updated {formatDistanceToNow(new Date(audienceList.updatedAt))}{" "}
              ago
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
