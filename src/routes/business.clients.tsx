import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, Search } from "lucide-react";
import { useBusinessData } from "@/components/business/useBusinessData";
import { FilterSelect } from "@/components/business/BusinessControls";
import { ClientDialog } from "@/components/business/ClientDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClientRecord } from "@/domain/types";
import { filterClients, type ClientFilters } from "@/lib/business";
import { directionPath } from "@/lib/journey";
import { tierForPoints } from "@/lib/loyalty";
import { formatDate, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/business/clients")({
  head: () => ({ meta: [
    { title: "Клиенты экосистемы — PARMESUN ONE" },
    { name: "description", content: "Демонстрационный список гостей PARMESUN с поиском, фильтрами, баллами и историей взаимодействий." },
    { property: "og:title", content: "Клиенты — PARMESUN ONE" },
    { property: "og:description", content: "Вымышленные гости, их уровни Circle и история знакомства с экосистемой." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ClientsPage,
});

const initialFilters: ClientFilters = { search: "", direction: "all", tier: "all", consent: "all", sort: "recent" };

function ClientsPage() {
  const { clients, directions, tiers } = useBusinessData();
  const [filters, setFilters] = useState(initialFilters);
  const [limit, setLimit] = useState(12);
  const [selected, setSelected] = useState<ClientRecord | null>(null);
  const filtered = filterClients(clients, filters, tiers);
  function update<K extends keyof ClientFilters>(key: K, value: ClientFilters[K]) { setFilters(f => ({ ...f, [key]: value })); setLimit(12); }
  return <>
    <header className="my-12"><p className="eyebrow text-accent">PARMESUN ONE · команда</p><h1 className="mt-4 text-5xl md:text-7xl">Клиенты</h1><p className="mt-3 text-sm text-muted-foreground">Единая история гостя во всех направлениях</p></header>
    <section className="space-y-4 border-y py-6"><div className="relative max-w-lg"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="bg-card pl-10" aria-label="Поиск клиентов" placeholder="Имя или город" value={filters.search} onChange={e => update("search", e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <FilterSelect label="Направление клиента" value={filters.direction} onChange={value => { if (value === "all" || directions.some(d => d.slug === value)) update("direction", directions.find(d => d.slug === value)?.slug ?? "all"); }} options={[{ value: "all", label: "Все направления" }, ...directions.map(d => ({ value: d.slug, label: d.titleRu }))]} />
        <FilterSelect label="Уровень клиента" value={filters.tier} onChange={value => update("tier", tiers.find(t => t.id === value)?.id ?? "all")} options={[{ value: "all", label: "Все уровни" }, ...tiers.map(t => ({ value: t.id, label: t.name }))]} />
        <FilterSelect label="Согласие на коммуникации" value={filters.consent} onChange={value => { if (value === "all" || value === "yes" || value === "no") update("consent", value); }} options={[{ value: "all", label: "Любое согласие" }, { value: "yes", label: "Согласие есть" }, { value: "no", label: "Согласия нет" }]} />
        <FilterSelect label="Сортировка клиентов" value={filters.sort} onChange={value => { if (value === "recent" || value === "points" || value === "name") update("sort", value); }} options={[{ value: "recent", label: "По активности" }, { value: "points", label: "По балансу" }, { value: "name", label: "По имени" }]} />
        <Button variant="ghost" size="icon" aria-label="Сбросить фильтры" title="Сбросить фильтры" onClick={() => { setFilters(initialFilters); setLimit(12); }}><RotateCcw /></Button>
      </div>
    </section>
    <p className="my-6 text-sm text-muted-foreground" aria-live="polite">Найдено гостей: {filtered.length} из {clients.length}</p>
    <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th scope="col" className="py-4 font-medium">Гость</th><th scope="col" className="font-medium">Уровень</th><th scope="col" className="font-medium">Баланс</th><th scope="col" className="font-medium">Направления</th><th scope="col" className="font-medium">Последний визит</th><th scope="col"><span className="sr-only">Карточка</span></th></tr></thead><tbody>{filtered.slice(0, limit).map(client => {
      const last = [...client.interactions].sort((a, b) => b.date.localeCompare(a.date))[0];
      return <tr key={client.id} className="border-b"><td className="py-5 pr-4"><Button variant="link" className="h-auto justify-start" onClick={() => setSelected(client)}>{client.name}</Button><p className="mt-1 text-xs text-muted-foreground">{client.city}</p></td><td>{tierForPoints(client.earned, tiers).name}</td><td>{formatNumber(client.points)}</td><td>{directionPath(client.interactions).length} из {directions.length}</td><td className="text-xs text-muted-foreground">{last ? formatDate(last.date) : "—"}</td><td><Button size="icon" variant="ghost" aria-label={`Карточка: ${client.name}`} title="Открыть карточку гостя" onClick={() => setSelected(client)}><ArrowRight /></Button></td></tr>;
    })}</tbody></table></div>
    {!filtered.length && <div className="py-16 text-center"><h2 className="text-3xl">Гости не найдены</h2><Button variant="outline" className="mt-6" onClick={() => { setFilters(initialFilters); setLimit(12); }}>Сбросить фильтры</Button></div>}
    {filtered.length > limit && <div className="mt-8 text-center"><Button variant="outline" onClick={() => setLimit(n => n + 12)}>Показать ещё</Button></div>}
    <ClientDialog client={selected} onClose={() => setSelected(null)} directions={directions} tiers={tiers} />
  </>;
}