import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DemoBadge } from "@/components/brand/DemoBadge";

interface Props {
  topic: string;
  trigger: React.ReactNode;
}

/** Demo request form — validates input but never sends data anywhere. */
export function RequestDialog({ topic, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");

  const valid = name.trim().length >= 2 && contact.trim().length >= 5;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    toast.success("Заявка оформлена в демо-режиме", {
      description: `${topic}: данные не отправлены и не сохранены. В рабочей версии с вами свяжется менеджер.`,
    });
    setOpen(false);
    setName("");
    setContact("");
    setComment("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-background sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DemoBadge className="w-fit" />
            <DialogTitle className="font-display text-3xl font-medium">{topic}</DialogTitle>
            <DialogDescription>
              Оставьте контакт — в рабочей версии менеджер PARMESUN свяжется с вами. Сейчас форма
              демонстрационная: данные никуда не передаются.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="req-name">Имя</Label>
            <Input id="req-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-contact">Телефон или e-mail</Label>
            <Input
              id="req-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-comment">Пожелания</Label>
            <Textarea
              id="req-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Дата, число гостей, формат…"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!valid} className="w-full sm:w-auto">
              Отправить (демо)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
