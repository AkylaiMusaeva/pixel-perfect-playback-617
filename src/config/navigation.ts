/**
 * Product modules registry. "live" modules appear in navigation;
 * "planned" ones are reserved for upcoming stages so new sections plug in
 * without reworking the layout.
 */
export interface ProductModule {
  id: string;
  label: string;
  to?: "/" | "/ecosystem" | "/circle" | "/dashboard";
  status: "live" | "planned";
  audience: "client" | "team";
}

export const productModules: ProductModule[] = [
  { id: "home", label: "PARMESUN ONE", to: "/", status: "live", audience: "client" },
  { id: "ecosystem", label: "Экосистема", to: "/ecosystem", status: "live", audience: "client" },
  { id: "circle", label: "Circle", to: "/circle", status: "live", audience: "client" },
  { id: "dashboard", label: "Личный кабинет", to: "/dashboard", status: "live", audience: "client" },
  { id: "concierge", label: "AI Concierge", status: "planned", audience: "client" },
  { id: "journey", label: "Customer Journey", status: "planned", audience: "team" },
  { id: "analytics", label: "Бизнес-аналитика", status: "planned", audience: "team" },
  { id: "segments", label: "Сегментация клиентов", status: "planned", audience: "team" },
  { id: "campaigns", label: "Управление кампаниями", status: "planned", audience: "team" },
];

export const mainNav = productModules.filter(
  (m): m is ProductModule & { to: NonNullable<ProductModule["to"]> } =>
    m.status === "live" && m.audience === "client" && !!m.to && m.id !== "home",
);

export const plannedModules = productModules.filter((m) => m.status === "planned");
