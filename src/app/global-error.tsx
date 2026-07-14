"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="nl">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Er ging iets mis</h1>
        <p>De applicatie kon deze pagina niet laden.</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Opnieuw proberen
        </button>
      </body>
    </html>
  );
}
