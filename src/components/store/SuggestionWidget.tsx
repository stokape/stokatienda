import { Lightbulb, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Field, Input, Textarea } from "../ui/form";
import { Modal } from "../ui/Modal";
import { useDataStore } from "../../store/dataStore";

/**
 * Botón flotante, visible en toda la tienda pública, para que un cliente
 * sugiera un producto que le gustaría encontrar (o cualquier otra idea) sin
 * tener que escribir ni llamar — queda guardado para el staff en
 * /admin/sugerencias. Nombre y celular son opcionales: puede mandarse anónima.
 */
export function SuggestionWidget() {
  const addSuggestion = useDataStore((s) => s.addSuggestion);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5) {
      toast.error("Cuéntanos un poco más — al menos unas palabras.");
      return;
    }
    setSubmitting(true);
    try {
      addSuggestion({
        message: message.trim(),
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      toast.success("¡Gracias por tu idea!", { description: "La tendremos en cuenta para seguir mejorando." });
      setMessage("");
      setName("");
      setPhone("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="¿Qué te falta? Sugiere un producto"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-stoka-red px-4 py-3 text-sm font-bold text-white shadow-pop transition-transform duration-200 hover:scale-105 sm:bottom-8 sm:right-8"
      >
        <span className="relative flex shrink-0 items-center justify-center">
          <span className="absolute size-2.5 animate-ping rounded-full bg-white/70" aria-hidden="true" />
          <Lightbulb className="size-5" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">¿Qué te falta?</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ayúdanos a mejorar" size="sm">
        <p className="mb-4 text-sm text-stoka-ink-muted">
          ¿Qué producto te gustaría encontrar en Bodeguita Stoka? ¿Qué otras cosas podríamos vender? Cuéntanos —
          nombre y celular son opcionales.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Tu sugerencia" htmlFor="sg-message" required>
            <Textarea
              id="sg-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: Me encantaría que vendan pan artesanal, o recargas de celular…"
              maxLength={400}
              autoFocus
            />
          </Field>
          <Field label="Tu nombre (opcional)" htmlFor="sg-name">
            <Input id="sg-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Tu celular (opcional)" htmlFor="sg-phone" hint="Por si queremos avisarte cuando lo tengamos.">
            <Input id="sg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={9} />
          </Field>
          <Button type="submit" size="lg" loading={submitting} icon={<Send className="size-4" aria-hidden="true" />}>
            Enviar sugerencia
          </Button>
        </form>
      </Modal>
    </>
  );
}
