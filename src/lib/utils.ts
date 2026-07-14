import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combineert conditionele class names en lost conflicterende
 * Tailwind-utilities correct op. Basis voor alle UI-componenten.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
