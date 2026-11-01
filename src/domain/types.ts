/**
 * Core domain model for PARMESUN ONE.
 * Data sources (demo now, real API later) must return these shapes,
 * so pages never depend on where the data comes from.
 */

export type DirectionSlug =
  | "coffee"
  | "workshops"
  | "events"
  | "catering"
  | "education"
  | "partnerships";

export interface Direction {
  slug: DirectionSlug;
  title: string;
  titleRu: string;
  tagline: string;
  description: string;
  formats: string[];
  /** Demo: points a guest receives for one visit / order in this direction */
  pointsPerVisit: number;
  ctaLabel: string;
  image: string;
}

export type TierId = "guest" | "insider" | "circle";

export interface LoyaltyTier {
  id: TierId;
  name: string;
  /** Points needed to reach this tier */
  threshold: number;
  /** Share of each visit returned as points, in percent */
  bonusRate: number;
  summary: string;
  privileges: string[];
}

export interface Visit {
  id: string;
  date: string; // ISO
  direction: DirectionSlug;
  title: string;
  points: number;
}

export interface Offer {
  id: string;
  direction: DirectionSlug;
  title: string;
  description: string;
  validUntil: string; // ISO
  minTier: TierId;
  /** Why this offer is shown — reserved for future segmentation / AI */
  reason?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  memberSince: string; // ISO
  points: number;
  visits: Visit[];
  favoriteDirections: DirectionSlug[];
}

/** Every payload carries its origin so UI can mark demo content explicitly. */
export type DataSource = "demo" | "live";

export interface Sourced<T> {
  source: DataSource;
  data: T;
}
