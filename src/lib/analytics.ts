/**
 * Pure business analytics for the team dashboard. No UI, no I/O.
 * All inputs are ClientRecord lists (demo today, live later).
 */
import type { Campaign, CampaignChannel, ClientRecord, Direction, DirectionSlug, Recommendation, SegmentId } from "@/domain/types";
import { directionPath, transitions } from "@/lib/journey";

const DAY = 86_400_000;
const days = (from: string, to: string) => Math.floor((new Date(to).getTime() - new Date(from).getTime()) / DAY);

/** Visits and bookings — the "purchase" events of the ecosystem. */
export const visitsOf = (c: ClientRecord) => c.interactions.filter((i) => i.kind === "visit" || i.kind === "booking");

export const lastActivity = (c: ClientRecord) =>
  c.interactions.reduce((d, i) => (i.date > d ? i.date : d), c.joined);

export const SEGMENTS: { id: SegmentId; name: string; rule: string }[] = [
  { id: "new", name: "Новые гости", rule: "Присоединились за последние 30 дней" },
  { id: "single", name: "Одно направление", rule: "Знают только одно направление" },
  { id: "growing", name: "Два направления", rule: "Попробовали ровно два направления" },
  { id: "explorer", name: "Исследователи экосистемы", rule: "Три и более направлений" },
  { id: "at-risk", name: "Под риском оттока", rule: "Нет активности более 60 дней" },
];

/** Rules are checked in priority order: at-risk → new → breadth. */
export function segmentOf(c: ClientRecord, ref: string): SegmentId {
  if (days(lastActivity(c), ref) > 60) return "at-risk";
  if (days(c.joined, ref) <= 30) return "new";
  const n = directionPath(c.interactions).length;
  if (n >= 3) return "explorer";
  if (n === 2) return "growing";
  return "single";
}

/** Share of guests active in at least `min` directions. */
export function multiDirectionRate(clients: ClientRecord[], min = 2): number {
  if (!clients.length) return 0;
  return clients.filter((c) => directionPath(c.interactions).length >= min).length / clients.length;
}

/** Share of guests with ≥2 visits/bookings among guests with at least one. */
export function repeatPurchaseRate(clients: ClientRecord[]): number {
  const buyers = clients.filter((c) => visitsOf(c).length >= 1);
  if (!buyers.length) return 0;
  return buyers.filter((c) => visitsOf(c).length >= 2).length / buyers.length;
}

/**
 * Retention: among guests whose first visit was at least `window` days before `ref`,
 * the share that came back (any later visit) within `window` days of the first one.
 */
export function retentionWithin(clients: ClientRecord[], window: number, ref: string): number {
  const eligible = clients
    .map((c) => visitsOf(c).map((v) => v.date).sort())
    .map((dates) => dates.filter((d) => d <= ref))
    .filter((dates) => { const first = dates[0]; return first !== undefined && days(first, ref) >= window; });
  if (!eligible.length) return 0;
  return eligible.filter((dates) => { const first = dates[0]; return first !== undefined && dates.slice(1).some((d) => days(first, d) <= window && days(first, d) > 0); }).length / eligible.length;
}

/** Cross-sell from one entry direction: of guests who started there, share who later tried each other direction. */
export function crossSell(clients: ClientRecord[], from: DirectionSlug, all: DirectionSlug[]) {
  const started = clients.filter((c) => directionPath(c.interactions)[0] === from);
  return {
    base: started.length,
    targets: all
      .filter((d) => d !== from)
      .map((to) => {
        const count = started.filter((c) => directionPath(c.interactions).includes(to)).length;
        return { to, count, share: started.length ? count / started.length : 0 };
      })
      .sort((a, b) => b.count - a.count),
  };
}

