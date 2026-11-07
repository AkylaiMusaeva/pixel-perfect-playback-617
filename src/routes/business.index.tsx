import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, Route as RouteIcon, Layers, Activity } from "lucide-react";
import { useBusinessData } from "@/components/business/useBusinessData";
import { PeriodSwitch } from "@/components/business/BusinessControls";
import { ClientDialog } from "@/components/business/ClientDialog";
import { Button } from "@/components/ui/button";
import type { ClientRecord } from "@/domain/types";
import { crossUsageShare, directionPath, transitions, withinPeriod } from "@/lib/journey";
import { DEMO_TODAY } from "@/store/session";
import { formatDate, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/business/")({
  head: () => ({ meta: [
    { title: "Обзор для команды — PARMESUN ONE" },
    { name: "description", content: "Демонстрационный обзор гостей, активности и переходов между направлениями PARMESUN." },
    { property: "og:title", content: "Обзор команды — PARMESUN ONE" },
    { property: "og:description", content: "Гости и взаимодействия в гастрономической экосистеме: демонстрационные показатели." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: BusinessOverview,
});

function BusinessOverview() {
  const { clients, directions, tiers } = useBusinessData();
  const [period, setPeriod] = useState("all");
  const [selected, setSelected] = useState<ClientRecord | null>(null);
  const base = withinPeriod(clients, period === "all" ? null : Number(period), DEMO_TODAY);
  const visits = base.flatMap(c => c.interactions).filter(i => i.kind === "visit" || i.kind === "booking");
  const top = transitions(base).slice(0, 4);
  const nameOf = (slug: string) => directions.find(d => d.slug === slug)?.titleRu ?? slug;
  const activity = base.flatMap(c => c.interactions.map(i => ({ client: c, interaction: i }))).sort((a, b) => b.interaction.date.localeCompare(a.interaction.date)).slice(0, 6);
  const metrics = [
    { label: "Активные гости", value: formatNumber(base.length), icon: Users },
    { label: "Визиты и бронирования", value: formatNumber(visits.length), icon: Activity },
    { label: "В двух и более направлениях", value: `${Math.round(crossUsageShare(base) * 100)}%`, icon: Layers },
    { label: "Переходы между направлениями", value: formatNumber(transitions(base).reduce((s, t) => s + t.count, 0)), icon: RouteIcon },
  ];
  return <>
    <header className="my-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow text-accent">PARMESUN ONE · команда</p><h1 className="mt-4 text-5xl md:text-7xl">Обзор экосистемы</h1><p className="mt-3 text-sm text-muted-foreground">Срез на 1 ноября 2026 · демонстрационная база</p></div><PeriodSwitch value={period} onChange={setPeriod} /></header>
    <section className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <div key={label} className="bg-card p-6"><Icon className="mb-5 size-5 text-accent" /><p className="font-display text-5xl">{value}</p><p className="mt-3 text-xs leading-5 text-muted-foreground">{label}</p></div>)}</section>
    <div className="mt-16 grid gap-14 lg:grid-cols-2">
      <section><div className="flex items-center justify-between gap-4"><h2 className="text-3xl md:text-4xl">Направления</h2><Button asChild variant="link"><Link to="/business/journey">Путь гостя <ArrowRight /></Link></Button></div>
        <ul className="mt-7 divide-y">{directions.map((d, index) => { const count = base.filter(c => directionPath(c.interactions).includes(d.slug)).length; return <li key={d.slug} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-4"><span className="text-xs text-muted-foreground">0{index + 1}</span><div><p className="text-sm">{d.titleRu}</p><progress className="mt-3 h-1 w-full accent-sage" value={count} max={Math.max(1, base.length)} aria-label={`Гости: ${d.titleRu}`} /></div><span className="font-display text-3xl">{count}</span></li>; })}</ul>
      </section>
      <section><h2 className="text-3xl md:text-4xl">Частые переходы</h2><p className="mt-3 text-sm text-muted-foreground">Между последовательно открытыми направлениями</p>
        <ol className="mt-6 divide-y">{top.map(t => <li key={`${t.from}-${t.to}`} className="flex items-center justify-between gap-4 py-5"><p className="text-sm leading-6">{nameOf(t.from)} <ArrowRight className="mx-2 inline size-4 text-accent" /> {nameOf(t.to)}</p><span className="font-display text-3xl">{t.count}</span></li>)}</ol>{!top.length && <p className="mt-8 text-muted-foreground">Нет переходов за этот период.</p>}
        <Button asChild variant="outline" className="mt-6"><Link to="/business/journey">Все переходы <ArrowRight /></Link></Button>
      </section>
    </div>
    <section className="mt-16"><div className="flex items-center justify-between gap-4"><h2 className="text-3xl md:text-4xl">Последняя активность</h2><Button asChild variant="link"><Link to="/business/clients">Клиенты <ArrowRight /></Link></Button></div>
      <ul className="mt-7 divide-y">{activity.map(({ client, interaction }) => <li key={`${client.id}-${interaction.id}`} className="grid items-center gap-2 py-4 sm:grid-cols-[10rem_1fr_auto]"><Button variant="link" className="h-auto justify-start whitespace-normal text-left" onClick={() => setSelected(clients.find(c => c.id === client.id) ?? client)}>{client.name}</Button><div><p className="text-sm">{interaction.title}</p><p className="mt-1 text-xs text-muted-foreground">{nameOf(interaction.direction)}</p></div><p className="text-xs text-muted-foreground">{formatDate(interaction.date)}</p></li>)}</ul>
      {!activity.length && <p className="py-8 text-muted-foreground">Нет активности за этот период.</p>}
    </section>
    <ClientDialog client={selected} onClose={() => setSelected(null)} directions={directions} tiers={tiers} />
  </>;
}