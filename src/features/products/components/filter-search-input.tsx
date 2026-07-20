"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

/**
 * Zoekveld dat de filterformulier automatisch indient (debounce + Enter),
 * zodat typen direct resultaten filtert zonder alleen op "Filter toepassen" te leunen.
 */
export function FilterSearchInput({
  id,
  name,
  defaultValue,
  placeholder,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Input
      id={id}
      name={name}
      type="search"
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoComplete="off"
      onChange={(event) => {
        const form = event.currentTarget.form;
        if (!form) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          form.requestSubmit();
        }, 350);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        event.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
