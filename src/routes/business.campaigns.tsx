import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Send, Pause, Play, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BusinessHeading, businessHead } from "@/components/business/BusinessHeading";
import { CampaignComposer } from "@/components/business/CampaignComposer";
import { useBusinessData } from "@/components/business/useBusinessData";
import { FilterSelect } from "@/components/business/BusinessControls";
import { DemoBadge } from "@/components/brand/DemoBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { campaignAudience, CHANNELS } from "@/lib/analytics";
import { campaigns, useCampaigns } from "@/store/campaigns";
import { DEMO_TODAY, session, sessionAsClient } from "@/store/session";
import type { Campaign, CampaignStatus } from "@/domain/types";
const statusLabels:Record<CampaignStatus,string>={draft:"Черновик",scheduled:"Запланирована · DEMO",paused:"Приостановлена", "test-sent":"Тест выполнен"};
export const Route=createFileRoute("/business/campaigns")({head:()=>businessHead("Маркетинговые кампании","DEMO: создание тестовых приглашений между направлениями PARMESUN без реальных рассылок."),component:CampaignsPage});
function CampaignsPage(){
 const {clients,directions}=useBusinessData();const list=useCampaigns();const [open,setOpen]=useState(false);const [seed,setSeed]=useState<Campaign|undefined>();const [search,setSearch]=useState("");const [status,setStatus]=useState("all"); const [expanded,setExpanded]=useState<string|null>(null);
 const name=(s:string)=>directions.find(d=>d.slug===s)?.titleRu??"Любое направление";
 const filtered=list.filter(c=>(status==="all"||c.status===status)&&c.name.toLocaleLowerCase("ru").includes(search.toLocaleLowerCase("ru")));
 function test(c:Campaign){const audience=campaignAudience(clients,c,DEMO_TODAY);const guest=sessionAsClient(session.get());const eligible=audience.some(x=>x.id===guest.id);if(eligible)session.addMessage(c.targetDirection,`DEMO · ${c.name}: ${c.message} · ${c.channels.map(ch=>CHANNELS.find(x=>x.id===ch)?.name).join(", ")}`);campaigns.setStatus(c.id,"test-sent");toast.success("DEMO · тест выполнен",{description:eligible?"Сообщение добавлено в историю демо-гостя. Реальной отправки нет.":"Демо-гость не входит в аудиторию. Сообщение в его историю не добавлено; реальной отправки нет."});}
 return <><BusinessHeading title="Маркетинговые кампании" subtitle="DEMO · единые приглашения через Circle, push, email и консьержа. Никаких реальных отправок и вымышленных результатов продаж." action={<Button onClick={()=>{setSeed(undefined);setOpen(true)}}><Plus/>Создать кампанию</Button>}/>
 <div className="mb-8 grid gap-3 sm:grid-cols-2"><Input aria-label="Поиск кампаний" placeholder="Название кампании" value={search} onChange={e=>setSearch(e.target.value)}/><FilterSelect label="Статус кампании" value={status} onChange={setStatus} options={[{value:"all",label:"Все статусы"},...Object.entries(statusLabels).map(([value,label])=>({value,label}))]}/></div>
 <div className="space-y-5">{filtered.map(c=>{const audience=campaignAudience(clients,c,DEMO_TODAY);return <article key={c.id} className="rounded-sm border bg-card p-5 sm:p-7"><div className="flex flex-wrap justify-between gap-3"><DemoBadge/><span className="text-xs text-muted-foreground">{statusLabels[c.status]}</span></div><h2 className="mt-4 text-3xl leading-tight">{c.name}</h2><p className="mt-3 text-sm leading-6">{name(c.fromDirection)} → {name(c.targetDirection)}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{c.message}</p><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y py-4 text-xs"><span>DEMO · охват {audience.length}</span><span>Тестовый бонус: {c.bonusPoints} баллов</span><span>{c.channels.map(ch=>CHANNELS.find(x=>x.id===ch)?.name).join(" · ")}</span></div>
 <div className="mt-5 flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" disabled={!audience.length||c.status==="test-sent"||c.status==="paused"} onClick={()=>test(c)}><Send/>Выполнить тест</Button><Button variant="ghost" size="sm" onClick={()=>setExpanded(expanded===c.id?null:c.id)}>Аудитория ({audience.length})</Button><Button variant="ghost" size="icon" aria-label={`Копировать: ${c.name}`} title="Копировать в новый черновик" onClick={()=>{setSeed(c);setOpen(true)}}><Copy/></Button><Button variant="ghost" size="icon" aria-label={`Пауза или планирование: ${c.name}`} title={c.status==="scheduled"?"Приостановить":"Запланировать (DEMO, без таймера отправки)"} disabled={c.status==="test-sent"} onClick={()=>campaigns.setStatus(c.id,c.status==="scheduled"?"paused":"scheduled")}>{c.status==="scheduled"?<Pause/>:<Play/>}</Button><Button variant="ghost" size="icon" aria-label={`Удалить: ${c.name}`} title="Удалить кампанию" onClick={()=>{if(window.confirm("Удалить тестовую кампанию?"))campaigns.remove(c.id)}}><Trash2/></Button></div>
 {expanded===c.id&&<ul className="mt-4 divide-y">{audience.map(g=><li key={g.id} className="flex items-center justify-between py-3 text-sm"><span>{g.name}</span><Button asChild variant="link" size="sm"><Link to="/business/clients/$id" params={{id:g.id}}>Профиль 360</Link></Button></li>)}{!audience.length&&<li className="py-4 text-sm text-muted-foreground">Нет подходящих гостей.</li>}</ul>}</article>})}</div>{!filtered.length&&<p className="py-12 text-muted-foreground">Кампании не найдены.</p>}
 <p className="mt-8 text-xs leading-6 text-muted-foreground">DEMO · «Запланирована» — тестовый статус без автоматической отправки. Тест добавляет сообщение только в историю демо-гостя, если он входит в аудиторию; остальные гости используются для расчёта охвата.</p>
 {open&&<CampaignComposer open onClose={()=>setOpen(false)} clients={clients} directions={directions} seed={seed}/>}</>;
}
