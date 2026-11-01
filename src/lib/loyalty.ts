import type { LoyaltyTier } from "@/domain/types";

/** Highest tier whose threshold the balance has reached. Tiers may be unsorted. */
export function tierForPoints(points: number, tiers: LoyaltyTier[]): LoyaltyTier {
  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
  let current = sorted[0];
  if (!current) throw new Error("No loyalty tiers configured");
  for (const tier of sorted) if (points >= tier.threshold) current = tier;
  return current;
}

export function nextTier(points: number, tiers: LoyaltyTier[]): LoyaltyTier | null {
  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
  return sorted.find((t) => t.threshold > points) ?? null;
}

/** Progress 0..100 from current tier threshold to the next one. 100 when at top tier. */
export function progressToNext(points: number, tiers: LoyaltyTier[]): number {
  const current = tierForPoints(points, tiers);
  const next = nextTier(points, tiers);
  if (!next) return 100;
  const span = next.threshold - current.threshold;
  return Math.min(100, Math.max(0, ((points - current.threshold) / span) * 100));
}

export function tierRank(id: LoyaltyTier["id"], tiers: LoyaltyTier[]): number {
  return [...tiers].sort((a, b) => a.threshold - b.threshold).findIndex((t) => t.id === id);
}
