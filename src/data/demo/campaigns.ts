/** DEMO DATA — sample test campaigns. Nothing is ever sent. */
import type { Campaign } from "@/domain/types";

export const demoCampaigns: Campaign[] = [
  {
    id: "demo-c1", name: "Из кофейни — на мастер-класс", segment: "single", fromDirection: "coffee", targetDirection: "workshops",
    channels: ["push", "circle"], message: "Вы уже знаете наш кофе. Приходите на мастер-класс — Circle начислит бонус за первое знакомство.",
    bonusPoints: 120, status: "scheduled", createdAt: "2026-10-20", source: "demo",
  },
  {
    id: "demo-c2", name: "Кейтеринг для гостей мероприятий", segment: "growing", fromDirection: "events", targetDirection: "catering",
    channels: ["email", "concierge"], message: "Понравился вечер? Наш кейтеринг привезёт ту же кухню на ваше событие.",
    bonusPoints: 80, status: "draft", createdAt: "2026-10-28", source: "demo",
  },
];
