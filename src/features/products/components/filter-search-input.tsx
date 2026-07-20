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

  const submitForm = (form: HTMLFormElement | null) => {
    if (!form) return;
    // Lege number-velden niet meesturen: voorkomt minCap="" → per ongeluk 0 in de URL.
    const emptied: HTMLInputElement[] = [];
    for (const field of Array.from(form.elements)) {
      if (!(field instanceof HTMLInputElement)) continue;
      if (field.type !== "number") continue;
      if (field.value.trim() === "") {
        field.disabled = true;
        emptied.push(field);
      }
    }
    form.requestSubmit();
    for (const field of emptied) field.disabled = false;
  };

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
          submitForm(form);
        }, 350);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        submitForm(event.currentTarget.form);
      }}
    />
  );
}
