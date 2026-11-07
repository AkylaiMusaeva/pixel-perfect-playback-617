import { describe, expect, it } from "vitest";
import type { ClientRecord, Interaction } from "@/domain/types";
import { breadthFunnel, directionPath, transitions, withinPeriod } from "@/lib/journey";
import { filterClients, mergeClient, type ClientFilters } from "@/lib/business";
import { demoTiers } from "@/data/demo/loyalty";

const event = (id: string, direction: Interaction["direction"], date: string, kind: Interaction["kind"] = "visit"): Interaction => ({ id, direction, date, kind, title: id, points: 100 });
const guest: ClientRecord = { id: "guest", name: "Алина С.", city: "Бишкек", joined: "2026-01-01", points: 900, earned: 1600, consent: true, interactions: [event("b", "events", "2026-10-10", "booking"), event("a", "coffee", "2026-10-01"), event("c", "coffee", "2026-10-12"), event("d", "catering", "2026-10-15", "request"), event("e", "workshops", "2026-10-20")] };
const filters: ClientFilters = { search: "", direction: "all", tier: "all", consent: "all", sort: "recent" };

describe("guest journey", () => {
  it("orders first visits and bookings, excluding requests and repeat directions", () => { expect(directionPath(guest.interactions)).toEqual(["coffee", "events", "workshops"]); });
  it("counts consecutive transitions and lets steps select the second transition", () => {
    expect(transitions([guest], 1)).toEqual([{ from: "coffee", to: "events", count: 1, clients: ["guest"] }]);
    expect(transitions([guest], 2)).toEqual([{ from: "events", to: "workshops", count: 1, clients: ["guest"] }]);
    expect(transitions([guest])).toHaveLength(2);
  });
  it("counts cumulative depth once per guest", () => { expect(breadthFunnel([guest])).toEqual([1, 1, 1, 0, 0]); });
  it("filters periods inclusively and excludes future interactions", () => {
    const client = { ...guest, interactions: [event("old", "coffee", "2026-10-01"), event("boundary", "events", "2026-10-02"), event("future", "workshops", "2026-11-02")] };
    expect(withinPeriod([client], 30, "2026-11-01")[0]?.interactions.map(i => i.id)).toEqual(["boundary"]);
  });
});

describe("team demo records", () => {
  it("reflects updated guest state without duplicate guest rows", () => {
    const updated = { ...guest, points: 1200 };
    expect(mergeClient([guest], updated)).toEqual([updated]);
  });
  it("filters by direction, consent, name and earned tier rather than balance", () => {
    expect(filterClients([guest], { ...filters, search: "АЛИНА", direction: "events", tier: "insider", consent: "yes" }, demoTiers)).toEqual([guest]);
    expect(filterClients([guest], { ...filters, consent: "no" }, demoTiers)).toEqual([]);
    expect(filterClients([guest], { ...filters, direction: "catering" }, demoTiers)).toEqual([]);
  });
});