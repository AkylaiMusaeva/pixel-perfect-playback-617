import { createFileRoute, Outlet } from "@tanstack/react-router";
import { clientsQuery, directionsQuery, tiersQuery } from "@/services/queries";
import { DemoNotice } from "@/components/brand/DemoBadge";

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
    <Outlet />
  </div>;
}