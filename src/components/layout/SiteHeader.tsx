import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav } from "@/config/navigation";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-editorial flex h-16 items-center justify-between md:h-20">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex" aria-label="Основная навигация">
          {mainNav.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:-bottom-2 data-[status=active]:after:left-0 data-[status=active]:after:h-px data-[status=active]:after:w-full data-[status=active]:after:bg-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">
              <UserRound /> Войти (демо)
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Открыть меню">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm bg-background">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Меню</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col px-4" aria-label="Мобильная навигация">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="border-b border-border py-4 font-display text-3xl"
              >
                Главная
              </Link>
              {mainNav.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-4 font-display text-3xl data-[status=active]:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
