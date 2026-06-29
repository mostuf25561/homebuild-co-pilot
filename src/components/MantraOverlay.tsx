import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MantraOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mantras = useStore((s) => s.mantras);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * Math.max(mantras.length, 1)));

  useEffect(() => {
    if (open) setIdx(Math.floor(Math.random() * Math.max(mantras.length, 1)));
  }, [open, mantras.length]);

  if (!open) return null;
  const current = mantras[idx];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-8"
      onClick={onClose}
    >
      <button
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted"
        onClick={onClose}
        aria-label="סגור"
      >
        <X className="size-6" />
      </button>

      {/* breathing ring */}
      <div className="relative size-56 mb-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-breathe" />
        <div
          className="absolute inset-0 rounded-full border border-primary/50 animate-breathe"
          style={{ animationDelay: "1s" }}
        />
        <Sparkles className="size-12 text-primary" />
      </div>

      <p className="text-2xl md:text-3xl font-bold text-center max-w-2xl leading-relaxed text-foreground">
        {current?.text || "נשום עמוק. רק רגע אחד."}
      </p>

      {current?.tags && current.tags.length > 0 && (
        <div className="mt-6 flex gap-2 flex-wrap justify-center">
          {current.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 flex gap-3" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          onClick={() => setIdx((i) => (i + 1) % Math.max(mantras.length, 1))}
        >
          מנטרה אחרת
        </Button>
        <Button onClick={onClose}>חזרה</Button>
      </div>
    </div>
  );
}

export function MantraChip({ onOpen }: { onOpen: () => void }) {
  const mantras = useStore((s) => s.mantras);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % Math.max(mantras.length, 1));
    }, 30000);
    return () => clearInterval(t);
  }, [mantras.length]);

  if (mantras.length === 0) return null;
  const current = mantras[idx];

  return (
    <button
      onClick={onOpen}
      className={cn(
        "hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full",
        "bg-accent/50 hover:bg-accent text-accent-foreground border border-border max-w-xs",
      )}
      title="פתח מסך מנטרה"
    >
      <Sparkles className="size-3 shrink-0 text-primary" />
      <span className="truncate">{current?.text}</span>
    </button>
  );
}

export function MantraFloatingButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className={cn(
        "fixed bottom-20 md:bottom-6 left-6 z-30 size-12 rounded-full shadow-lg",
        "bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition",
      )}
      title="רגע של שקט"
      aria-label="פתח מסך מנטרה"
    >
      <Sparkles className="size-5" />
    </button>
  );
}
