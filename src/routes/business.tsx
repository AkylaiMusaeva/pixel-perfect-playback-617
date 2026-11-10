import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { clientsQuery, directionsQuery, tiersQuery } from "@/services/queries";
import { DemoNotice } from "@/components/brand/DemoBadge";
import { navFor } from "@/config/navigation";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/business")({
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(clientsQuery()),
    context.queryClient.ensureQueryData(directionsQuery()),
    context.queryClient.ensureQueryData(tiersQuery()),
  ]),
  component: BusinessLayout,
});

function BusinessLayout() {
  return <div className="container-editorial pt-8 md:pt-12">
    <DemoNotice>Вымышленные гости и визиты. Действия из гостевого кабинета отражаются здесь только в этом браузере.</DemoNotice>
    <nav aria-label="Разделы команды" className="mt-6 flex flex-wrap gap-2 border-b pb-5">{navFor("business").map(item => <Button key={item.id} asChild variant="ghost" size="sm"><Link to={item.to} activeOptions={{ exact: item.to === "/business" }} activeProps={{ className: "bg-secondary text-foreground" }}>{item.label}</Link></Button>)}</nav>
    <Outlet />
  </div>;
}