import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BusinessHeading, businessHead } from "@/components/business/BusinessHeading";
import { CrossSellChart, MonthlyChart } from "@/components/business/AnalyticsCharts";
import { useBusinessData } from "@/components/business/useBusinessData";
import { FilterSelect, PeriodSwitch } from "@/components/business/BusinessControls";
import { Button } from "@/components/ui/button";
import { multiDirectionRate, repeatPurchaseRate, retentionWithin, monthlySeries, crossSell } from "@/lib/analytics";
import { DEMO_TODAY } from "@/store/session";
import { directionPath } from "@/lib/journey";
import type { DirectionSlug } from "@/domain/types";
export const Route = createFileRoute("/business/analytics")({ head:()=>businessHead("Аналитика экосистемы","DEMO: повторные визиты, удержание гостей, перекрёстные переходы и использование нескольких направлений PARMESUN."), component: AnalyticsPage });
function AnalyticsPage(){
 const {clients,directions}=useBusinessData(); const [period,setPeriod]=useState("all"); const [from,setFrom]=useState<DirectionSlug>("coffee"); const [cohort,setCohort]=useState("all"); const [window,setWindow]=useState("30");
 const cutoff = new Date(new Date(DEMO_TODAY).getTime() - (period === "all" ? 0 : Number(period))*86400000).toISOString().slice(0,10);
 const base=clients.map(c=>({...c,interactions:c.interactions.filter(i=>i.date<=DEMO_TODAY)})).filter(c=>(period==="all" || c.joined>=cutoff) && (cohort==="all" || directionPath(c.interactions)[0]===cohort));
 const cs=crossSell(base,from,directions.map(d=>d.slug)); const percent=(x:number)=>`${Math.round(x*100)}%`;
 const metrics=[{label:"Гости в 2+ направлениях",value:percent(multiDirectionRate(base)),note:`${base.length} гостей в выбранной когорте; визиты и брони`},{label:"Повторные визиты и брони",value:percent(repeatPurchaseRate(base)),note:"2+ визита или брони среди гостей с хотя бы одним"},{label:`Возвращаемость за ${window} дней`,value:percent(retentionWithin(base,Number(window),DEMO_TODAY)),note:"Повторный визит/бронь в другой день после первого; только зрелые когорты"}];
 return <><BusinessHeading title="Аналитика экосистемы" subtitle="DEMO · вымышленные взаимодействия, не реальные результаты и не эффект маркетинговых кампаний. Срез на 1 ноября 2026." action={<PeriodSwitch value={period} onChange={setPeriod}/>}/>
 <div className="mb-7 grid gap-3 sm:grid-cols-2"><FilterSelect label="Первое направление когорты" value={cohort} onChange={setCohort} options={[{value:"all",label:"Любое первое направление"},...directions.map(d=>({value:d.slug,label:d.titleRu}))]}/><FilterSelect label="Окно удержания" value={window} onChange={setWindow} options={[{value:"30",label:"Возвращаемость: 30 дней"},{value:"60",label:"Возвращаемость: 60 дней"},{value:"90",label:"Возвращаемость: 90 дней"}]}/></div>
 <p className="mb-5 text-xs text-muted-foreground">Период — дата присоединения гостей; их история учитывается до даты среза. Когорта: {base.length} гостей.</p>
 <section className="grid gap-px border bg-border md:grid-cols-3">{metrics.map(m=><div key={m.label} className="bg-card p-6"><p className="eyebrow text-demo-foreground">DEMO</p><p className="mt-4 font-display text-5xl">{m.value}</p><h2 className="mt-3 font-sans text-sm">{m.label}</h2><p className="mt-3 text-xs leading-5 text-muted-foreground">{m.note}</p></div>)}</section>
 <div className="mt-14 grid gap-12 lg:grid-cols-2"><section className="min-w-0"><h2 className="text-3xl">Динамика знакомства</h2><p className="my-4 text-xs leading-5 text-muted-foreground">DEMO · активность по месяцам и накопленная доля гостей в 2+ направлениях. Ноябрь — неполный месяц.</p><MonthlyChart data={monthlySeries(base,DEMO_TODAY)}/></section><section className="min-w-0"><h2 className="text-3xl">Переходы в другие направления</h2><div className="my-4"><FilterSelect label="Исходное направление аналитики" value={from} onChange={v=>{const d=directions.find(d=>d.slug===v);if(d)setFrom(d.slug)}} options={directions.map(d=>({value:d.slug,label:d.titleRu}))}/></div><p className="mb-4 text-xs text-muted-foreground">DEMO · {cs.base} гостей начали здесь; доли не складываются в 100%.</p><CrossSellChart data={cs.targets.map(t=>({name:directions.find(d=>d.slug===t.to)?.titleRu??t.to,share:Math.round(t.share*100)}))}/>{!cs.base&&<p className="text-sm text-muted-foreground">Нет гостей с таким первым направлением.</p>}</section></div>
 <section className="mt-10 border-y py-8"><h2 className="text-3xl">От одного направления — к экосистеме</h2><div className="mt-6 grid gap-6 sm:grid-cols-4">{["Первый визит", "Единый профиль и согласие", "Приглашение через общие каналы", "Новый визит и история Circle"].map((s,i)=><div key={s}><p className="text-xs text-accent">0{i+1} · DEMO</p><p className="mt-3 text-sm leading-6">{s}</p></div>)}</div><Button asChild variant="outline" className="mt-7"><Link to="/business/campaigns">Создать тестовое приглашение <ArrowRight/></Link></Button></section></>;
}
