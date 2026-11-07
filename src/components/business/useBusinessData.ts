import { useSuspenseQuery } from "@tanstack/react-query";
import { clientsQuery, directionsQuery, tiersQuery } from "@/services/queries";
import { sessionAsClient, useSession } from "@/store/session";
import { mergeClient } from "@/lib/business";

export function useBusinessData() {
  const clientPayload = useSuspenseQuery(clientsQuery()).data;
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;
  const session = useSession();
  return { clients: mergeClient(clientPayload.data, sessionAsClient(session)), directions, tiers, source: clientPayload.source };
}