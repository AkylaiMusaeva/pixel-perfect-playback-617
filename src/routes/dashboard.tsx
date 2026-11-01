import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Gift } from "lucide-react";
import { toast } from "sonner";
import { currentCustomerQuery, directionsQuery, offersQuery, tiersQuery } from "@/services/queries";
import { nextTier, tierForPoints, tierRank } from "@/lib/loyalty";
import { formatDate, formatDateYear, formatNumber } from "@/lib/format";
import { plannedModules } from "@/config/navigation";
import { DemoNotice } from "@/components/brand/DemoBadge";
import { TierProgress } from "@/components/loyalty/TierProgress";
import { OfferCard } from "@/components/loyalty/OfferCard";
import { DirectionCard } from "@/components/ecosystem/DirectionCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Личный кабинет (демо) — PARMESUN ONE" },
      {
        name: "description",
        content: "Демонстрационный кабинет гостя PARMESUN: уровень Circle, баланс баллов, визиты и персональные предложения.",
      },
      { property: "og:title", content: "Личный кабинет гостя — PARMESUN ONE" },
      { property: "og:description", content: "Демо-кабинет: баллы, визиты и предложения PARMESUN Circle." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentCustomerQuery()),
      context.queryClient.ensureQueryData(directionsQuery()),
      context.queryClient.ensureQueryData(tiersQuery()),
      context.queryClient.ensureQueryData(offersQuery()),
    ]),
  component: DashboardPage,
});

function DashboardPage() {
  const customerRes = useSuspenseQuery(currentCustomerQuery()).data;
  const customer = customerRes.data;
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;
  const { data: offers } = useSuspenseQuery(offersQuery()).data;

  const [activated, setActivated] = useState<string[]>([]);

  const tier = tierForPoints(customer.points, tiers);
  const next = nextTier(customer.points, tiers);
  const rank = tierRank(tier.id, tiers);
  const visited = new Set(customer.visits.map((v) => v.direction));
  const recommendations = directions.filter((d) => !visited.has(d.slug));
  const dirBySlug = Object.fromEntries(directions.map((d) => [d.slug, d]));
  const monthPoints = customer.visits
    .filter((v) => v.date.startsWith("2026-10"))
    .reduce((s, v) => s + v.points, 0);

  function toggleOffer(id: string, title: string) {
    setActivated((list) => {
      const on = list.includes(id);
      toast[on ? "info" : "success"](on ? "Предложение отменено" : "Предложение активировано", {
        description: `${title}. Демо-режим: изменения не сохраняются.`,
      });
      return on ? list.filter((x) => x !== id) : [...list, id];
    });
  }

  return (
    <div className="container-editorial pt-10 md:pt-16">
      <DemoNotice>
        Это демонстрационный кабинет вымышленного гостя. Данные — примеры, вход и оплата не подключены.
      </DemoNotice>

      {/* Greeting */}
      <section className="mt-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-accent">Личный кабинет</p>
          <h1 className="mt-4 text-5xl md:text-7xl">
            Добрый вечер, <em className="italic">{customer.firstName}</em>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {customer.firstName} {customer.lastName} · в PARMESUN с {formatDateYear(customer.memberSince)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/ecosystem">
            Выбрать впечатление <ArrowRight />
          </Link>
        </Button>
      </section>

      {/* Tier + balance */}
      <section className="mt-12 grid gap-4 lg:grid-cols-3">
        <div className="bg-espresso p-8 text-ivory md:p-10 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-sage">Уровень Circle</p>
              <p className="mt-4 font-display text-7xl">{tier.name}</p>
              <p className="mt-2 text-sm text-ivory/70">
                {tier.bonusRate}% баллами с каждого визита · уровень {rank + 1} из {tiers.length}
              </p>
            </div>
            <Button asChild variant="hero-outline" size="sm">
              <Link to="/circle">Привилегии</Link>
            </Button>
          </div>
          <div className="mt-10">
            <TierProgress points={customer.points} tiers={tiers} tone="dark" />
          </div>
          <p className="text-sm text-ivory/80">
            {next
              ? `До уровня ${next.name} осталось ${formatNumber(next.threshold - customer.points)} баллов.`
              : "Вы на высшем уровне программы."}
          </p>
        </div>

        <div className="flex flex-col border border-border bg-card p-8 md:p-10">
          <p className="eyebrow text-accent">Баланс</p>
          <p className="mt-4 font-display text-7xl tabular-nums">{formatNumber(customer.points)}</p>
          <p className="mt-1 text-sm text-muted-foreground">баллов доступно</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-muted-foreground">За октябрь</dt>
              <dd className="mt-1 font-display text-3xl">+{formatNumber(monthPoints)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Направлений</dt>
              <dd className="mt-1 font-display text-3xl">
                {visited.size}/{directions.length}
              </dd>
            </div>
          </dl>
          <Button
            className="mt-auto w-full"
            variant="secondary"
            onClick={() =>
              toast("Списание баллов появится в рабочей версии", {
                description: "В демо можно посмотреть, как будет выглядеть баланс и история.",
              })
            }
          >
            <Gift /> Потратить баллы
          </Button>
        </div>
      </section>

      {/* Offers */}
      <section className="mt-24">
        <h2 className="text-4xl md:text-5xl">Доступные предложения</h2>
        <p className="mt-3 text-sm text-muted-foreground">Подобраны по вашей истории визитов и уровню.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => {
            const required = tiers.find((t) => t.id === o.minTier)!;
            const locked = tierRank(o.minTier, tiers) > rank;
            return (
              <OfferCard
                key={o.id}
                offer={o}
                direction={dirBySlug[o.direction]}
                requiredTier={required}
                locked={locked}
                activated={activated.includes(o.id)}
                onActivate={() => toggleOffer(o.id, o.title)}
              />
            );
          })}
        </div>
      </section>

      {/* History + recommendations */}
      <section className="mt-24 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-4xl md:text-5xl">История посещений</h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {customer.visits.map((v) => (
              <li key={v.id} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-4 text-sm">
                <span className="text-muted-foreground">{formatDate(v.date)}</span>
                <div>
                  <p className="font-medium">{v.title}</p>
                  <Link
                    to="/ecosystem/$slug"
                    params={{ slug: v.direction }}
                    className="text-xs text-accent hover:underline"
                  >
                    {dirBySlug[v.direction]?.titleRu}
                  </Link>
                </div>
                <span className="font-display text-xl tabular-nums">+{v.points}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-4xl md:text-5xl">Рекомендуем открыть</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Направления, где вы ещё не были. Каждое новое — +10% к начислению баллов.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {recommendations.slice(0, 4).map((d) => (
              <DirectionCard key={d.slug} direction={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming modules */}
      <section className="mt-24 border-t border-border pt-10">
        <p className="eyebrow text-muted-foreground">Скоро в PARMESUN ONE</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {plannedModules
            .filter((m) => m.audience === "client")
            .map((m) => (
              <span key={m.id} className="rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
                {m.label}
              </span>
            ))}
        </div>
      </section>
    </div>
  );
}
