import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BusinessHeading, businessHead } from "@/components/business/BusinessHeading";
import { GuestProfile } from "@/components/business/GuestProfile";
import { useBusinessData } from "@/components/business/useBusinessData";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/business/clients_/$id")({ head: () => businessHead("Профиль гостя 360", "DEMO: единая история, направления, согласие и статус Circle вымышленного гостя PARMESUN."), component: ProfilePage });
function ProfilePage() { const {id}=Route.useParams(); const {clients,directions,tiers}=useBusinessData(); const client=clients.find(c=>c.id===id); return <><BusinessHeading title={client?.name ?? "Гость не найден"} subtitle="Профиль гостя 360 · DEMO" action={<Button asChild variant="outline"><Link to="/business/clients"><ArrowLeft/>Клиенты</Link></Button>}/>{client && <GuestProfile key={id} client={client} clients={clients} directions={directions} tiers={tiers}/>}</>; }
