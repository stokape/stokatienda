import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { defaultSiteContent } from "../../data/siteContent";
import { HeroContent } from "../../components/store/HeroContent";
import { Button } from "../../components/ui/Button";
import { Field, Input, Textarea } from "../../components/ui/form";
import { useDataStore } from "../../store/dataStore";
import type { SiteContent } from "../../types";

export function ContentPage() {
  const content = useDataStore((s) => s.siteContent);
  const updateSiteContent = useDataStore((s) => s.updateSiteContent);
  const [draft, setDraft] = useState<SiteContent>(content);

  const dirty = JSON.stringify(draft) !== JSON.stringify(content);

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSiteContent(draft);
    toast.success("Portada actualizada");
  }

  function handleReset() {
    setDraft(defaultSiteContent);
    toast("Valores originales cargados (sin guardar todavía)");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-ink">Contenido de la portada</h1>
          <p className="text-sm text-stoka-ink-muted">
            Edita el texto del hero de la tienda. La vista previa de la derecha se actualiza mientras escribes.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={handleReset} icon={<RotateCcw className="size-4" aria-hidden="true" />}>
          Restablecer al original
        </Button>
      </div>

      <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-4 rounded-xl border border-stoka-border bg-stoka-surface p-5">
          <Field label="Texto del badge superior" htmlFor="c-badge" hint="Ej. promoción de envío gratis">
            <Input id="c-badge" value={draft.heroBadge} onChange={(e) => set("heroBadge", e.target.value)} />
          </Field>
          <Field label="Título — primera línea" htmlFor="c-title1">
            <Input id="c-title1" value={draft.heroTitleLine} onChange={(e) => set("heroTitleLine", e.target.value)} />
          </Field>
          <Field label="Título — línea destacada (en rojo)" htmlFor="c-title2">
            <Input id="c-title2" value={draft.heroTitleAccent} onChange={(e) => set("heroTitleAccent", e.target.value)} />
          </Field>
          <Field label="Subtítulo" htmlFor="c-subtitle">
            <Textarea id="c-subtitle" value={draft.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
          </Field>
          <Field label="Botón principal" htmlFor="c-cta1" hint="Lleva al catálogo">
            <Input id="c-cta1" value={draft.heroPrimaryCta} onChange={(e) => set("heroPrimaryCta", e.target.value)} />
          </Field>
          <Field label="Botón secundario" htmlFor="c-cta2" hint="Lleva a las ofertas">
            <Input id="c-cta2" value={draft.heroSecondaryCta} onChange={(e) => set("heroSecondaryCta", e.target.value)} />
          </Field>
          <Field label="Beneficio 1 (ícono de camión)" htmlFor="c-benefit1">
            <Input id="c-benefit1" value={draft.heroBenefit1} onChange={(e) => set("heroBenefit1", e.target.value)} />
          </Field>
          <Field label="Beneficio 2 (ícono de escudo)" htmlFor="c-benefit2">
            <Input id="c-benefit2" value={draft.heroBenefit2} onChange={(e) => set("heroBenefit2", e.target.value)} />
          </Field>

          <Button type="submit" size="lg" disabled={!dirty} icon={<Save className="size-4" aria-hidden="true" />}>
            {dirty ? "Guardar cambios" : "Sin cambios por guardar"}
          </Button>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stoka-ink-muted">Vista previa en vivo</p>
          <div className="overflow-hidden rounded-xl border border-stoka-border">
            <HeroContent content={draft} interactive={false} />
          </div>
        </div>
      </form>
    </div>
  );
}
