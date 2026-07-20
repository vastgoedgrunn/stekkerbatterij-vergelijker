"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

/**
 * Zoekveld met soft navigation (geen full GET-remount), zodat focus behouden blijft
 * tijdens typen. Debounce + Enter; form-submit blijft werken voor de rest van de filters.
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");
  const focusedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedRef = useRef(defaultValue ?? "");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Sync vanaf URL (chips / wissen) zonder focus te stelen tijdens typen.
  useEffect(() => {
    const fromUrl = searchParams.get(name) ?? "";
    if (focusedRef.current) return;
    if (fromUrl === lastPushedRef.current && fromUrl === value) return;
    setValue(fromUrl);
    lastPushedRef.current = fromUrl;
    // value bewust niet in deps: alleen URL-wijzigingen syncen
    // eslint-disable-next-line react-hooks/exhaustive-deps -- controlled sync from URL
  }, [searchParams, name]);

  const pushQuery = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();
    if (trimmed) params.set(name, trimmed);
    else params.delete(name);
    params.delete("pagina");
    lastPushedRef.current = trimmed;
    const qs = params.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false });
  };

  return (
    <Input
      id={id}
      name={name}
      type="search"
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;
      }}
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          pushQuery(next);
        }, 350);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        pushQuery(value);
      }}
    />
  );
}
