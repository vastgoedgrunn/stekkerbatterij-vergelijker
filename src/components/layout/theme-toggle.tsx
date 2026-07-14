"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

function apply(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

/**
 * Thema-schakelaar (licht / donker / systeem). Slaat de keuze op in
 * localStorage; de no-flash init-script in de layout leest deze bij load.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
    // Synchroniseer de UI met de opgeslagen voorkeur na hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    setTheme(stored);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("theme") as Theme | null) === null) apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    apply(next);
  }

  const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Licht" },
    { value: "system", icon: Monitor, label: "Systeem" },
    { value: "dark", icon: Moon, label: "Donker" },
  ];

  return (
    <div
      className={cn(
        "border-border bg-muted/60 inline-flex items-center rounded-full border p-0.5",
        className,
      )}
      role="group"
      aria-label="Thema kiezen"
    >
      {options.map((opt) => {
        const active = mounted && theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => choose(opt.value)}
            aria-pressed={active}
            title={opt.label}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <opt.icon className="size-3.5" />
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
