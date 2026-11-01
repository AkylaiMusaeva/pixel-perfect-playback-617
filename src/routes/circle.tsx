import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import circleImg from "@/assets/circle-still.jpg";
import { directionsQuery, offersQuery, tiersQuery } from "@/services/queries";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { DemoBadge, DemoNotice } from "@/components/brand/DemoBadge";
import { TierCard } from "@/components/loyalty/TierCard";
import { PointsCalculator } from "@/components/loyalty/PointsCalculator";
import { OfferCard } from "@/components/loyalty/OfferCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/circle")({
  head: () => ({
    meta: [
      { title: "PARMESUN Circle — единая программа лояльности" },
      {
        name: "description",
        content: "Три уровня Guest, Insider и Circle: баллы во всех направлениях PARMESUN и персональные привилегии.",
      },
      { property: "og:title", content: "PARMESUN Circle — единая программа лояльности" },
      { property: "og:description", content: "Баллы во всех направлениях PARMESUN и привилегии трёх уровней." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(directionsQuery()),
      context.queryClient.ensureQueryData(tiersQuery()),
      context.queryClient.ensureQueryData(offersQuery()),
    ]),
  component: CirclePage,
});

const principles = [
  ["Копите везде", "Каждый визит в любом направлении пополняет единый баланс."],
  ["Тратьте где угодно", "Баллы за кофе превращаются в место на гастро-ужине или скидку на кейтеринг."],
  ["Открывайте новое", "Чем больше направлений вы пробуете, тем быстрее растёт уровень."],
];

function CirclePage() {
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;
  const { data: offers } = useSuspenseQuery(offersQuery()).data;

  return (
    <>
      <section className="container-editorial grid items-center gap-12 pb-20 pt-16 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-7">
          <SectionHeading
            as="h1"
            eyebrow="Программа лояльности"
            title={
              <>
                PARMESUN <em className="italic">Circle</em>
              </>
            }
            lead="Одна программа для всей экосистемы. Circle помнит, что вы любите, вознаграждает за любопытство и с каждым уровнем приближает вас к кухне PARMESUN."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#calculator">
                Рассчитать баллы <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">Посмотреть демо-кабинет</Link>
            </Button>
          </div>
        </div>
        <div className="md:col-span-5">
          <img
            src={circleImg}
            alt="Паста с пармезаном и приглашение Circle"
            width={1280}
            height={1600}
            className="aspect-[4/5] w-full object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container-editorial grid gap-10 md:grid-cols-3">
          {principles.map(([title, text], i) => (
            <div key={title} className="border-t border-foreground/20 pt-6">
              <p className="eyebrow text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-4 text-4xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Уровни" title="Три уровня близости" />
          <DemoBadge />
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <TierCard key={t.id} tier={t} index={i} highlighted={t.id === "circle"} />
          ))}
        </div>
      </section>

      <section id="calculator" className="container-editorial scroll-mt-24 py-12">
        <SectionHeading
          eyebrow="Накопление бонусов"
          title="Как растёт ваш баланс"
          lead="Выберите, как часто вы бываете в разных направлениях. За каждое дополнительное направление действует бонус +10% — так Circle поощряет открывать экосистему целиком."
        />
        <div className="mt-12">
          <PointsCalculator directions={directions} tiers={tiers} />
        </div>
        <div className="mt-6">
          <DemoNotice>Правила начисления и пороги уровней — демонстрационные и будут утверждены отдельно.</DemoNotice>
        </div>
      </section>

      <section className="container-editorial py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Персональные предложения"
            title="Примеры приглашений"
            lead="Предложения подбираются по истории визитов: гостю кофейни — мастер-класс, гостю ужинов — организация собственного события."
          />
          <DemoBadge />
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offers.slice(0, 4).map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              direction={directions.find((d) => d.slug === o.direction)}
              requiredTier={tiers.find((t) => t.id === o.minTier)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
