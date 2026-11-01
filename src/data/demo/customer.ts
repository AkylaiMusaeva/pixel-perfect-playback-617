/**
 * DEMO DATA — a fictional customer for the dashboard prototype.
 * Not a real person; no personal data is stored or transmitted.
 */
import type { Customer } from "@/domain/types";

export const demoCustomer: Customer = {
  id: "demo-0001",
  firstName: "Алина",
  lastName: "Садыкова",
  memberSince: "2025-03-14",
  points: 2840,
  favoriteDirections: ["coffee", "events"],
  visits: [
    { id: "v-9", date: "2026-10-28", direction: "coffee", title: "Флэт уайт и круассан", points: 40 },
    { id: "v-8", date: "2026-10-24", direction: "events", title: "Гастро-ужин «Осенний урожай»", points: 400 },
    { id: "v-7", date: "2026-10-19", direction: "coffee", title: "Кофейная дегустация: Эфиопия", points: 60 },
    { id: "v-6", date: "2026-10-11", direction: "partnerships", title: "Фермерский маркет PARMESUN", points: 150 },
    { id: "v-5", date: "2026-10-03", direction: "coffee", title: "Завтрак с подругой", points: 40 },
    { id: "v-4", date: "2026-09-20", direction: "events", title: "Частный ужин на день рождения", points: 900 },
    { id: "v-3", date: "2026-09-08", direction: "coffee", title: "Капучино на вынос", points: 40 },
  ],
};
