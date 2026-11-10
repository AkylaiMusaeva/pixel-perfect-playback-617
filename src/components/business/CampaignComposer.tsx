import { useState } from "react";
import type { Campaign, CampaignChannel, ClientRecord, Direction, Recommendation } from "@/domain/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "./BusinessControls";
import { campaignAudience, CHANNELS, SEGMENTS, validateCampaign } from "@/lib/analytics";
import { campaigns } from "@/store/campaigns";
import { DEMO_TODAY } from "@/store/session";
import { toast } from "sonner";
export function CampaignComposer({ open, onClose, clients, directions, seed }: { open: boolean; onClose: () => void; clients: ClientRecord[]; directions: Direction[]; seed?: Recommendation | Campaign | undefined }) {
 const [form,setForm]=useState({ name: seed && "name" in seed ? seed.name : seed?.title ?? "", segment: seed?.segment ?? "all", fromDirection: seed?.fromDirection ?? "all", targetDirection: seed?.targetDirection ?? "workshops", channels: seed?.channels ?? ["circle"] as CampaignChannel[], message: seed && "message" in seed ? seed.message : "", bonusPoints: seed && "bonusPoints" in seed ? seed.bonusPoints : 0 } as Omit<Campaign,"id"|"status"|"source"|"createdAt">);
 const [error,setError]=useState<string|null>(null); const audience=campaignAudience(clients,form,DEMO_TODAY);
 const set=<K extends keyof typeof form>(key:K,value:typeof form[K])=>setForm(f=>({...f,[key]:value}));
 function save(){ const e=validateCampaign(form);setError(e);if(e)return;campaigns.create({...form,createdAt:DEMO_TODAY});toast.success("DEMO · черновик кампании сохранён");onClose(); }
 return <Dialog open={open} onOpenChange={v=>{if(!v)onClose()}}><DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle className="font-display text-3xl">Тестовая кампания</DialogTitle><DialogDescription>DEMO · только в этом браузере. Рассылки не отправляются, бонус не начисляется автоматически.</DialogDescription></DialogHeader>
 <form className="space-y-5" onSubmit={e=>{e.preventDefault();save()}}><label className="block space-y-2 text-sm"><span>Название</span><Input aria-label="Название кампании" value={form.name} onChange={e=>set("name",e.target.value)}/></label>
 <div className="grid gap-3 sm:grid-cols-2"><FilterSelect label="Сегмент кампании" value={form.segment} onChange={v=>set("segment",SEGMENTS.find(s=>s.id===v)?.id??"all")} options={[{value:"all",label:"Все сегменты"},...SEGMENTS.map(s=>({value:s.id,label:s.name}))]}/><FilterSelect label="Знакомое направление" value={form.fromDirection} onChange={v=>set("fromDirection",directions.find(d=>d.slug===v)?.slug??"all")} options={[{value:"all",label:"Любое знакомое направление"},...directions.map(d=>({value:d.slug,label:d.titleRu}))]}/></div>
 <label className="block space-y-2 text-sm"><span>Пригласить в направление</span><FilterSelect label="Целевое направление" value={form.targetDirection} onChange={v=>{const d=directions.find(d=>d.slug===v);if(d)set("targetDirection",d.slug)}} options={directions.map(d=>({value:d.slug,label:d.titleRu}))}/></label>
 <fieldset><legend className="mb-3 text-sm">Общие каналы связи</legend><div className="grid gap-3 sm:grid-cols-2">{CHANNELS.map(ch=><label key={ch.id} className="flex items-center gap-2 text-sm"><Checkbox aria-label={ch.name} checked={form.channels.includes(ch.id)} onCheckedChange={v=>set("channels",v===true?[...form.channels,ch.id]:form.channels.filter(c=>c!==ch.id))}/>{ch.name}</label>)}</div></fieldset>
 <label className="block space-y-2 text-sm"><span>Сообщение</span><Textarea aria-label="Сообщение кампании" rows={4} value={form.message} onChange={e=>set("message",e.target.value)}/></label>
 <label className="block space-y-2 text-sm"><span>Тестовый бонус Circle · 0–500 баллов</span><Input aria-label="Бонус кампании" type="number" min={0} max={500} value={form.bonusPoints} onChange={e=>set("bonusPoints",Number(e.target.value))}/></label>
 <div className="border-y py-4"><p className="text-sm" aria-live="polite">DEMO · аудитория: {audience.length} гостей</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Только с согласием на связь, без визита или брони в целевом направлении.</p><p className="mt-2 text-xs">{audience.slice(0,4).map(c=>c.name).join(", ")}{audience.length>4?"…":""}</p></div>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={onClose}>Отмена</Button><Button type="submit">Сохранить черновик</Button></div></form></DialogContent></Dialog>;
}
