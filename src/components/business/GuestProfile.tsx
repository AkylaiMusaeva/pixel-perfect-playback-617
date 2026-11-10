import { useState } from "react";
import type { ClientRecord, Direction, LoyaltyTier } from "@/domain/types";
import { DemoBadge } from "@/components/brand/DemoBadge";
import { FilterSelect } from "./BusinessControls";
import { directionPath, nextBestDirection } from "@/lib/journey";
import { SEGMENTS, segmentOf, visitsOf } from "@/lib/analytics";
import { tierForPoints } from "@/lib/loyalty";
import { formatDateYear, formatNumber } from "@/lib/format";
import { DEMO_TODAY } from "@/store/session";
export function GuestProfile({ client, clients, directions, tiers }: { client: ClientRecord; clients: ClientRecord[]; directions: Direction[]; tiers: LoyaltyTier[] }) {
  const [kind, setKind] = useState("all");
  const path = directionPath(client.interactions);
  const next = nextBestDirection(path, clients, directions.map(d => d.slug));
  const name = (s: string) => directions.find(d => d.slug === s)?.titleRu ?? s;
  const history = client.interactions.filter(i => kind === "all" || i.kind === kind).sort((a,b) => b.date.localeCompare(a.date));
  return <div className="space-y-7"><div className="grid grid-cols-2 gap-4 border-y py-5 sm:grid-cols-4">{[
    ["Уровень Circle", tierForPoints(client.earned, tiers).name], ["Баланс баллов", formatNumber(client.points)], ["Визиты и брони", String(visitsOf(client).length)], ["Направления", `${path.length} / ${directions.length}`],
  ].map(([label,value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>)}</div>
  <div className="grid gap-6 sm:grid-cols-2"><div><h3 className="text-2xl">Портрет гостя</h3><p className="mt-3 text-sm">{SEGMENTS.find(s => s.id === segmentOf(client, DEMO_TODAY))?.name}</p><p className="mt-2 text-xs text-muted-foreground">{client.city} · с {formatDateYear(client.joined)}</p><p className="mt-2 text-xs">Согласие на коммуникации: {client.consent ? "есть" : "нет"}</p></div><div><h3 className="text-2xl">Следующее знакомство</h3><p className="mt-3 text-sm">{next ? name(next) : "Все направления уже открыты"}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">DEMO · подбор по переходам вымышленных гостей, не прогноз покупки.</p></div></div>
  <section><h3 className="text-2xl">Путь гостя</h3><div className="mt-4 flex flex-wrap gap-3">{path.map((s,i) => <span key={s} className="border-b border-sage py-2 text-sm">{i+1}. {name(s)}</span>)}</div></section>
  <section><div className="flex flex-wrap items-center justify-between gap-4"><h3 className="text-2xl">Единая история</h3><div className="w-52"><FilterSelect label="Тип взаимодействия" value={kind} onChange={setKind} options={[{value:"all",label:"Все взаимодействия"},{value:"visit",label:"Визиты"},{value:"booking",label:"Бронирования"},{value:"offer",label:"Сообщения и предложения"},{value:"concierge",label:"Консьерж"},{value:"reward",label:"Награды"},{value:"request",label:"Заявки"}]} /></div></div><ul className="mt-4 divide-y">{history.map(i => <li key={i.id} className="flex justify-between gap-4 py-4"><div><p className="text-sm leading-6">{i.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateYear(i.date)} · {name(i.direction)}</p></div><span className="shrink-0 text-sm text-accent">{i.points > 0 ? "+" : ""}{i.points}</span></li>)}</ul>{!history.length && <p className="py-6 text-sm text-muted-foreground">Нет взаимодействий этого типа.</p>}</section><DemoBadge /></div>;
}
