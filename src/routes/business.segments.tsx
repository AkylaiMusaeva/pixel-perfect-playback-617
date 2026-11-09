import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BusinessHeading, businessHead } from "@/components/business/BusinessHeading";
import { useBusinessData } from "@/components/business/useBusinessData";
import { FilterSelect } from "@/components/business/BusinessControls";
import { Button } from "@/components/ui/button";
import { SEGMENTS, segmentOf } from "@/lib/analytics";
import { DEMO_TODAY } from "@/store/session";
export const Route = createFileRoute("/business/segments")({ head: () => businessHead("Сегменты гостей", "DEMO: сегментация вымышленных гостей PARMESUN по активности и направлениям."), component: SegmentsPage });
function SegmentsPage() {
 const {clients,directions} = useBusinessData(); const [segment,setSegment] = useState("all"); const [direction,setDirection] = useState("all");
 const base = clients.filter(c => direction === "all" || c.interactions.some(i => (i.kind === "visit" || i.kind === "booking") && i.direction === direction));
 const selected = base.filter(c => segment === "all" || segmentOf(c, DEMO_TODAY) === segment);
 return <><BusinessHeading title="Сегменты гостей" subtitle="DEMO · правила на 1 ноября 2026. Каждый гость входит в один сегмент; отсутствие активности имеет приоритет."/>
 <div className="mb-8 max-w-sm"><FilterSelect label="Направление сегментации" value={direction} onChange={setDirection} options={[{value:"all",label:"Все направления"},...directions.map(d=>({value:d.slug,label:d.titleRu}))]}/></div>
 <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{SEGMENTS.map(s=>{const count=base.filter(c=>segmentOf(c,DEMO_TODAY)===s.id).length;return <Button key={s.id} variant="ghost" aria-pressed={segment===s.id} onClick={()=>setSegment(segment===s.id ? "all" : s.id)} className={`h-auto min-h-44 flex-col items-start justify-between whitespace-normal rounded-sm border p-6 text-left ${segment===s.id ? "border-sage bg-sage-soft" : "bg-card"}`}><span className="text-sm">{s.name}</span><span className="font-display text-5xl">{count}</span><span className="text-xs font-normal leading-5 text-muted-foreground">DEMO · {s.rule}</span></Button>})}</section>
 <section className="mt-12"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-3xl">Гости сегмента · {selected.length}</h2><Button variant="outline" onClick={()=>{setSegment("all");setDirection("all")}}>Все гости</Button></div><ul className="mt-5 divide-y">{selected.map(c=><li key={c.id} className="flex items-center justify-between gap-3 py-4"><div><p className="text-sm">{c.name}</p><p className="mt-1 text-xs text-muted-foreground">{SEGMENTS.find(s=>s.id===segmentOf(c,DEMO_TODAY))?.name} · {c.consent ? "согласие есть" : "нет согласия"}</p></div><Button asChild variant="ghost" size="icon"><Link to="/business/clients/$id" params={{id:c.id}} aria-label={`Профиль: ${c.name}`}><ArrowRight/></Link></Button></li>)}</ul>{!selected.length && <p className="py-8 text-muted-foreground">В этом сегменте нет гостей.</p>}</section></>;
}
