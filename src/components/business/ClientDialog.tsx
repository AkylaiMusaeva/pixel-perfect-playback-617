import type { ClientRecord, Direction, LoyaltyTier } from "@/domain/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DemoBadge } from "@/components/brand/DemoBadge";
import { directionPath } from "@/lib/journey";
import { tierForPoints } from "@/lib/loyalty";
import { formatDateYear, formatNumber } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ClientDialog({ client, onClose, directions, tiers }: { client: ClientRecord | null; onClose: () => void; directions: Direction[]; tiers: LoyaltyTier[] }) {
  const nameOf = (slug: string) => directions.find(d => d.slug === slug)?.titleRu ?? slug;
  return <Dialog open={client !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
      {client && <>
        <DialogHeader>
          <DemoBadge className="w-fit" />
          <DialogTitle className="mt-3 font-display text-4xl">{client.name}</DialogTitle>
          <DialogDescription>{client.city} · с {formatDateYear(client.joined)} · {client.id}</DialogDescription>
        </DialogHeader>
        <Button asChild variant="outline"><Link to="/business/clients/$id" params={{ id: client.id }} onClick={onClose}>Открыть профиль 360</Link></Button>
        <div className="grid grid-cols-2 gap-4 border-y py-5">
          <div><p className="text-xs text-muted-foreground">Уровень</p><p className="mt-1 font-display text-3xl">{tierForPoints(client.earned, tiers).name}</p></div>
          <div><p className="text-xs text-muted-foreground">Баланс</p><p className="mt-1 font-display text-3xl">{formatNumber(client.points)} <span className="text-sm">баллов</span></p></div>
        </div>
        <section><h3 className="text-2xl">Путь гостя</h3><p className="mt-3 text-sm leading-7">{directionPath(client.interactions).map(nameOf).join(" → ") || "Нет визитов"}</p></section>
        <p className="text-xs text-muted-foreground">Согласие на коммуникации: {client.consent ? "есть" : "нет"}</p>
        <section><h3 className="text-2xl">История взаимодействий</h3>
          <ul className="mt-4 divide-y">{[...client.interactions].sort((a, b) => b.date.localeCompare(a.date)).map(i =>
            <li key={i.id} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="text-sm">{i.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateYear(i.date)} · {nameOf(i.direction)}</p></div><span className="shrink-0 text-sm text-accent">{i.points > 0 ? "+" : ""}{formatNumber(i.points)}</span></li>
          )}</ul>
        </section>
      </>}
    </DialogContent>
  </Dialog>;
}