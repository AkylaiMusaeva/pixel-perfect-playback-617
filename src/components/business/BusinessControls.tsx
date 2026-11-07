import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[];
}) {
  return <Select value={value} onValueChange={onChange}>
    <SelectTrigger aria-label={label} className="min-w-0 bg-card"><SelectValue /></SelectTrigger>
    <SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
  </Select>;
}

export function PeriodSwitch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-1" role="group" aria-label="Период анализа">
    {[{ value: "all", label: "Всё время" }, { value: "90", label: "90 дней" }, { value: "30", label: "30 дней" }].map(option =>
      <Button key={option.value} size="sm" variant={value === option.value ? "default" : "ghost"} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</Button>
    )}
  </div>;
}