"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// ─── Shape returned to UI ─────────────────────────────────────────────────────

export interface AgentListItem {
  id:              string;
  firstName:       string;
  lastName:        string;
  profileImage:    string;
  serviceType:     string;   // "showing_agent" | "property_inspection"
  experienceLevel: string;
  city:            string;
  stateProvince:   string;
  showingBasePrice:    number;
  inspectionBasePrice: number;
}

export interface AgentsResult {
  agents:     AgentListItem[];
  total:      number;
  totalPages: number;
}

// ─── getAgents ────────────────────────────────────────────────────────────────

export async function getAgents(params: {
  page?:        number;
  search?:      string;
  serviceType?: string;   // filter by service type, omit for all
  limit?:       number;
}): Promise<AgentsResult> {
  await dbConnect();

  const { page = 1, search = "", serviceType, limit = 15 } = params;

  const query: Record<string, unknown> = { role: "service_provider" };

  if (serviceType) {
    query.serviceType = serviceType;
  }

  if (search) {
    const rx = new RegExp(search, "i");
    query.$or = [{ firstName: rx }, { lastName: rx }];
  }

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    User.find(query)
      .select("firstName lastName profileImage serviceType experienceLevel city stateProvince showingBasePrice inspectionBasePrice")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  const agents: AgentListItem[] = docs.map((u) => ({
    id:                  String(u._id),
    firstName:           u.firstName,
    lastName:            u.lastName,
    profileImage:        (u.profileImage as string) ?? "",
    serviceType:         (u.serviceType as string) ?? "",
    experienceLevel:     (u.experienceLevel as string) ?? "",
    city:                (u.city as string) ?? "",
    stateProvince:       (u.stateProvince as string) ?? "",
    showingBasePrice:    (u.showingBasePrice as number) ?? 0,
    inspectionBasePrice: (u.inspectionBasePrice as number) ?? 0,
  }));

  return { agents, total, totalPages: Math.ceil(total / limit) };
}
