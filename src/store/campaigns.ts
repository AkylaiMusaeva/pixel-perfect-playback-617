/** DEMO: test campaigns stored only in this browser. Nothing is sent anywhere. */
import { useSyncExternalStore } from "react";
import type { Campaign, CampaignStatus } from "@/domain/types";
import { demoCampaigns } from "@/data/demo/campaigns";

const KEY = "parmesun-one-campaigns-v1";
let state: Campaign[] = demoCampaigns;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw) as Campaign[];
  } catch { /* keep demo defaults */ }
}
function set(next: Campaign[]) {
  state = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export const campaigns = {
  subscribe(l: () => void) { load(); listeners.add(l); return () => { listeners.delete(l); }; },
  get: () => { load(); return state; },
  getServer: () => demoCampaigns,
  create(c: Omit<Campaign, "id" | "status" | "source">) {
    set([{ ...c, id: `c-${Date.now()}`, status: "draft", source: "demo" }, ...state]);
  },
  setStatus(id: string, status: CampaignStatus) { set(state.map((c) => (c.id === id ? { ...c, status } : c))); },
  remove(id: string) { set(state.filter((c) => c.id !== id)); },
  reset() { set(demoCampaigns); },
};

export function useCampaigns() {
  return useSyncExternalStore(campaigns.subscribe, campaigns.get, campaigns.getServer);
}
