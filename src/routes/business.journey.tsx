import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useBusinessData } from "@/components/business/useBusinessData";
import { FilterSelect, PeriodSwitch } from "@/components/business/BusinessControls";
import { ClientDialog } from "@/components/business/ClientDialog";
import { Button } from "@/components/ui/button";
import type { ClientRecord } from "@/domain/types";
import { breadthFunnel, transitions, withinPeriod } from "@/lib/journey";
import { DEMO_TODAY } from "@/store/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/journey")({
  head: () => ({ meta: [
    { title: "Путь гостя и переходы — PARMESUN ONE" },
    { name: "description", content: "Демонстрационная карта переходов гостей между направлениями PARMESUN с фильтрами и историей клиентов." },
    { property: "og:title", content: "Путь гостя — PARMESUN ONE" },
    { property: "og:description", content: "Переходы между направлениями, глубина знакомства и гости каждого пути." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: JourneyPage,
});

function JourneyPage() {
  const { clients, directions, tiers } = useBusinessData();
  const [period, setPeriod] = useState("all");
  const [step, setStep] = useState("all");
  const [origin, setOrigin] = useState("all");
  const [pair, setPair] = useState<string | null>(null);
  const [selected, setSelected] = useState<ClientRecord | null>(null);
  const base = withinPeriod(clients, period === "all" ? null : Number(period), DEMO_TODAY);
  const all = transitions(base, step === "all" ? "all" : Number(step));
  const visible = all.filter(t => origin === "all" || t.from === origin);
  const chosen = visible.find(t => `${t.from}>${t.to}` === pair);
  const funnel = breadthFunnel(base);
  const label = (slug: string) => directions.find(d => d.slug === slug)?.titleRu ?? slug;
  const max = Math.max(1, ...visible.map(t => t.count));
  const update = (setter: (v: string) => void) => (value: string) => { setter(value); setPair(null); };
  return <>
    <header className="my-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow text-accent">PARMESUN ONE · команда</p><h1 className="mt-4 text-5xl md:text-7xl">Путь гостя</h1><p className="mt-3 text-sm text-muted-foreground">От первого визита — к знакомству со всей экосистемой</p></div><PeriodSwitch value={period} onChange={update(setPeriod)} /></header>
    <section className="border-y py-7"><h2 className="text-3xl">Глубина знакомства</h2><div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-5">{funnel.map((count, i) => <div key={i}><p className="text-xs text-muted-foreground">{i === 0 ? "1 направление" : `${i + 1}${i === 4 ? "+" : ""} направления`}</p><p className="mt-3 font-display text-4xl">{count}</p><progress className="mt-3 h-1.5 w-full accent-sage" max={Math.max(1, base.length)} value={count} aria-label={`${i + 1} направлений`} /></div>)}</div></section>
    <section className="mt-12"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><h2 className="text-3xl md:text-4xl">Карта переходов</h2><div className="grid w-full gap-3 sm:grid-cols-[1fr_1fr_auto] lg:w-auto lg:min-w-[34rem]">
      <FilterSelect label="Шаг пути" value={step} onChange={update(setStep)} options={[{ value: "all", label: "Все шаги" }, { value: "1", label: "Первый → второй" }, { value: "2", label: "Второй → третий" }, { value: "3", label: "Третий → четвёртый" }]} />
      <FilterSelect label="Откуда" value={origin} onChange={update(setOrigin)} options={[{ value: "all", label: "Все направления" }, ...directions.map(d => ({ value: d.slug, label: d.titleRu }))]} />
      <Button variant="ghost" size="icon" aria-label="Сбросить фильтры" title="Сбросить фильтры" onClick={() => { setPeriod("all"); setStep("all"); setOrigin("all"); setPair(null); }}><RotateCcw /></Button>
    </div></div>
    <div className="mt-7 overflow-x-auto border bg-card"><table className="w-full min-w-[720px] table-fixed border-collapse text-center text-xs"><caption className="sr-only">Количество гостей по переходам: строки — откуда, столбцы — куда</caption><thead><tr><th scope="col" className="w-40 p-4 text-left text-muted-foreground">Откуда ↓ / куда →</th>{directions.map(d => <th key={d.slug} scope="col" className="px-2 py-5 font-medium leading-5">{d.titleRu}</th>)}</tr></thead><tbody>{directions.map(from => <tr key={from.slug} className="border-t"><th scope="row" className="p-4 text-left font-medium">{from.titleRu}</th>{directions.map(to => { const t = visible.find(t => t.from === from.slug && t.to === to.slug); const key = `${from.slug}>${to.slug}`; return <td key={to.slug} className="h-16 border-l p-1">{from.slug === to.slug ? <span className="text-muted-foreground">—</span> : <Button variant={pair === key ? "default" : t ? "secondary" : "ghost"} className={cn("h-12 w-full rounded-sm text-base", t && t.count >= max / 2 && pair !== key && "bg-sage-soft")} disabled={!t} aria-label={`${label(from.slug)} → ${label(to.slug)}: ${t?.count ?? 0} гостей`} aria-pressed={pair === key} onClick={() => setPair(key)}>{t?.count ?? "·"}</Button>}</td>; })}</tr>)}</tbody></table></div>
    <p className="mt-3 text-xs text-muted-foreground">Количество гостей · строки: откуда · столбцы: куда · визиты и бронирования · срез на 1 ноября 2026</p>
    </section>
    <div className="mt-12 grid gap-10 lg:grid-cols-2"><section><h2 className="text-3xl">Переходы по частоте</h2><ul className="mt-6 divide-y">{visible.map(t => { const key = `${t.from}>${t.to}`; return <li key={key}><Button variant="ghost" className="h-auto w-full justify-between gap-4 rounded-none px-0 py-4 text-left" aria-pressed={pair === key} onClick={() => setPair(key)}><span className="whitespace-normal text-sm leading-6">{label(t.from)} <ArrowRight className="mx-2 inline size-4 text-accent" />{label(t.to)}</span><span className="font-display text-3xl">{t.count}</span></Button></li>; })}</ul>{!visible.length && <p className="mt-6 text-muted-foreground">Переходов за этот период нет.</p>}</section>
      <section className="border-t pt-7 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0"><p className="eyebrow text-accent">Гости выбранного перехода</p><h2 className="mt-4 text-3xl">{chosen ? `${label(chosen.from)} → ${label(chosen.to)}` : "Переход не выбран"}</h2>{chosen && <><p className="mt-3 text-sm text-muted-foreground">{chosen.count} гостей</p><ul className="mt-5 divide-y">{chosen.clients.map(id => { const client = clients.find(c => c.id === id); return client ? <li key={id} className="flex items-center justify-between py-4"><Button variant="link" onClick={() => setSelected(client)}>{client.name} <ArrowRight /></Button><span className="text-xs text-muted-foreground">{client.city}</span></li> : null; })}</ul></>}</section>
    </div>
    <ClientDialog client={selected} onClose={() => setSelected(null)} directions={directions} tiers={tiers} />
  </>;
}