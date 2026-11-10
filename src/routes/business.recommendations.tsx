import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { BusinessHeading, businessHead } from "@/components/business/BusinessHeading";
import { useBusinessData } from "@/components/business/useBusinessData";
import { CampaignComposer } from "@/components/business/CampaignComposer";
import { FilterSelect } from "@/components/business/BusinessControls";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/brand/DemoBadge";
import { CHANNELS, recommendations } from "@/lib/analytics";
import { DEMO_TODAY } from "@/store/session";
import type { Recommendation } from "@/domain/types";
export const Route=createFileRoute("/business/recommendations")({head:()=>businessHead("AI-рекомендации","DEMO: рекомендации приглашений по правилам и переходам вымышленных гостей PARMESUN, без внешнего ИИ."),component:RecommendationsPage});
function RecommendationsPage(){const {clients,directions}=useBusinessData();const [selected,setSelected]=useState<Recommendation|null>(null);const [priority,setPriority]=useState("all");const list=recommendations(clients,directions,DEMO_TODAY).filter(r=>priority==="all"||r.priority===priority);return <><BusinessHeading title="AI-рекомендации" subtitle="DEMO · сценарии по заданным правилам и наблюдаемым переходам вымышленных гостей. Внешний ИИ не подключён; это не прогноз продаж."/>
 <div className="mb-8 max-w-xs"><FilterSelect label="Приоритет рекомендации" value={priority} onChange={setPriority} options={[{value:"all",label:"Все приоритеты"},{value:"high",label:"Высокий приоритет"},{value:"medium",label:"Средний приоритет"}]}/></div>
 <div className="grid gap-5 lg:grid-cols-2">{list.map(r=><article key={r.id} className="flex flex-col rounded-sm border bg-card p-6"><div className="flex justify-between gap-3"><DemoBadge/><Sparkles className="size-5 text-accent"/></div><p className="mt-5 text-xs text-accent">{r.priority==="high"?"Высокий":"Средний"} приоритет</p><h2 className="mt-3 text-3xl leading-tight">{r.title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{r.rationale}</p><p className="mt-5 text-sm">DEMO · подходящих гостей: {r.audience}</p><p className="mt-2 text-xs text-muted-foreground">{r.channels.map(c=>CHANNELS.find(x=>x.id===c)?.name).join(" · ")}</p><Button variant="outline" className="mt-6 self-start" onClick={()=>setSelected(r)}>Создать кампанию <ArrowRight/></Button></article>)}</div>{!list.length&&<p className="py-12 text-muted-foreground">Нет рекомендаций с подходящей аудиторией.</p>}{selected&&<CampaignComposer open onClose={()=>setSelected(null)} clients={clients} directions={directions} seed={selected}/>}</>;}
