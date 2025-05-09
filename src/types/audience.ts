export interface AudienceList {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceMember {
  id: string;
  email: string;
  name: string;
  addedAt: string;
  status: "active" | "inactive";
  metadata?: Record<string, unknown>;
}

export interface AudienceListsResponse {
  audienceLists: AudienceList[];
}
