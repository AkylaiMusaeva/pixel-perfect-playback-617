import { DemoBadge } from "@/components/brand/DemoBadge";
import type { ReactNode } from "react";
export function BusinessHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <header className="my-10 flex flex-col justify-between gap-6 md:my-12 md:flex-row md:items-end"><div className="min-w-0"><DemoBadge /><h1 className="mt-4 text-5xl md:text-6xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p></div>{action}</header>;
}
export const businessHead = (title: string, description: string) => ({ meta: [
  { title: `${title} — PARMESUN ONE · DEMO` }, { name: "description", content: description },
  { property: "og:title", content: `${title} — PARMESUN ONE · DEMO` }, { property: "og:description", content: description },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" },
] });
