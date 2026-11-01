/**
 * Data access layer. Pages read data ONLY through these query options.
 * Today every source is demo data; to go live, swap a queryFn for a
 * server function (createServerFn) returning the same Sourced<T> shape.
 */
import { queryOptions } from "@tanstack/react-query";
import type { Customer, Direction, LoyaltyTier, Offer, Sourced } from "@/domain/types";
import { demoDirections } from "@/data/demo/directions";
import { demoOffers, demoTiers } from "@/data/demo/loyalty";
import { demoCustomer } from "@/data/demo/customer";

const demo = <T,>(data: T): Sourced<T> => ({ source: "demo", data });

export const directionsQuery = () =>
  queryOptions({
    queryKey: ["directions"],
    queryFn: async (): Promise<Sourced<Direction[]>> => demo(demoDirections),
    staleTime: Infinity,
  });

export const tiersQuery = () =>
  queryOptions({
    queryKey: ["loyalty", "tiers"],
    queryFn: async (): Promise<Sourced<LoyaltyTier[]>> => demo(demoTiers),
    staleTime: Infinity,
  });

export const offersQuery = () =>
  queryOptions({
    queryKey: ["loyalty", "offers"],
    queryFn: async (): Promise<Sourced<Offer[]>> => demo(demoOffers),
    staleTime: Infinity,
  });

export const currentCustomerQuery = () =>
  queryOptions({
    queryKey: ["customer", "current"],
    queryFn: async (): Promise<Sourced<Customer>> => demo(demoCustomer),
    staleTime: Infinity,
  });

export function findDirection(list: Direction[], slug: string) {
  return list.find((d) => d.slug === slug);
}
