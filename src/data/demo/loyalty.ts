/**
 * DEMO DATA — illustrative loyalty programme parameters.
 * Thresholds and rates are placeholders until the business sets real rules.
 */
import type { LoyaltyTier, Offer } from "@/domain/types";

export const demoTiers: LoyaltyTier[] = [
  {
    id: "guest",
    name: "Guest",
    threshold: 0,
    bonusRate: 3,
    summary: "Знакомство с экосистемой. Уровень открывается с первого визита.",
    privileges: [
      "Баллы за визиты во всех направлениях",
      "Приветственный напиток в кофейне",
      "Анонсы событий раньше остальных",
    ],
  },
  {
    id: "insider",
    name: "Insider",
    threshold: 1500,
    bonusRate: 5,
    summary: "Для тех, кто уже открыл несколько направлений PARMESUN.",
    privileges: [
      "Повышенное начисление баллов",
      "Приоритетная запись на мастер-классы",
      "Комплимент от шефа на гастро-ужинах",
      "Закрытые предложения партнёров",
    ],
  },
  {
    id: "circle",
    name: "Circle",
    threshold: 5000,
    bonusRate: 8,
    summary: "Ближний круг PARMESUN — личный подход и закрытые события.",
    privileges: [
      "Максимальное начисление баллов",
      "Персональный менеджер для событий и кейтеринга",
      "Приглашения на закрытые ужины Circle",
      "Гарантированное место на сезонных сетах",
      "Подарок в день рождения",
    ],
  },
];

export const demoOffers: Offer[] = [
  {
    id: "of-1",
    direction: "workshops",
    title: "Мастер-класс «Паста фреска» −20%",
    description: "Вы часто бываете в кофейне — попробуйте приготовить пасту вместе с шефом.",
    validUntil: "2026-11-30",
    minTier: "guest",
    reason: "Ещё не посещали мастер-классы",
  },
  {
    id: "of-2",
    direction: "events",
    title: "Двойные баллы на ноябрьский гастро-ужин",
    description: "Сет из шести подач с трюфелем и выдержанным пармезаном. 21 ноября, 19:00.",
    validUntil: "2026-11-21",
    minTier: "insider",
    reason: "Любите вечерние форматы",
  },
  {
    id: "of-3",
    direction: "catering",
    title: "Дегустация кейтеринг-меню для двоих",
    description: "Бесплатная дегустация перед заказом кейтеринга на праздник или деловую встречу.",
    validUntil: "2026-12-15",
    minTier: "insider",
    reason: "Сезон новогодних событий",
  },
  {
    id: "of-4",
    direction: "coffee",
    title: "Каждый шестой кофе — в подарок",
    description: "Действует во всех кофейнях PARMESUN при оплате с картой Circle.",
    validUntil: "2026-12-31",
    minTier: "guest",
  },
  {
    id: "of-5",
    direction: "partnerships",
    title: "Ужин с сыроварней «Ала-Тоо»",
    description: "Закрытый ужин с производителем: 12 гостей, пять сыров и истории их выдержки.",
    validUntil: "2026-12-05",
    minTier: "circle",
    reason: "Только для уровня Circle",
  },
];
