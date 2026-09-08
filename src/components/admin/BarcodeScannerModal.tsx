import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { CameraOff, ScanBarcode } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/form";
import { Modal } from "../ui/Modal";

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
  title?: string;
}

type CameraStatus = "starting" | "scanning" | "unavailable";

/**
 * Escáner de código de barras para stockear productos desde el celular o
 * la cámara de la laptop: usa la cámara cuando está disponible (con
 * permiso del usuario) y siempre deja la alternativa de escribir el
 * código a mano, para equipos sin cámara o si el permiso es denegado.
 */
export function BarcodeScannerModal({ open, onClose, onDetected, title = "Escanear producto" }: BarcodeScannerModalProps) {
  const regionId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [manualCode, setManualCode] = useState("");

  // Ref con el callback más reciente: evita reiniciar la cámara cada vez
  // que el componente padre re-renderiza con una nueva función inline.
  const onDetectedRef = useRef(onDetected);
  useEffect(() => {
    onDetectedRef.current = onDetected;
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus("starting");

    const scanner = new Html5Qrcode(regionId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
      verbose: false,
    });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 140 } },
        (decodedText) => {
          if (cancelled) return;
          onDetectedRef.current(decodedText);
        },
        () => {
          // Fallo de lectura en un frame individual: normal mientras se enfoca, se ignora.
        },
      )
      .then(() => {
        if (!cancelled) setStatus("scanning");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
      const current = scannerRef.current;
      scannerRef.current = null;
      if (!current) return;
      const safeClear = () => {
        try {
          current.clear();
        } catch {
          // El contenedor ya pudo haberse desmontado; no hay nada que limpiar.
        }
      };
      try {
        // stop() lanza de forma síncrona (no solo rechaza la promesa) si la
        // cámara nunca llegó a iniciar (permiso denegado, sin cámara, o el
        // modal se cerró mientras aún decía "Activando cámara…").
        const state = current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          current.stop().catch(() => {}).finally(safeClear);
        } else {
          safeClear();
        }
      } catch {
        safeClear();
      }
    };
  }, [open, regionId]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualCode.trim()) {
      onDetected(manualCode.trim());
      setManualCode("");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-lg border border-stoka-border bg-stoka-black">
          <div id={regionId} className="aspect-[4/3] w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
          {status === "starting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stoka-black text-stoka-silver-light">
              <ScanBarcode className="size-8 animate-pulse" aria-hidden="true" />
              <p className="text-sm">Activando cámara…</p>
            </div>
          )}
          {status === "unavailable" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stoka-black px-6 text-center text-stoka-silver-light">
              <CameraOff className="size-8" aria-hidden="true" />
              <p className="text-sm">
                No pudimos acceder a la cámara. Revisa los permisos del navegador o ingresa el código manualmente.
              </p>
            </div>
          )}
          {status === "scanning" && (
            <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-stoka-red" aria-hidden="true" />
          )}
        </div>

        <form onSubmit={handleManualSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="O ingresa el código manualmente" htmlFor="manual-barcode">
              <Input
                id="manual-barcode"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej. 7751000000019"
                inputMode="numeric"
              />
            </Field>
          </div>
          <Button type="submit" disabled={!manualCode.trim()}>
            Buscar
          </Button>
        </form>
      </div>
    </Modal>
  );
}
