import type { ClientRecord, DirectionSlug, LoyaltyTier, TierId } from "@/domain/types";
import { directionPath } from "@/lib/journey";
import { tierForPoints } from "@/lib/loyalty";

export function mergeClient(clients: ClientRecord[], guest: ClientRecord): ClientRecord[] {
  return [guest, ...clients.filter((client) => client.id !== guest.id)];
}

export interface ClientFilters {
  search: string;
  direction: DirectionSlug | "all";
  tier: TierId | "all";
  consent: "all" | "yes" | "no";
  sort: "recent" | "points" | "name";
}

export function filterClients(clients: ClientRecord[], filters: ClientFilters, tiers: LoyaltyTier[]): ClientRecord[] {
  const search = filters.search.trim().toLocaleLowerCase("ru");
  return clients.filter((client) =>
    (!search || `${client.name} ${client.city}`.toLocaleLowerCase("ru").includes(search)) &&
    (filters.direction === "all" || directionPath(client.interactions).includes(filters.direction)) &&
    (filters.tier === "all" || tierForPoints(client.earned, tiers).id === filters.tier) &&
    (filters.consent === "all" || client.consent === (filters.consent === "yes"))
  ).sort((a, b) => {
    if (filters.sort === "points") return b.points - a.points;
    if (filters.sort === "name") return a.name.localeCompare(b.name, "ru");
    const last = (client: ClientRecord) => client.interactions.reduce((date, i) => i.date > date ? i.date : date, client.joined);
    return last(b).localeCompare(last(a));
  });
}