/** Monthly series for the last `months` months ending at ref: active guests and multi-direction share (cumulative). */
export function monthlySeries(clients: ClientRecord[], ref: string, months = 6) {
  const end = new Date(ref);
  return Array.from({ length: months }, (_, k) => {
    const d = new Date(end.getFullYear(), end.getMonth() - (months - 1 - k), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const until = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
    const active = clients.filter((c) => visitsOf(c).some((v) => v.date.startsWith(key) && v.date <= ref)).length;
    const known = clients
      .map((c) => ({ ...c, interactions: c.interactions.filter((i) => i.date < until && i.date <= ref) }))
      .filter((c) => c.interactions.length > 0);
    return {
      key,
      label: d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", ""),
      active,
      multi: Math.round(multiDirectionRate(known) * 100),
    };
  });
}

export interface AudienceFilter {
  segment: SegmentId | "all";
  fromDirection: DirectionSlug | "all";
  targetDirection: DirectionSlug;
}

/** Guests who can receive the campaign: consent given, match segment/entry, have not tried the target yet. */
export function campaignAudience(clients: ClientRecord[], f: AudienceFilter, ref: string): ClientRecord[] {
  return clients.filter((c) => {
    const path = directionPath(c.interactions);
    return (
      c.consent &&
      !path.includes(f.targetDirection) &&
      (f.segment === "all" || segmentOf(c, ref) === f.segment) &&
      (f.fromDirection === "all" || path.includes(f.fromDirection))
    );
  });
}

export function validateCampaign(c: Pick<Campaign, "name" | "message" | "channels" | "bonusPoints" | "fromDirection" | "targetDirection">): string | null {
  if (c.name.trim().length < 3) return "Название — минимум 3 символа";
  if (c.message.trim().length < 10) return "Сообщение — минимум 10 символов";
  if (!c.channels.length) return "Выберите хотя бы один канал";
  if (!Number.isFinite(c.bonusPoints) || c.bonusPoints < 0 || c.bonusPoints > 500) return "Бонус — от 0 до 500 баллов";
  if (c.fromDirection === c.targetDirection) return "Целевое направление должно отличаться от исходного";
  return null;
}

/**
 * Rule-based "AI" recommendations (demo logic, no external AI):
 * strongest observed transition for single-direction guests, re-activation for at-risk guests,
 * and a second-direction invite for new guests.
 */
export function recommendations(clients: ClientRecord[], directions: Direction[], ref: string): Recommendation[] {
  const name = (s: string) => directions.find((d) => d.slug === s)?.titleRu ?? s;
  const flows = transitions(clients, 1);
  const out: Recommendation[] = [];
  const single = clients.filter((c) => segmentOf(c, ref) === "single");
  const entries = new Map<DirectionSlug, number>();
  for (const c of single) {
    const e = directionPath(c.interactions)[0];
    if (e) entries.set(e, (entries.get(e) ?? 0) + 1);
  }
  for (const [from] of [...entries].sort((a, b) => b[1] - a[1]).slice(0, 3)) {
    const best = flows.filter((t) => t.from === from).sort((a, b) => b.count - a.count)[0];
    if (!best) continue;
    const audience = campaignAudience(clients, { segment: "single", fromDirection: from, targetDirection: best.to }, ref).length;
    if (!audience) continue;
    out.push({
      id: `xsell-${from}-${best.to}`,
      title: `Пригласить гостей «${name(from)}» в «${name(best.to)}»`,
      rationale: `Это самый частый второй шаг после «${name(from)}» в демо-базе (${best.count} гостей прошли этот путь). Гостей, знающих только одно направление, с согласием на связь: ${audience}.`,
      segment: "single", fromDirection: from, targetDirection: best.to,
      channels: ["push", "circle"], audience, priority: out.length === 0 ? "high" : "medium",
    });
  }
  const risk = clients.filter((c) => segmentOf(c, ref) === "at-risk" && c.consent);
  if (risk.length) {
    const target: DirectionSlug = "coffee";
    const audience = campaignAudience(clients, { segment: "at-risk", fromDirection: "all", targetDirection: target }, ref).length;
    if (audience) out.push({
      id: "reactivate-at-risk",
      title: "Вернуть гостей без активности более 60 дней",
      rationale: `${risk.length} гостей с согласием на связь давно не появлялись. Мягкое приглашение через AI Консьержа с бонусом Circle.`,
      segment: "at-risk", fromDirection: "all", targetDirection: target,
      channels: ["concierge", "email"], audience, priority: "high",
    });
  }
  const fresh = clients.filter((c) => segmentOf(c, ref) === "new" && c.consent);
  const freshAudience = campaignAudience(clients, { segment: "new", fromDirection: "all", targetDirection: "workshops" }, ref).length;
  if (freshAudience) {
    out.push({
      id: "welcome-second-direction",
      title: "Второе направление для новых гостей",
      rationale: `${fresh.length} новых гостей. Знакомство со вторым направлением в первый месяц — главный шаг к экосистеме.`,
      segment: "new", fromDirection: "all", targetDirection: "workshops",
      channels: ["email", "circle"], audience: campaignAudience(clients, { segment: "new", fromDirection: "all", targetDirection: "workshops" }, ref).length, priority: "medium",
    });
  }
  return out;
}

export const CHANNELS: { id: CampaignChannel; name: string }[] = [
  { id: "push", name: "Push в приложении" },
  { id: "email", name: "Email" },
  { id: "concierge", name: "AI Консьерж" },
  { id: "circle", name: "Предложение в Circle" },
];
